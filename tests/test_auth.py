import pytest

def test_login_success(client, test_user):
    res = client.post(
        "/login",
        data={"username": test_user["email"], "password": test_user["password"]}
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client, test_user):
    res = client.post(
        "/login",
        data={"username": test_user["email"], "password": "wrongpassword"}
    )
    assert res.status_code == 403
    assert res.json()["detail"] == "invalid credentials"


def test_login_nonexistent_user(client):
    res = client.post(
        "/login",
        data={"username": "nobody@example.com", "password": "somepassword"}
    )
    assert res.status_code == 403
    assert res.json()["detail"] == "invalid credentials"
