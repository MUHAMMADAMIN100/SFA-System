import json

import pytest

from apps.visits.models import Visit

pytestmark = pytest.mark.django_db

VISITS_URL = "/api/visits/"


def test_manager_creates_visit_multipart(
    manager_client, manager_user, stores, products, invoice_image
):
    items = [
        {"product": products[0].id, "shipped_qty": 10, "expired_qty": 2},
        {"product": products[1].id, "shipped_qty": 5, "expired_qty": 0},
    ]
    resp = manager_client.post(
        VISITS_URL,
        {
            "store": stores[0].id,
            "invoice_photo": invoice_image,
            "items": json.dumps(items),
        },
        format="multipart",
    )
    assert resp.status_code == 201, resp.data
    assert len(resp.data["items"]) == 2
    assert resp.data["invoice_photo"]

    visit = Visit.objects.get(pk=resp.data["id"])
    assert visit.manager == manager_user
    assert visit.store == stores[0]
    assert visit.items.count() == 2
    line = visit.items.get(product=products[0])
    assert line.shipped_qty == 10
    assert line.expired_qty == 2


def test_visit_manager_taken_from_token_not_body(
    manager_client, manager_user, admin_user, stores, products, invoice_image
):
    # Пытаемся подменить менеджера в теле запроса — должно игнорироваться.
    items = [{"product": products[0].id, "shipped_qty": 1, "expired_qty": 0}]
    resp = manager_client.post(
        VISITS_URL,
        {
            "store": stores[0].id,
            "manager": admin_user.id,
            "invoice_photo": invoice_image,
            "items": json.dumps(items),
        },
        format="multipart",
    )
    assert resp.status_code == 201
    visit = Visit.objects.get(pk=resp.data["id"])
    assert visit.manager == manager_user


def test_visit_requires_at_least_one_item(
    manager_client, stores, invoice_image
):
    resp = manager_client.post(
        VISITS_URL,
        {
            "store": stores[0].id,
            "invoice_photo": invoice_image,
            "items": json.dumps([]),
        },
        format="multipart",
    )
    assert resp.status_code == 400


def test_visit_requires_photo(manager_client, stores, products):
    items = [{"product": products[0].id, "shipped_qty": 1, "expired_qty": 0}]
    resp = manager_client.post(
        VISITS_URL,
        {"store": stores[0].id, "items": json.dumps(items)},
        format="multipart",
    )
    assert resp.status_code == 400


def test_manager_sees_only_own_visits(
    manager_client, manager_user, other_manager, stores, products, make_visit
):
    own = make_visit(manager_user, stores[0], [(products[0], 3, 1)])
    # Визит другого менеджера не должен попасть в /my/.
    make_visit(other_manager, stores[1], [(products[1], 2, 0)])

    resp = manager_client.get("/api/visits/my/")
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["id"] == own.id
    assert resp.data["results"][0]["manager"] == manager_user.id


def test_admin_lists_all_visits(admin_client, manager_user, stores, products, make_visit):
    make_visit(manager_user, stores[0], [(products[0], 3, 1)])
    resp = admin_client.get(VISITS_URL)
    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["manager_name"] == "Тест Менеджер"
