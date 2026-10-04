from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from .disponibilidad import slots_disponibles
from .models import Bloqueo, Cita, Horario, Mascota


class MascotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascota
        fields = ["id", "nombre", "especie", "raza", "fecha_nacimiento"]

    def validate_fecha_nacimiento(self, value):
        if value and value > timezone.localdate():
            raise serializers.ValidationError("La fecha no puede estar en el futuro.")
        return value

    def validate(self, attrs):
        usuario = self.context["request"].user
        if self.instance is None and usuario.mascotas.count() >= settings.MASCOTAS_MAXIMAS:
            raise serializers.ValidationError(
                f"Puedes registrar hasta {settings.MASCOTAS_MAXIMAS} mascotas."
            )
        return attrs


class MascotaResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mascota
        fields = ["id", "nombre", "especie"]


class FechaHoraMixin(serializers.Serializer):
    fecha = serializers.SerializerMethodField()
    hora = serializers.SerializerMethodField()

    def get_fecha(self, obj):
        return timezone.localtime(obj.inicio).date().isoformat()

    def get_hora(self, obj):
        return timezone.localtime(obj.inicio).strftime("%H:%M")


class CitaSerializer(FechaHoraMixin, serializers.ModelSerializer):
    mascota = MascotaResumenSerializer(read_only=True)
    puede_cancelar = serializers.SerializerMethodField()

    class Meta:
        model = Cita
        fields = ["id", "mascota", "fecha", "hora", "motivo", "estado", "puede_cancelar"]
        read_only_fields = fields

    def get_puede_cancelar(self, obj):
        return obj.cancelable_por_cliente()


class CitaCrearSerializer(serializers.ModelSerializer):
    mascota = serializers.PrimaryKeyRelatedField(queryset=Mascota.objects.none())

    class Meta:
        model = Cita
        fields = ["mascota", "inicio", "motivo"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request is not None:
            self.fields["mascota"].queryset = Mascota.objects.filter(dueno=request.user)

    def validate_inicio(self, value):
        if value not in slots_disponibles(timezone.localtime(value).date()):
            raise serializers.ValidationError("Ese horario no está disponible.")
        return value

    def validate(self, attrs):
        usuario = self.context["request"].user
        activas = Cita.objects.filter(
            cliente=usuario, estado=Cita.Estado.CONFIRMADA, inicio__gte=timezone.now()
        ).count()
        if activas >= settings.CITA_MAX_ACTIVAS:
            raise serializers.ValidationError(
                f"Ya tienes {activas} citas activas. Cancela una o espera a que se realice para agendar otra."
            )
        return attrs

    def create(self, datos):
        fin = datos["inicio"] + timedelta(minutes=settings.CITA_DURACION_MINUTOS)
        try:
            with transaction.atomic():
                return Cita.objects.create(
                    cliente=self.context["request"].user, fin=fin, **datos
                )
        except IntegrityError:
            raise serializers.ValidationError(
                {"inicio": "Ese horario acaba de ser reservado por otra persona."}
            )


class ClienteResumenSerializer(serializers.ModelSerializer):
    nombre = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ["id", "nombre", "email", "telefono"]

    def get_nombre(self, obj):
        return obj.get_full_name()


class CitaPanelSerializer(FechaHoraMixin, serializers.ModelSerializer):
    mascota = MascotaResumenSerializer(read_only=True)
    cliente = ClienteResumenSerializer(read_only=True)

    class Meta:
        model = Cita
        fields = [
            "id", "cliente", "mascota", "fecha", "hora",
            "motivo", "estado", "notas_admin",
        ]
        read_only_fields = ["id", "cliente", "mascota", "fecha", "hora", "motivo"]
        extra_kwargs = {"notas_admin": {"max_length": 1000}}

    def validate_estado(self, nuevo):
        actual = self.instance.estado
        if nuevo == actual:
            return nuevo
        if actual != Cita.Estado.CONFIRMADA:
            raise serializers.ValidationError("Una cita cerrada no puede cambiar de estado.")
        realizada = nuevo in (Cita.Estado.COMPLETADA, Cita.Estado.NO_ASISTIO)
        if realizada and self.instance.inicio > timezone.now():
            raise serializers.ValidationError(
                "No puedes marcar como realizada una cita que aún no comienza."
            )
        return nuevo


class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = ["id", "dia_semana", "hora_inicio", "hora_fin", "activo"]

    def validate(self, attrs):
        inicio = attrs.get("hora_inicio", getattr(self.instance, "hora_inicio", None))
        fin = attrs.get("hora_fin", getattr(self.instance, "hora_fin", None))
        if inicio and fin and fin <= inicio:
            raise serializers.ValidationError(
                {"hora_fin": "La hora de término debe ser posterior a la de inicio."}
            )
        return attrs


class BloqueoSerializer(serializers.ModelSerializer):
    citas_afectadas = serializers.SerializerMethodField()

    class Meta:
        model = Bloqueo
        fields = ["id", "inicio", "fin", "motivo", "citas_afectadas"]

    def validate(self, attrs):
        if attrs["fin"] <= attrs["inicio"]:
            raise serializers.ValidationError({"fin": "El término debe ser posterior al inicio."})
        return attrs

    def get_citas_afectadas(self, obj):
        return Cita.objects.filter(
            estado=Cita.Estado.CONFIRMADA, inicio__lt=obj.fin, fin__gt=obj.inicio
        ).count()