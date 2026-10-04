from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import CitaViewSet, DisponibilidadView, MascotaViewSet

router = SimpleRouter()
router.register("mascotas", MascotaViewSet, basename="mascotas")
router.register("citas", CitaViewSet, basename="citas")

urlpatterns = [
    path("citas/disponibilidad/", DisponibilidadView.as_view()),
    *router.urls,
]