from django.urls import path
from rest_framework.routers import DefaultRouter

from .analytics import (
    ManagersAnalyticsView,
    ProductsAnalyticsView,
    SummaryAnalyticsView,
    TimeseriesAnalyticsView,
)
from .export import VisitsExportView
from .views import VisitViewSet

router = DefaultRouter()
router.register("visits", VisitViewSet, basename="visit")

urlpatterns = [
    path("analytics/summary/", SummaryAnalyticsView.as_view(), name="analytics-summary"),
    path("analytics/timeseries/", TimeseriesAnalyticsView.as_view(), name="analytics-timeseries"),
    path("analytics/managers/", ManagersAnalyticsView.as_view(), name="analytics-managers"),
    path("analytics/products/", ProductsAnalyticsView.as_view(), name="analytics-products"),
    path("export/visits/", VisitsExportView.as_view(), name="export-visits"),
    *router.urls,
]
