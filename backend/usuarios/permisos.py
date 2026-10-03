from rest_framework.permissions import BasePermission


class EsAdmin(BasePermission):
    message = "Solo los administradores pueden realizar esta acción."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.es_admin)