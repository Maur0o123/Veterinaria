from rest_framework.routers import SimpleRouter

from .views import UsuarioPanelViewSet

router = SimpleRouter()
router.register("usuarios", UsuarioPanelViewSet, basename="panel-usuarios")

urlpatterns = router.urls