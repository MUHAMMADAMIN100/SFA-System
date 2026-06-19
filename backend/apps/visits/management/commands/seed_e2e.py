"""Детерминированные данные для e2e (Playwright). ЯВНО ДЛЯ ТЕСТОВ.

Создаёт/обновляет фиксированных e2e-пользователей и справочники и удаляет
прежние визиты e2e-менеджера, чтобы аналитика отражала ровно то, что отправит
сценарий теста. Идемпотентна.

Запуск:  python manage.py seed_e2e
"""
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.catalog.models import Product, Store
from apps.users.models import User
from apps.visits.models import Visit

ADMIN = ("e2e_admin", "e2e_pass_123")
MANAGER = ("e2e_manager", "e2e_pass_123")


class Command(BaseCommand):
    help = "[E2E] Детерминированные фикстуры для Playwright."

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            username=ADMIN[0],
            defaults={
                "role": User.Role.ADMIN,
                "full_name": "E2E Админ",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin.set_password(ADMIN[1])
        admin.role = User.Role.ADMIN
        admin.is_active = True
        admin.save()

        manager, _ = User.objects.get_or_create(
            username=MANAGER[0],
            defaults={"role": User.Role.MANAGER, "full_name": "E2E Менеджер"},
        )
        manager.set_password(MANAGER[1])
        manager.role = User.Role.MANAGER
        manager.full_name = "E2E Менеджер"
        manager.is_active = True
        manager.save()

        # Сброс визитов e2e-менеджера → чистая аналитика на каждый прогон.
        Visit.objects.filter(manager=manager).delete()

        for name in ["E2E Магазин 1", "E2E Магазин 2"]:
            Store.objects.get_or_create(name=name, defaults={"address": ""})

        for name, volume, price in [
            ("E2E Молоко", "1 л", Decimal("12000")),
            ("E2E Кефир", "0.5 л", Decimal("8000")),
        ]:
            product, _ = Product.objects.get_or_create(
                name=name, volume=volume, defaults={"price": price}
            )
            product.is_active = True
            product.save()

        # Аналитика по товарам глобальна (сумма по всем менеджерам), поэтому для
        # детерминизма чистим любые визиты, ссылающиеся на e2e-товары.
        Visit.objects.filter(
            items__product__name__in=["E2E Молоко", "E2E Кефир"]
        ).delete()

        self.stdout.write(self.style.SUCCESS("E2E seed готов."))
