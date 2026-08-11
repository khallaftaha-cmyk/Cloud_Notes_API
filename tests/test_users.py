import pytest

def test_create_user(client):
    res = client.post("/users/", json={"email": "newuser@example.com", "password": "securepassword"})
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data


def test_create_user_duplicate_email(client, test_user):
    res = client.post("/users/", json={"email": test_user["email"], "password": "password123"})
    assert res.status_code == 409
    assert res.json()["detail"] == f"User with email {test_user['email']} already exists"


def test_get_user_authorized(authorized_client, test_user):
    res = authorized_client.get(f"/users/{test_user['id']}")
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == test_user["email"]


def test_get_user_unauthorized_other_user(authorized_client, test_user2):
    res = authorized_client.get(f"/users/{test_user2['id']}")
    assert res.status_code == 403
    assert res.json()["detail"] == "Not authorized to view this user"
