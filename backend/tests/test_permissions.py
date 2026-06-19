import pytest

pytestmark = pytest.mark.django_db


# --- Менеджеру запрещены admin-действия ------------------------------------
def test_manager_cannot_write_catalog(manager_client):
    resp = manager_client.post("/api/stores/", {"name": "X"}, format="json")
    assert resp.status_code == 403


def test_manager_can_read_catalog(manager_client, stores, products):
    assert manager_client.get("/api/stores/").status_code == 200
    assert manager_client.get("/api/products/").status_code == 200


def test_manager_cannot_access_analytics(manager_client):
    assert manager_client.get("/api/analytics/managers/").status_code == 403
    assert manager_client.get("/api/analytics/products/").status_code == 403
    assert manager_client.get("/api/analytics/summary/").status_code == 403
    assert manager_client.get("/api/analytics/timeseries/").status_code == 403


def test_manager_cannot_list_all_visits(manager_client):
    assert manager_client.get("/api/visits/").status_code == 403


def test_manager_cannot_access_managers_directory(manager_client):
    assert manager_client.get("/api/managers/").status_code == 403


def test_manager_cannot_export(manager_client):
    assert manager_client.get("/api/export/visits/").status_code == 403


# --- Админу всё доступно ----------------------------------------------------
def test_admin_can_write_catalog(admin_client):
    resp = admin_client.post(
        "/api/products/",
        {"name": "Ряженка", "volume": "0.5 л", "price": "7000", "is_active": True},
        format="json",
    )
    assert resp.status_code == 201


def test_admin_can_access_analytics(admin_client):
    assert admin_client.get("/api/analytics/managers/").status_code == 200
    assert admin_client.get("/api/analytics/products/").status_code == 200


def test_admin_can_create_manager(admin_client):
    resp = admin_client.post(
        "/api/managers/",
        {"username": "newmgr", "full_name": "Новый М.", "password": "pass123456"},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["role"] == "manager"


def test_unauthenticated_rejected(api_client):
    assert api_client.get("/api/visits/").status_code == 401
    assert api_client.get("/api/stores/").status_code == 401
