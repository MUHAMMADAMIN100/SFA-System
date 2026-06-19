from rest_framework import viewsets
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
