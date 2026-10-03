from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import filters, generics, status, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Usuario
from .permisos import EsAdmin
from .serializers import (
    PerfilSerializer,
    RegistroSerializer,
    UsuarioAdminSerializer,
    UsuarioCrearAdminSerializer,
)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    """Entrega la cookie CSRF al frontend."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"detail": "ok"})


@method_decorator(csrf_protect, name="dispatch")
class RegistroView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "registro"

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(PerfilSerializer(user).data, status=status.HTTP_201_CREATED)


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        password = str(request.data.get("password", ""))
        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {"detail": "Email o contraseña incorrectos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        login(request, user)
        return Response(PerfilSerializer(user).data)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PerfilView(generics.RetrieveAPIView):
    serializer_class = PerfilSerializer

    def get_object(self):
        return self.request.user



class PaginacionUsuarios(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class UsuarioPanelViewSet(viewsets.ModelViewSet):
    """Listar, crear y editar usuarios. No hay DELETE: se desactivan."""

    permission_classes = [EsAdmin]
    pagination_class = PaginacionUsuarios
    filter_backends = [filters.SearchFilter]
    search_fields = ["email", "first_name", "last_name"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        qs = Usuario.objects.all().order_by("-date_joined")
        rol = self.request.query_params.get("rol")
        if rol in Usuario.Rol.values:
            qs = qs.filter(rol=rol)
        estado = self.request.query_params.get("estado")
        if estado == "activo":
            qs = qs.filter(is_active=True)
        elif estado == "inactivo":
            qs = qs.filter(is_active=False)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return UsuarioCrearAdminSerializer
        return UsuarioAdminSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        salida = UsuarioAdminSerializer(usuario, context=self.get_serializer_context())
        return Response(salida.data, status=status.HTTP_201_CREATED)