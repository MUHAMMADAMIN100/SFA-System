"""Минимальный seed для проверки системы. ЯВНО ПОМЕЧЕН КАК SEED — не для продакшена.

Создаёт одного администратора, одного менеджера и несколько записей справочников.
Запуск:  python manage.py seed
"""
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.catalog.models import Product, Store
from apps.users.models import User


class Command(BaseCommand):
    help = "[SEED] Минимальные тестовые данные для проверки системы."

    def handle(self, *args, **options):
        # --- Администратор (также суперпользователь для доступа в Django admin) ---
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "role": User.Role.ADMIN,
                "full_name": "Администратор (seed)",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Создан admin / admin123"))

        # --- Менеджер ---
        manager, created = User.objects.get_or_create(
            username="manager1",
            defaults={"role": User.Role.MANAGER, "full_name": "Иванов Иван (seed)"},
        )
        if created:
            manager.set_password("manager123")
            manager.save()
            self.stdout.write(self.style.SUCCESS("Создан manager1 / manager123"))

        # --- Магазины (seed) ---
        for name, address in [
            ("Магазин «Ромашка» (seed)", "ул. Центральная, 1"),
            ("Магазин «Берёзка» (seed)", "пр. Мира, 25"),
        ]:
            Store.objects.get_or_create(name=name, defaults={"address": address})

        # --- Товары (seed) ---
        for name, volume, price in [
            ("Молоко (seed)", "1 л", Decimal("12000")),
            ("Кефир (seed)", "500 г", Decimal("8000")),
            ("Сметана (seed)", "250 г", Decimal("9500")),
        ]:
            Product.objects.get_or_create(
                name=name, volume=volume, defaults={"price": price}
            )

        self.stdout.write(self.style.SUCCESS("Seed выполнен."))
