"""Демонстрационные данные для SFA CRM. ЯВНО ПОМЕЧЕН КАК SEED — не для продакшена.

Наполняет систему «как настоящую»: администратор, 12 менеджеров, 14 магазинов,
14 товаров и ~55 визитов с фотографиями накладных, чтобы дашборд, лента и
аналитика выглядели реалистично.

Запуск:  python manage.py seed
Сброс и пересоздание визитов:  python manage.py seed --reset-visits
Идемпотентна: справочники не дублируются, а визиты при необходимости
пересоздаются с нуля.
"""
import random
from datetime import timedelta
from decimal import Decimal
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from PIL import Image, ImageDraw

from apps.catalog.models import Product, Store
from apps.users.models import User
from apps.visits.models import Visit, VisitItem

# Детерминированный генератор — один и тот же seed даёт одинаковую картину.
RNG = random.Random(2024)

# --- Менеджеры (ФИО, логин, активность) -------------------------------------
MANAGERS = [
    ("Иванов Иван Сергеевич", "manager1", True),
    ("Петров Пётр Алексеевич", "manager2", True),
    ("Сидорова Анна Викторовна", "manager3", True),
    ("Кузнецова Мария Дмитриевна", "manager4", True),
    ("Смирнов Алексей Николаевич", "manager5", True),
    ("Волков Дмитрий Олегович", "manager6", True),
    ("Морозова Елена Андреевна", "manager7", True),
    ("Новиков Артём Игоревич", "manager8", True),
    ("Фёдорова Ольга Павловна", "manager9", False),
    ("Соколов Николай Романович", "manager10", True),
    ("Лебедева Татьяна Сергеевна", "manager11", False),
    ("Орлов Михаил Владимирович", "manager12", True),
]

# --- Магазины (название, адрес) ----------------------------------------------
STORES = [
    ("Корзинка — Чиланзар", "г. Ташкент, ул. Бунёдкор, 12"),
    ("Makro — Юнусабад", "г. Ташкент, пр. Амира Темура, 45"),
    ("Havas — Мирабад", "г. Ташкент, ул. Шахрисабз, 8"),
    ("Magnum — Сергели", "г. Ташкент, ул. Янги Сергели, 21"),
    ("Универсам «Центральный»", "г. Ташкент, ул. Навои, 3"),
    ("Магазин «Ромашка»", "г. Ташкент, ул. Мустакиллик, 56"),
    ("Магазин «Берёзка»", "г. Ташкент, ул. Беруни, 17"),
    ("Минимаркет «У дома»", "г. Ташкент, мкр. Каракамыш, д. 4/2"),
    ("Гастроном «Восток»", "г. Ташкент, ул. Фароби, 99"),
    ("ТЦ «Самарканд Дарвоза»", "г. Ташкент, ул. Коратош, 5А"),
    ("Продукты «Лола»", "г. Ташкент, ул. Зульфияхоним, 30"),
    ("Супермаркет «Олма»", "г. Ташкент, мкр. Сабир Рахимов, 11"),
    ("Магазин «Дустлик»", "г. Самарканд, ул. Регистан, 2"),
    ("Маркет «Бахор»", "г. Бухара, ул. Накшбанди, 14"),
]

# --- Товары (название, объём/вес, цена, активность) --------------------------
PRODUCTS = [
    ("Молоко пастеризованное", "1 л", Decimal("12000"), True),
    ("Кефир 2.5%", "0.5 л", Decimal("8000"), True),
    ("Сметана 20%", "250 г", Decimal("9500"), True),
    ("Творог 5%", "200 г", Decimal("11000"), True),
    ("Йогурт питьевой", "150 г", Decimal("6000"), True),
    ("Ряженка 4%", "0.5 л", Decimal("8500"), True),
    ("Масло сливочное 82.5%", "200 г", Decimal("21000"), True),
    ("Сыр «Российский»", "1 кг", Decimal("78000"), True),
    ("Сливки 10%", "0.5 л", Decimal("14000"), True),
    ("Айран", "0.5 л", Decimal("5000"), True),
    ("Простокваша", "0.5 л", Decimal("7500"), True),
    ("Молоко топлёное", "0.9 л", Decimal("13000"), True),
    ("Сырок глазированный", "50 г", Decimal("4000"), True),
    ("Кумыс натуральный", "0.5 л", Decimal("16000"), False),
]


def _make_invoice_image(label: str) -> ContentFile:
    """Рисует простое фото-подобие накладной, чтобы ImageField был валиден."""
    width, height = 480, 640
    img = Image.new("RGB", (width, height), (246, 246, 242))
    draw = ImageDraw.Draw(img)

    # Шапка
    draw.rectangle([0, 0, width, 70], fill=(28, 109, 176))
    draw.text((24, 26), f"НАКЛАДНАЯ  {label}", fill=(255, 255, 255))

    # Псевдо-строки таблицы
    y = 110
    for _ in range(RNG.randint(6, 11)):
        draw.line([(24, y), (width - 24, y)], fill=(210, 211, 205), width=1)
        draw.rectangle([24, y + 10, 24 + RNG.randint(120, 300), y + 22],
                       fill=(225, 227, 220))
        draw.rectangle([width - 110, y + 10, width - 24, y + 22],
                       fill=(232, 233, 227))
        y += 46

    # Подвал
    draw.rectangle([0, height - 50, width, height], fill=(226, 227, 221))
    draw.text((24, height - 38), "Подпись / печать", fill=(108, 111, 104))

    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=72)
    return ContentFile(buffer.getvalue(), name=f"invoice_{label}.jpg")


class Command(BaseCommand):
    help = "[SEED] Демонстрационные данные: менеджеры, магазины, товары и визиты."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset-visits",
            action="store_true",
            help="Удалить ранее засеянные визиты и создать заново.",
        )
        parser.add_argument(
            "--visits",
            type=int,
            default=55,
            help="Сколько визитов сгенерировать (по умолчанию 55).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self._cleanup_legacy()
        admin = self._seed_admin()
        managers = self._seed_managers()
        stores = self._seed_stores()
        products = self._seed_products()
        self._seed_visits(
            managers=managers,
            stores=stores,
            products=products,
            count=options["visits"],
            reset=options["reset_visits"],
        )

        self.stdout.write(self.style.SUCCESS("\nSeed выполнен."))
        self.stdout.write(
            f"  Менеджеров: {len(managers)} | Магазинов: {len(stores)} | "
            f"Товаров: {len(products)}"
        )
        self.stdout.write("  Вход админа:    admin / admin123")
        self.stdout.write("  Вход менеджера: manager1 / manager123")

    # --- Очистка устаревших данных от прежней версии команды -----------------
    def _cleanup_legacy(self) -> None:
        """Удаляет помеченные «(seed)» справочники прошлой версии команды.

        Только те, что не защищены связанными визитами (ProtectedError молча
        пропускаем), чтобы демо-каталог выглядел чисто.
        """
        from django.db.models import ProtectedError

        removed = 0
        legacy = list(Product.objects.filter(name__icontains="(seed)")) + list(
            Store.objects.filter(name__icontains="(seed)")
        )
        for obj in legacy:
            try:
                obj.delete()
                removed += 1
            except ProtectedError:
                pass
        if removed:
            self.stdout.write(self.style.WARNING(f"Удалено устаревших записей: {removed}"))

    # --- Пользователи --------------------------------------------------------
    def _seed_admin(self) -> User:
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "role": User.Role.ADMIN,
                "full_name": "Администратор системы",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Создан admin / admin123"))
        return admin

    def _seed_managers(self) -> list[User]:
        managers: list[User] = []
        for full_name, username, is_active in MANAGERS:
            manager, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "role": User.Role.MANAGER,
                    "full_name": full_name,
                    "is_active": is_active,
                },
            )
            if created:
                manager.set_password("manager123")
            # Делаем команду авторитетной: освежаем ФИО/роль/статус на повторных
            # прогонах (в т.ч. чистим прежнее «(seed)» в имени).
            manager.full_name = full_name
            manager.role = User.Role.MANAGER
            manager.is_active = is_active
            manager.save()
            managers.append(manager)
        self.stdout.write(self.style.SUCCESS(f"Менеджеров: {len(managers)}"))
        return managers

    # --- Справочники ---------------------------------------------------------
    def _seed_stores(self) -> list[Store]:
        stores = []
        for name, address in STORES:
            store, _ = Store.objects.get_or_create(
                name=name, defaults={"address": address}
            )
            if store.address != address:
                store.address = address
                store.save()
            stores.append(store)
        self.stdout.write(self.style.SUCCESS(f"Магазинов: {len(stores)}"))
        return stores

    def _seed_products(self) -> list[Product]:
        products = []
        for name, volume, price, is_active in PRODUCTS:
            product, created = Product.objects.get_or_create(
                name=name,
                volume=volume,
                defaults={"price": price, "is_active": is_active},
            )
            if not created:
                product.price = price
                product.is_active = is_active
                product.save()
            products.append(product)
        self.stdout.write(self.style.SUCCESS(f"Товаров: {len(products)}"))
        return products

    # --- Визиты --------------------------------------------------------------
    def _seed_visits(self, *, managers, stores, products, count, reset) -> None:
        active_managers = [m for m in managers if m.is_active]
        active_products = [p for p in products if p.is_active]

        existing = Visit.objects.filter(manager__in=active_managers).count()
        if existing and not reset:
            self.stdout.write(
                self.style.WARNING(
                    f"Визиты уже есть ({existing}). Пропуск. "
                    "Используйте --reset-visits для пересоздания."
                )
            )
            return

        if reset:
            Visit.objects.filter(manager__in=active_managers).delete()

        now = timezone.now()
        created = 0
        for i in range(count):
            manager = RNG.choice(active_managers)
            store = RNG.choice(stores)
            # Распределяем по последним ~45 дням, со «свежим» уклоном.
            days_ago = int(abs(RNG.gauss(0, 1)) * 15) % 45
            when = now - timedelta(
                days=days_ago,
                hours=RNG.randint(8, 19),
                minutes=RNG.randint(0, 59),
            )

            visit = Visit(manager=manager, store=store)
            visit.invoice_photo.save(
                f"seed_{i + 1}.jpg", _make_invoice_image(f"#{i + 1:03d}"), save=False
            )
            visit.save()
            # created_at — auto_now_add, поэтому проставляем дату вручную.
            Visit.objects.filter(pk=visit.pk).update(created_at=when)

            line_products = RNG.sample(
                active_products, k=RNG.randint(2, min(5, len(active_products)))
            )
            for product in line_products:
                shipped = RNG.randint(5, 60)
                # У части позиций есть просрочка (обычно небольшая).
                expired = RNG.randint(0, max(1, shipped // 8)) if RNG.random() < 0.4 else 0
                VisitItem.objects.create(
                    visit=visit,
                    product=product,
                    shipped_qty=shipped,
                    expired_qty=expired,
                )
            created += 1

        self.stdout.write(self.style.SUCCESS(f"Визитов создано: {created}"))
