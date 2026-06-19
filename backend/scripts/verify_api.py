"""Проверка API через DRF APIClient (без запуска сервера).

Запуск:  python scripts/verify_api.py
"""
import io
import json
import os
import sys

import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from PIL import Image  # noqa: E402
from rest_framework.test import APIClient  # noqa: E402

from apps.catalog.models import Product, Store  # noqa: E402

PASS, FAIL = "[OK]", "[FAIL]"
errors = []


def check(label, condition):
    print(f"{PASS if condition else FAIL} {label}")
    if not condition:
        errors.append(label)


def make_photo():
    buf = io.BytesIO()
    Image.new("RGB", (640, 480), (200, 200, 200)).save(buf, format="JPEG")
    buf.seek(0)
    buf.name = "invoice.jpg"
    return buf


client = APIClient()

# 1. Логин менеджера
resp = client.post(
    "/api/auth/login/", {"username": "manager1", "password": "manager123"}, format="json"
)
check("Логин менеджера 200", resp.status_code == 200)
check("Ответ логина содержит role=manager", resp.data.get("role") == "manager")
manager_token = resp.data["access"]

# 2. Логин админа
resp = client.post(
    "/api/auth/login/", {"username": "admin", "password": "admin123"}, format="json"
)
check("Логин админа 200", resp.status_code == 200)
check("Ответ логина содержит role=admin", resp.data.get("role") == "admin")
admin_token = resp.data["access"]

# 3. Менеджер читает справочники
client.credentials(HTTP_AUTHORIZATION=f"Bearer {manager_token}")
resp = client.get("/api/stores/")
check("Менеджер читает /api/stores/ 200", resp.status_code == 200)
resp = client.get("/api/products/?is_active=true")
check("Менеджер читает /api/products/?is_active=true 200", resp.status_code == 200)

# 4. Менеджеру запрещена запись в справочник
resp = client.post("/api/stores/", {"name": "X"}, format="json")
check("Менеджеру запрещён POST /api/stores/ (403)", resp.status_code == 403)

# 5. Менеджеру запрещена аналитика
resp = client.get("/api/analytics/managers/")
check("Менеджеру запрещена аналитика (403)", resp.status_code == 403)

# 6. Менеджер создаёт визит (multipart + nested items как JSON-строка)
store = Store.objects.first()
products = list(Product.objects.all()[:2])
items = [
    {"product": products[0].id, "shipped_qty": 10, "expired_qty": 2},
    {"product": products[1].id, "shipped_qty": 5, "expired_qty": 0},
]
resp = client.post(
    "/api/visits/",
    {
        "store": store.id,
        "invoice_photo": make_photo(),
        "items": json.dumps(items),
    },
    format="multipart",
)
check("Менеджер создаёт визит (201)", resp.status_code == 201)
if resp.status_code == 201:
    check("Визит вернул 2 строки товаров", len(resp.data.get("items", [])) == 2)
    check("Визит содержит URL фото", bool(resp.data.get("invoice_photo")))
    check("Менеджер визита проставлен из токена", resp.data.get("manager") is not None)
else:
    print("   ответ:", resp.data)

# 7. Менеджеру запрещена общая лента визитов (только админ)
resp = client.get("/api/visits/")
check("Менеджеру запрещена общая лента /api/visits/ (403)", resp.status_code == 403)

# 8. Менеджер видит свои визиты
resp = client.get("/api/visits/my/")
check("Менеджер видит /api/visits/my/ (200)", resp.status_code == 200)

# 9. Админ: лента визитов
client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_token}")
resp = client.get("/api/visits/")
check("Админ видит ленту визитов (200)", resp.status_code == 200)
check("В ленте есть хотя бы один визит", resp.data.get("count", 0) >= 1)

# 10. Админ: аналитика по менеджерам
resp = client.get("/api/analytics/managers/")
check("Аналитика по менеджерам (200)", resp.status_code == 200)
mgr_row = next((r for r in resp.data if r["shipped_total"] > 0), None)
check("Есть строка менеджера с отгрузкой", mgr_row is not None)
if mgr_row:
    # 10 отгружено + 5 отгружено = 15; просрочка 2; процент 2/15*100=13.33
    check("shipped_total = 15", mgr_row["shipped_total"] == 15)
    check("expired_total = 2", mgr_row["expired_total"] == 2)
    check("expired_percent = 13.33", mgr_row["expired_percent"] == 13.33)
    check("stores_visited = 1", mgr_row["stores_visited"] == 1)

# 11. Админ: аналитика по товарам
resp = client.get("/api/analytics/products/")
check("Аналитика по товарам (200)", resp.status_code == 200)

# 12. Админ создаёт менеджера
resp = client.post(
    "/api/managers/",
    {"username": "manager2", "full_name": "Петров П.", "password": "pass12345"},
    format="json",
)
check("Админ создаёт менеджера (201)", resp.status_code == 201)
check("Созданный менеджер имеет role=manager", resp.data.get("role") == "manager")

# 13. Экспорт в Excel
resp = client.get("/api/export/visits/")
check("Экспорт визитов (200)", resp.status_code == 200)
check(
    "Экспорт отдаёт xlsx",
    resp["Content-Type"].endswith("spreadsheetml.sheet"),
)
check(
    "Экспорт — вложение",
    "attachment" in resp.get("Content-Disposition", ""),
)

print()
if errors:
    print(f"ПРОВАЛЕНО проверок: {len(errors)}")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print("ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ")
