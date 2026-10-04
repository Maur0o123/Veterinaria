from rest_framework.routers import SimpleRouter

from .views import BloqueoPanelViewSet, CitaPanelViewSet, HorarioPanelViewSet

router = SimpleRouter()
router.register("citas", CitaPanelViewSet, basename="panel-citas")
router.register("horarios", HorarioPanelViewSet, basename="panel-horarios")
router.register("bloqueos", BloqueoPanelViewSet, basename="panel-bloqueos")

urlpatterns = router.urls