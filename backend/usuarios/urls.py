from django.urls import path
from .views import CsrfView, LoginView, LogoutView, PerfilView, RegistroView

urlpatterns = [
    path("csrf/", CsrfView.as_view()),
    path("registro/", RegistroView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", PerfilView.as_view()),
]