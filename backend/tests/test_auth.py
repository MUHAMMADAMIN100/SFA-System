import pytest

pytestmark = pytest.mark.django_db

LOGIN_URL = "/api/auth/login/"


def test_login_returns_tokens_and_role_manager(api_client, manager_user):
    resp = api_client.post(
        LOGIN_URL,
        {"username": "t_manager", "password": "managerpass123"},
        format="json",
    )
    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data
    assert resp.data["role"] == "manager"
    assert resp.data["full_name"] == "Тест Менеджер"


def test_login_returns_role_admin(api_client, admin_user):
    resp = api_client.post(
        LOGIN_URL, {"username": "t_admin", "password": "adminpass123"}, format="json"
    )
    assert resp.status_code == 200
    assert resp.data["role"] == "admin"


def test_login_wrong_password_rejected(api_client, manager_user):
    resp = api_client.post(
        LOGIN_URL, {"username": "t_manager", "password": "wrong"}, format="json"
    )
    assert resp.status_code == 401


def test_refresh_returns_usable_access(api_client, manager_user):
    login = api_client.post(
        LOGIN_URL,
        {"username": "t_manager", "password": "managerpass123"},
        format="json",
    )
    old_access = login.data["access"]
    resp = api_client.post(
        "/api/auth/refresh/", {"refresh": login.data["refresh"]}, format="json"
    )
    assert resp.status_code == 200
    new_access = resp.data["access"]
    assert isinstance(new_access, str) and new_access
    # Обновлённый токен реально аутентифицирует запрос (через Bearer, не force_authenticate).
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")
    assert api_client.get("/api/visits/my/").status_code == 200


def test_access_token_authenticates_over_http(api_client, manager_user):
    """Реальный путь JWTAuthentication: токен из логина → Bearer → защищённый роут."""
    login = api_client.post(
        LOGIN_URL,
        {"username": "t_manager", "password": "managerpass123"},
        format="json",
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    assert api_client.get("/api/visits/my/").status_code == 200


def test_admin_access_token_authenticates_over_http(api_client, admin_user):
    login = api_client.post(
        LOGIN_URL, {"username": "t_admin", "password": "adminpass123"}, format="json"
    )
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    assert api_client.get("/api/analytics/managers/").status_code == 200


def test_garbage_bearer_token_rejected(api_client, manager_user):
    api_client.credentials(HTTP_AUTHORIZATION="Bearer not.a.real.token")
    assert api_client.get("/api/visits/my/").status_code == 401
