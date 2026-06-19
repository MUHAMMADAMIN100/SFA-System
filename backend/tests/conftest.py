import io
from decimal import Decimal

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from apps.catalog.models import Product, Store
from apps.users.models import User
from apps.visits.models import Visit, VisitItem


def make_image(name="invoice.jpg"):
    """Генерирует небольшое JPEG-изображение в памяти (накладная для тестов)."""
    buf = io.BytesIO()
    Image.new("RGB", (200, 150), (180, 190, 200)).save(buf, "JPEG")
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type="image/jpeg")


@pytest.fixture(autouse=True)
def media_root(settings, tmp_path):
    """Загрузки в тестах пишем во временную папку, не в dev-media."""
    settings.MEDIA_ROOT = str(tmp_path)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="t_admin",
        password="adminpass123",
        role=User.Role.ADMIN,
        full_name="Тест Админ",
        is_staff=True,
        is_superuser=True,
    )


@pytest.fixture
def manager_user(db):
    return User.objects.create_user(
        username="t_manager",
        password="managerpass123",
        role=User.Role.MANAGER,
        full_name="Тест Менеджер",
    )


@pytest.fixture
def other_manager(db):
    return User.objects.create_user(
        username="t_manager2",
        password="managerpass456",
        role=User.Role.MANAGER,
        full_name="Другой Менеджер",
    )


@pytest.fixture
def manager_client(api_client, manager_user):
    api_client.force_authenticate(manager_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    return api_client


@pytest.fixture
def stores(db):
    return [
        Store.objects.create(name="Магазин А"),
        Store.objects.create(name="Магазин Б", address="ул. Тестовая, 1"),
    ]


@pytest.fixture
def products(db):
    return [
        Product.objects.create(name="Молоко", volume="1 л", price=Decimal("12000")),
        Product.objects.create(name="Кефир", volume="0.5 л", price=Decimal("8000")),
    ]


@pytest.fixture
def invoice_image():
    return make_image()


@pytest.fixture
def make_visit(db):
    """Фабрика визитов: items = [(product, shipped, expired), ...]."""

    def _make(manager, store, items, created_at=None):
        visit = Visit.objects.create(
            manager=manager, store=store, invoice_photo=make_image()
        )
        for product, shipped, expired in items:
            VisitItem.objects.create(
                visit=visit, product=product, shipped_qty=shipped, expired_qty=expired
            )
        if created_at is not None:
            Visit.objects.filter(pk=visit.pk).update(created_at=created_at)
            visit.refresh_from_db()
        return visit

    return _make
