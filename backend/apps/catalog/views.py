from django.db.models import ProtectedError
from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.users.permissions import IsAdminOrReadOnly

from .models import Product, Store
from .serializers import ProductSerializer, StoreSerializer


class ProtectedDeleteMixin:
    """Возвращает понятный 409 при удалении объекта со связанными визитами
    (FK on_delete=PROTECT), вместо «голого» 500."""

    protected_detail = "Невозможно удалить: есть связанные визиты."

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {"detail": self.protected_detail},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class StoreViewSet(ProtectedDeleteMixin, viewsets.ModelViewSet):
    """Магазины. Чтение — все авторизованные, запись — только администратор."""

    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None  # справочник целиком (для select и CRUD-таблиц)
    protected_detail = "Невозможно удалить магазин: есть связанные визиты."


class ProductViewSet(ProtectedDeleteMixin, viewsets.ModelViewSet):
    """Товары. Чтение — все авторизованные, запись — только администратор."""

    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None
    protected_detail = (
        "Невозможно удалить товар: он фигурирует в визитах. "
        "Деактивируйте его вместо удаления."
    )

    def get_queryset(self):
        queryset = Product.objects.all()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() in ("true", "1"))
        return queryset
