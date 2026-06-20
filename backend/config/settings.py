"""Django settings for the SFA CRM backend.

Конфигурация читается из переменных окружения (12-factor):
- локально   — из файла backend/.env (через python-dotenv, файл в .gitignore);
- на Railway — из Variables сервиса.
Безопасные значения по умолчанию рассчитаны на локальную разработку.
"""
import os
from datetime import timedelta
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()  # подхватывает backend/.env при локальном запуске
except ImportError:  # на проде python-dotenv может отсутствовать — не критично
    pass

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    return os.environ.get(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


# --- Core -------------------------------------------------------------------
SECRET_KEY = os.environ.get(
    "SECRET_KEY", "django-insecure-dev-key-change-me-in-production"
)
DEBUG = env_bool("DEBUG", False)  # на Railway оставить False; локально .env ставит True

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "")

# Railway подставляет публичный домен в рантайме — доверяем ему автоматически.
RAILWAY_DOMAIN = os.environ.get("RAILWAY_PUBLIC_DOMAIN")
if RAILWAY_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_DOMAIN)
    CSRF_TRUSTED_ORIGINS.append(f"https://{RAILWAY_DOMAIN}")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "corsheaders",
    "drf_spectacular",
    # Local
    "apps.users",
    "apps.catalog",
    "apps.visits",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # раздаёт статику Django admin / DRF
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --- Database ---------------------------------------------------------------
# Railway Postgres подставляет DATABASE_URL автоматически.
# Локально (без DATABASE_URL) используется SQLite.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=env_bool("DB_SSL_REQUIRE", False),
    )
}

# --- Auth -------------------------------------------------------------------
AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- I18N -------------------------------------------------------------------
LANGUAGE_CODE = "ru-ru"
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True

# --- Static / Media ---------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Медиа (фото накладных). На Railway указывает на смонтированный Volume через
# переменную MEDIA_ROOT (напр. /app/media) — иначе фото пропадут при редеплое.
MEDIA_URL = "media/"
MEDIA_ROOT = os.environ.get("MEDIA_ROOT", str(BASE_DIR / "media"))

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF --------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=12),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# --- OpenAPI / Swagger (drf-spectacular) ------------------------------------
SPECTACULAR_SETTINGS = {
    "TITLE": "SFA CRM API",
    "DESCRIPTION": "API для CRM/SFA молочной дистрибуции",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# --- CORS -------------------------------------------------------------------
# В разработке (DEBUG) разрешаем любой origin — Vite dev может занять любой порт.
# В продакшене — строгий список доменов из CORS_ALLOWED_ORIGINS (домен Vercel).
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
CORS_ALLOW_CREDENTIALS = True

# --- Security (только в продакшене) -----------------------------------------
if not DEBUG:
    # Railway терминирует TLS на прокси — доверяем заголовку X-Forwarded-Proto.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "0"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = bool(SECURE_HSTS_SECONDS)
    SECURE_HSTS_PRELOAD = bool(SECURE_HSTS_SECONDS)
