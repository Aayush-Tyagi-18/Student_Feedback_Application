import pytest

from app import create_app


@pytest.fixture()
def client(tmp_path):
    app = create_app(str(tmp_path / "test.db"))
    app.config["TESTING"] = True
    return app.test_client()


def test_health(client):
    assert client.get("/health").get_json() == {"status": "ok"}


def test_empty_state(client):
    assert b"No feedback yet" in client.get("/").data


def test_submit_and_display(client):
    resp = client.post(
        "/submit",
        data={"name": "Asha", "course": "CS101", "message": "Great labs!"},
        follow_redirects=True,
    )
    assert resp.status_code == 200
    assert b"Great labs!" in resp.data
    assert b"Asha" in resp.data
    assert b"CS101" in resp.data


def test_missing_fields_rejected(client):
    resp = client.post(
        "/submit",
        data={"name": "Asha", "course": "", "message": ""},
        follow_redirects=True,
    )
    assert b"Please fill in" in resp.data
    assert b"No feedback yet" in resp.data


def test_html_is_escaped(client):
    client.post(
        "/submit",
        data={"name": "x", "course": "y", "message": "<script>alert(1)</script>"},
    )
    assert b"<script>alert(1)</script>" not in client.get("/").data
