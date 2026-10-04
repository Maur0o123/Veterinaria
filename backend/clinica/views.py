from datetime import date, time, timedelta

from django.conf import settings
from django.db.models import ProtectedError
from django.utils import timezone
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from rest_framework.views import APIView

from usuarios.permisos import EsAdmin

from .disponibilidad import combinar_local, resumen_mes, slots_disponibles
from .models import Bloqueo, Cita, Horario, Mascota
from .serializers import (
    BloqueoSerializer,
    CitaCrearSerializer,
    CitaPanelSerializer,
    CitaSerializer,
    HorarioSerializer,
    MascotaSerializer,
)


class MascotaViewSet(viewsets.ModelViewSet):
    serializer_class = MascotaSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Mascota.objects.filter(dueno=self.request.user)

    def perform_create(self, serializer):
        serializer.save(dueno=self.request.user)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "No puedes eliminar una mascota con citas registradas."},
                status=status.HTTP_409_CONFLICT,
            )


class DisponibilidadView(APIView):
    def get(self, request):
        mes = request.query_params.get("mes")
        fecha = request.query_params.get("fecha")
        try:
            if mes:
                anio, numero = (int(parte) for parte in mes.split("-"))
                date(anio, numero, 1)
                return Response(resumen_mes(anio, numero))
            if fecha:
                dia = date.fromisoformat(fecha)
                bloques = slots_disponibles(dia)
                return Response(
                    [
                        {
                            "inicio": b.isoformat(),
                            "hora": timezone.localtime(b).strftime("%H:%M"),
                        }
                        for b in bloques
                    ]
                )
        except ValueError:
            pass
        return Response({"detail": "Parámetros inválidos."}, status=status.HTTP_400_BAD_REQUEST)


class CitaViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    def get_queryset(self):
        return (
            Cita.objects.filter(cliente=self.request.user)
            .select_related("mascota")
            .order_by("-inicio")
        )

    def get_serializer_class(self):
        return CitaCrearSerializer if self.action == "create" else CitaSerializer

    def get_throttles(self):
        if self.action == "create":
            self.throttle_scope = "citas_crear"
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cita = serializer.save()
        return Response(CitaSerializer(cita).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def cancelar(self, request, pk=None):
        cita = self.get_object()
        if not cita.cancelable_por_cliente():
            return Response(
                {
                    "detail": f"Solo puedes cancelar con al menos {settings.CITA_CANCELACION_HORAS} horas de anticipación."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        cita.estado = Cita.Estado.CANCELADA
        cita.save(update_fields=["estado", "actualizada"])
        return Response(CitaSerializer(cita).data)


class CitaPanelViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [EsAdmin]
    serializer_class = CitaPanelSerializer
    http_method_names = ["get", "patch", "head", "options"]
    filter_backends = [filters.SearchFilter]
    search_fields = [
        "cliente__email", "cliente__first_name", "cliente__last_name", "mascota__nombre",
    ]

    def _fecha(self, nombre, defecto):
        valor = self.request.query_params.get(nombre)
        if not valor:
            return defecto
        try:
            return date.fromisoformat(valor)
        except ValueError:
            raise ParseError(f"Fecha inválida en '{nombre}'.")

    def get_queryset(self):
        consulta = Cita.objects.select_related("cliente", "mascota").order_by("inicio")
        if self.action != "list":
            return consulta
        desde = self._fecha("desde", timezone.localdate().replace(day=1))
        hasta = self._fecha("hasta", desde + timedelta(days=31))
        if hasta < desde or (hasta - desde).days > 62:
            raise ParseError("El rango debe ser de máximo 62 días.")
        consulta = consulta.filter(
            inicio__gte=combinar_local(desde, time.min),
            inicio__lt=combinar_local(hasta + timedelta(days=1), time.min),
        )
        estado = self.request.query_params.get("estado")
        if estado in Cita.Estado.values:
            consulta = consulta.filter(estado=estado)
        return consulta


class HorarioPanelViewSet(viewsets.ModelViewSet):
    permission_classes = [EsAdmin]
    serializer_class = HorarioSerializer
    queryset = Horario.objects.all().order_by("dia_semana", "hora_inicio")
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]


class BloqueoPanelViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [EsAdmin]
    serializer_class = BloqueoSerializer

    def get_queryset(self):
        return Bloqueo.objects.filter(fin__gte=timezone.now()).order_by("inicio")