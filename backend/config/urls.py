"""Root URL configuration."""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve as media_serve
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import RoleTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Auth
    path("api/auth/login/", RoleTokenObtainPairView.as_view(), name="login"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # OpenAPI / Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Apps
    path("api/", include("apps.catalog.urls")),
    path("api/", include("apps.visits.urls")),
    # Медиа (фото накладных). Раздаётся Django и в проде — на Railway файлы лежат
    # на смонтированном Volume (MEDIA_ROOT). Для внутренней системы это допустимо;
    # при росте нагрузки перейти на объектное хранилище (Cloudinary / S3 / R2).
    re_path(
        r"^media/(?P<path>.*)$",
        media_serve,
        {"document_root": settings.MEDIA_ROOT},
    ),
]
