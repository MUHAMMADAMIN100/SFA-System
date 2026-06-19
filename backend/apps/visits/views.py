from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.permissions import IsAdmin, IsManager

from .models import Visit
from .serializers import VisitReadSerializer, VisitWriteSerializer


def filter_visits_by_date(queryset, params):
    """Применяет фильтры по диапазону дат к queryset визитов."""
    date_from = params.get("date_from")
    date_to = params.get("date_to")
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)
    return queryset


@extend_schema_view(
    list=extend_schema(
        summary="Лента визитов (администратор)",
        parameters=[
            OpenApiParameter("date_from", OpenApiTypes.DATE, OpenApiParameter.QUERY),
            OpenApiParameter("date_to", OpenApiTypes.DATE, OpenApiParameter.QUERY),
            OpenApiParameter("manager", OpenApiTypes.INT, OpenApiParameter.QUERY),
            OpenApiParameter("store", OpenApiTypes.INT, OpenApiParameter.QUERY),
        ],
    ),
    create=extend_schema(
        summary="Создать визит (multipart/form-data)",
        description=(
            "Поля формы: `store` (id магазина), `invoice_photo` (файл фото "
            "накладной), `items` — JSON-строка со списком "
            "`{product, shipped_qty, expired_qty}`. Менеджер берётся из токена, "
            "поле `manager` в теле игнорируется."
        ),
        request=VisitWriteSerializer,
        responses=VisitReadSerializer,
    ),
    my=extend_schema(summary="Свои визиты (менеджер)"),
)
class VisitViewSet(viewsets.ModelViewSet):
    """Визиты: создание — менеджер, лента — администратор."""

    http_method_names = ["get", "post", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return VisitWriteSerializer
        return VisitReadSerializer

    def get_permissions(self):
        if self.action in ("create", "my"):
            return [IsManager()]
        return [IsAdmin()]

    def get_queryset(self):
        queryset = (
            Visit.objects.select_related("manager", "store")
            .prefetch_related("items__product")
            .all()
        )
        if self.action == "my":
            return queryset.filter(manager=self.request.user)
        # Лента администратора: фильтры по дате, менеджеру, магазину.
        params = self.request.query_params
        queryset = filter_visits_by_date(queryset, params)
        manager = params.get("manager")
        store = params.get("store")
        if manager:
            queryset = queryset.filter(manager_id=manager)
        if store:
            queryset = queryset.filter(store_id=store)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        visit = serializer.save(manager=request.user)
        read = VisitReadSerializer(visit, context=self.get_serializer_context())
        return Response(read.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def my(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = VisitReadSerializer(
            page, many=True, context=self.get_serializer_context()
        )
        return self.get_paginated_response(serializer.data)
