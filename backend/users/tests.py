from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_and_login(self):
        r = self.client.post("/api/v1/users/register/", {
            "email": "a@b.com", "username": "alice", "password": "pass12345", "password2": "pass12345", "role": "client",
        }, format="json")
        self.assertEqual(r.status_code, 201)
        r2 = self.client.post("/api/v1/users/login/", {"email": "a@b.com", "password": "pass12345"}, format="json")
        self.assertEqual(r2.status_code, 200)
        self.assertIn("access", r2.data)

    def test_me_requires_auth(self):
        r = self.client.get("/api/v1/users/me/")
        self.assertEqual(r.status_code, 401)
