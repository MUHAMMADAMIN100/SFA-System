from datetime import timedelta

import pytest
from django.utils import timezone

from apps.users.models import User

pytestmark = pytest.mark.django_db

MANAGERS_URL = "/api/analytics/managers/"
PRODUCTS_URL = "/api/analytics/products/"
SUMMARY_URL = "/api/analytics/summary/"
TIMESERIES_URL = "/api/analytics/timeseries/"


def test_managers_analytics_totals(
    admin_client, manager_user, stores, products, make_visit
):
    # Визит 1 (магазин А): 10/2 + 5/0;  Визит 2 (магазин Б): 5/3
    make_visit(manager_user, stores[0], [(products[0], 10, 2), (products[1], 5, 0)])
    make_visit(manager_user, stores[1], [(products[0], 5, 3)])

    resp = admin_client.get(MANAGERS_URL)
    assert resp.status_code == 200
    row = next(r for r in resp.data if r["manager_id"] == manager_user.id)
    assert row["stores_visited"] == 2
    assert row["shipped_total"] == 20
    assert row["expired_total"] == 5
    assert row["expired_percent"] == 25.0


def test_managers_analytics_zero_shipping_no_crash(
    admin_client, stores, products, make_visit
):
    zero_mgr = User.objects.create_user(
        username="zero_mgr", password="x123456789", role=User.Role.MANAGER
    )
    # Отгрузка 0, просрочка 5 → процент должен быть 0 (защита от деления на ноль).
    make_visit(zero_mgr, stores[0], [(products[0], 0, 5)])

    resp = admin_client.get(MANAGERS_URL)
    assert resp.status_code == 200
    row = next(r for r in resp.data if r["manager_id"] == zero_mgr.id)
    assert row["shipped_total"] == 0
    assert row["expired_total"] == 5
    assert row["expired_percent"] == 0


def test_products_analytics_totals(
    admin_client, manager_user, stores, products, make_visit
):
    make_visit(manager_user, stores[0], [(products[0], 10, 2), (products[1], 5, 0)])
    make_visit(manager_user, stores[1], [(products[0], 5, 3)])

    resp = admin_client.get(PRODUCTS_URL)
    assert resp.status_code == 200
    by_id = {r["product_id"]: r for r in resp.data}

    p0 = by_id[products[0].id]
    assert p0["shipped_total"] == 15
    assert p0["expired_total"] == 5
    assert p0["expired_percent"] == 33.33

    p1 = by_id[products[1].id]
    assert p1["shipped_total"] == 5
    assert p1["expired_total"] == 0
    assert p1["expired_percent"] == 0


def test_products_analytics_date_filter(
    admin_client, manager_user, stores, products, make_visit
):
    now = timezone.now()
    old = now - timedelta(days=400)
    make_visit(manager_user, stores[0], [(products[0], 100, 1)], created_at=old)
    make_visit(manager_user, stores[0], [(products[0], 7, 0)], created_at=now)

    # Фильтр на сегодня → старый визит (100 шт) не должен попасть.
    date_from = now.date().isoformat()
    resp = admin_client.get(PRODUCTS_URL, {"date_from": date_from})
    assert resp.status_code == 200
    p0 = next(r for r in resp.data if r["product_id"] == products[0].id)
    assert p0["shipped_total"] == 7


def test_managers_analytics_date_filter(
    admin_client, manager_user, stores, products, make_visit
):
    now = timezone.now()
    old = now - timedelta(days=400)
    make_visit(manager_user, stores[0], [(products[0], 50, 5)], created_at=old)
    make_visit(manager_user, stores[0], [(products[0], 8, 1)], created_at=now)

    resp = admin_client.get(MANAGERS_URL, {"date_from": now.date().isoformat()})
    assert resp.status_code == 200
    row = next(r for r in resp.data if r["manager_id"] == manager_user.id)
    assert row["shipped_total"] == 8
    assert row["expired_total"] == 1


def test_summary_metrics(
    admin_client, manager_user, other_manager, stores, products, make_visit
):
    make_visit(manager_user, stores[0], [(products[0], 10, 2), (products[1], 5, 0)])
    make_visit(manager_user, stores[1], [(products[0], 5, 3)])
    make_visit(other_manager, stores[0], [(products[0], 0, 0)])

    resp = admin_client.get(SUMMARY_URL)
    assert resp.status_code == 200
    d = resp.data
    assert d["shipped_total"] == 20
    assert d["expired_total"] == 5
    assert d["expired_percent"] == 25.0
    assert d["stores_visited"] == 2  # магазины А и Б (distinct)
    assert d["active_managers"] == 2


def test_summary_empty_period_no_crash(admin_client):
    resp = admin_client.get(SUMMARY_URL, {"date_from": "2099-01-01"})
    assert resp.status_code == 200
    assert resp.data["shipped_total"] == 0
    assert resp.data["expired_percent"] == 0


def test_timeseries_by_day(admin_client, manager_user, stores, products, make_visit):
    now = timezone.now()
    earlier = now - timedelta(days=2)
    make_visit(manager_user, stores[0], [(products[0], 4, 1)], created_at=earlier)
    make_visit(manager_user, stores[0], [(products[0], 6, 0)], created_at=now)

    resp = admin_client.get(TIMESERIES_URL)
    assert resp.status_code == 200
    assert len(resp.data) == 2
    assert resp.data[0]["date"] <= resp.data[1]["date"]  # по возрастанию
    assert sum(p["shipped"] for p in resp.data) == 10
    assert sum(p["expired"] for p in resp.data) == 1
