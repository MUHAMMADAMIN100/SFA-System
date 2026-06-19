from django.db.models import Count, Sum
from django.db.models.functions import Coalesce, TruncDate
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsAdmin

from .models import Visit, VisitItem
from .views import filter_visits_by_date


def _percent(expired: int, shipped: int) -> float:
    """Процент просрочки от отгрузки с защитой от деления на ноль."""
    if not shipped:
        return 0.0
    return round(expired / shipped * 100, 2)


DATE_PARAMS = [
    OpenApiParameter(
        "date_from", OpenApiTypes.DATE, OpenApiParameter.QUERY,
        description="Начало периода (YYYY-MM-DD)",
    ),
    OpenApiParameter(
        "date_to", OpenApiTypes.DATE, OpenApiParameter.QUERY,
        description="Конец периода (YYYY-MM-DD)",
    ),
]


# --- Сериализаторы ответов (для документации) -------------------------------
class ManagerKpiSerializer(serializers.Serializer):
    manager_id = serializers.IntegerField()
    manager_name = serializers.CharField()
    stores_visited = serializers.IntegerField()
    shipped_total = serializers.IntegerField()
    expired_total = serializers.IntegerField()
    expired_percent = serializers.FloatField()


class ProductKpiSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    product_volume = serializers.CharField()
    shipped_total = serializers.IntegerField()
    expired_total = serializers.IntegerField()
    expired_percent = serializers.FloatField()


class SummarySerializer(serializers.Serializer):
    shipped_total = serializers.IntegerField()
    expired_total = serializers.IntegerField()
    expired_percent = serializers.FloatField()
    stores_visited = serializers.IntegerField()
    active_managers = serializers.IntegerField()


class TimeseriesPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    shipped = serializers.IntegerField()
    expired = serializers.IntegerField()


def _filter_items_by_date(queryset, params):
    date_from = params.get("date_from")
    date_to = params.get("date_to")
    if date_from:
        queryset = queryset.filter(visit__created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(visit__created_at__date__lte=date_to)
    return queryset


# --- Виды -------------------------------------------------------------------
@extend_schema(
    parameters=DATE_PARAMS,
    responses=SummarySerializer,
    summary="Сводные метрики за период",
)
class SummaryAnalyticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = filter_visits_by_date(Visit.objects.all(), request.query_params)
        agg = qs.aggregate(
            shipped_total=Coalesce(Sum("items__shipped_qty"), 0),
            expired_total=Coalesce(Sum("items__expired_qty"), 0),
            stores_visited=Count("store", distinct=True),
            active_managers=Count("manager", distinct=True),
        )
        return Response(
            {
                "shipped_total": agg["shipped_total"],
                "expired_total": agg["expired_total"],
                "expired_percent": _percent(agg["expired_total"], agg["shipped_total"]),
                "stores_visited": agg["stores_visited"],
                "active_managers": agg["active_managers"],
            }
        )


@extend_schema(
    parameters=DATE_PARAMS,
    responses=TimeseriesPointSerializer(many=True),
    summary="Динамика отгрузки/просрочки по дням",
)
class TimeseriesAnalyticsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        qs = filter_visits_by_date(Visit.objects.all(), request.query_params)
        rows = (
            qs.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(
                shipped=Coalesce(Sum("items__shipped_qty"), 0),
                expired=Coalesce(Sum("items__expired_qty"), 0),
            )
            .order_by("day")
        )
        data = [
            {
                "date": row["day"].isoformat(),
                "shipped": row["shipped"],
                "expired": row["expired"],
            }
            for row in rows
        ]
        return Response(data)


@extend_schema(
    parameters=DATE_PARAMS,
    responses=ManagerKpiSerializer(many=True),
    summary="KPI по менеджерам за период",
)
class ManagersAnalyticsView(APIView):
    """KPI по менеджерам за период (агрегация через ORM)."""

    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = filter_visits_by_date(Visit.objects.all(), request.query_params)
        rows = (
            queryset.values("manager", "manager__full_name", "manager__username")
            .annotate(
                stores_visited=Count("store", distinct=True),
                shipped_total=Coalesce(Sum("items__shipped_qty"), 0),
                expired_total=Coalesce(Sum("items__expired_qty"), 0),
            )
            .order_by("manager__full_name", "manager__username")
        )

        data = [
            {
                "manager_id": row["manager"],
                "manager_name": row["manager__full_name"] or row["manager__username"],
                "stores_visited": row["stores_visited"],
                "shipped_total": row["shipped_total"],
                "expired_total": row["expired_total"],
                "expired_percent": _percent(row["expired_total"], row["shipped_total"]),
            }
            for row in rows
        ]
        return Response(data)


@extend_schema(
    parameters=DATE_PARAMS,
    responses=ProductKpiSerializer(many=True),
    summary="Аналитика по товарам за период",
)
class ProductsAnalyticsView(APIView):
    """Аналитика по товарам за период (агрегация через ORM)."""

    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = _filter_items_by_date(VisitItem.objects.all(), request.query_params)
        rows = (
            queryset.values("product", "product__name", "product__volume")
            .annotate(
                shipped_total=Coalesce(Sum("shipped_qty"), 0),
                expired_total=Coalesce(Sum("expired_qty"), 0),
            )
            .order_by("product__name")
        )

        data = [
            {
                "product_id": row["product"],
                "product_name": row["product__name"],
                "product_volume": row["product__volume"],
                "shipped_total": row["shipped_total"],
                "expired_total": row["expired_total"],
                "expired_percent": _percent(row["expired_total"], row["shipped_total"]),
            }
            for row in rows
        ]
        return Response(data)
