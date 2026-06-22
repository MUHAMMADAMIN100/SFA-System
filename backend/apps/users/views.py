from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsAdmin
from .serializers import ManagerSerializer, RoleTokenObtainPairSerializer


class RoleTokenObtainPairView(TokenObtainPairView):
    serializer_class = RoleTokenObtainPairSerializer


class ManagerViewSet(viewsets.ModelViewSet):
    """Справочник менеджеров. Доступ — только администратор."""

    serializer_class = ManagerSerializer
    permission_classes = [IsAdmin]
    pagination_class = None
    queryset = User.objects.filter(role=User.Role.MANAGER).order_by("full_name", "username")

    def destroy(self, request, *args, **kwargs):
        """Удаление менеджера. Если есть связанные визиты (FK PROTECT) —
        отдаём понятный 409 вместо 500 и подсказываем деактивировать."""
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {
                    "detail": "Невозможно удалить менеджера: есть связанные визиты. "
                    "Деактивируйте его вместо удаления."
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
