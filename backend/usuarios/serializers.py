from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Usuario


class RegistroSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, max_length=128)
    password2 = serializers.CharField(write_only=True, max_length=128)

    class Meta:
        model = Usuario
        fields = ["email", "first_name", "last_name", "telefono", "password", "password2"]

    def validate_email(self, value):
        value = value.strip().lower()
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden."})
        candidato = Usuario(
            email=attrs["email"],
            first_name=attrs.get("first_name", ""),
            last_name=attrs.get("last_name", ""),
        )
        try:
            validate_password(attrs["password"], user=candidato)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return attrs

    def create(self, data):
        data.pop("password2")
        password = data.pop("password")
        return Usuario.objects.create_user(username=data["email"], password=password, **data)


class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "email", "first_name", "last_name", "telefono", "rol"]
        read_only_fields = fields



class UsuarioAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id", "email", "first_name", "last_name", "telefono",
            "rol", "is_active", "date_joined", "last_login",
        ]
        read_only_fields = ["id", "email", "date_joined", "last_login"]

    def validate(self, attrs):
        request = self.context["request"]
        if self.instance is not None and self.instance.pk == request.user.pk:
            if attrs.get("rol", self.instance.rol) != Usuario.Rol.ADMIN:
                raise serializers.ValidationError(
                    {"rol": "No puedes quitarte tu propio rol de administrador."}
                )
            if attrs.get("is_active", self.instance.is_active) is False:
                raise serializers.ValidationError(
                    {"is_active": "No puedes desactivar tu propia cuenta."}
                )
        return attrs


class UsuarioCrearAdminSerializer(RegistroSerializer):
    """Igual que el registro, pero el admin puede elegir el rol."""

    class Meta(RegistroSerializer.Meta):
        fields = RegistroSerializer.Meta.fields + ["rol"]