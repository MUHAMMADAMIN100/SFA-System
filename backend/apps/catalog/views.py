from rest_framework import viewsets

from apps.users.permissions import IsAdminOrReadOnly

from .models import Product, Store
from .serializers import ProductSerializer, StoreSerializer


class StoreViewSet(viewsets.ModelViewSet):
    """Магазины. Чтение — все авторизованные, запись — только администратор."""

    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None  # справочник целиком (для select и CRUD-таблиц)


class ProductViewSet(viewsets.ModelViewSet):
    """Товары. Чтение — все авторизованные, запись — только администратор."""

    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        queryset = Product.objects.all()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() in ("true", "1"))
        return queryset
