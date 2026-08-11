import pytest

def test_create_note(authorized_client, test_user):
    res = authorized_client.post(
        "/notes/",
        json={"title": "Test Title", "content": "Test note content body"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Title"
    assert data["content"] == "Test note content body"
    assert data["owner_id"] == test_user["id"]


def test_get_notes(authorized_client, test_user):
    authorized_client.post(
        "/notes/",
        json={"title": "Note 1", "content": "Content 1"}
    )
    authorized_client.post(
        "/notes/",
        json={"title": "Note 2", "content": "Content 2"}
    )
    res = authorized_client.get("/notes/")
    assert res.status_code == 200
    notes = res.json()
    assert len(notes) == 2


def test_get_note_by_id(authorized_client):
    create_res = authorized_client.post(
        "/notes/",
        json={"title": "Specific Note", "content": "Specific Content"}
    )
    note_id = create_res.json()["id"]

    res = authorized_client.get(f"/notes/{note_id}")
    assert res.status_code == 200
    assert res.json()["title"] == "Specific Note"


def test_update_note(authorized_client):
    create_res = authorized_client.post(
        "/notes/",
        json={"title": "Old Title", "content": "Old Content"}
    )
    note_id = create_res.json()["id"]

    update_res = authorized_client.put(
        f"/notes/{note_id}",
        json={"title": "Updated Title", "content": "Updated Content"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Title"
    assert update_res.json()["content"] == "Updated Content"


def test_delete_note(authorized_client):
    create_res = authorized_client.post(
        "/notes/",
        json={"title": "To Delete", "content": "Delete content"}
    )
    note_id = create_res.json()["id"]

    del_res = authorized_client.delete(f"/notes/{note_id}")
    assert del_res.status_code == 204

    get_res = authorized_client.get(f"/notes/{note_id}")
    assert get_res.status_code == 404


def test_unauthorized_access_other_user_note(client, test_user, test_user2):
    # User 1 creates a note
    from app.routers.oauth2 import create_access_token
    token1 = create_access_token({"user_id": test_user["id"]})
    token2 = create_access_token({"user_id": test_user2["id"]})

    client.headers = {"Authorization": f"Bearer {token1}"}
    create_res = client.post("/notes/", json={"title": "User 1 Note", "content": "Private"})
    note_id = create_res.json()["id"]

    # User 2 attempts to read User 1's note
    client.headers = {"Authorization": f"Bearer {token2}"}
    get_res = client.get(f"/notes/{note_id}")
    assert get_res.status_code == 403
    assert get_res.json()["detail"] == "Not authorized to perform requested action"
