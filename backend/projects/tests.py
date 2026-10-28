from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class ProjectTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client_user = User.objects.create_user(email="c@b.com", username="client1", password="pass12345", role="client")
        self.free_user = User.objects.create_user(email="f@b.com", username="free1", password="pass12345", role="freelancer")
        # login client
        r = self.client.post("/api/v1/users/login/", {"email": "c@b.com", "password": "pass12345"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + r.data["access"])

    def test_create_project(self):
        r = self.client.post("/api/v1/projects/", {
            "title": "Test project", "description": "desc", "budget_min": 100, "budget_max": 500,
        }, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data["title"], "Test project")

    def test_list_projects_public(self):
        self.client.credentials()
        r = self.client.get("/api/v1/projects/")
        self.assertEqual(r.status_code, 200)

    def test_freelancer_can_bid(self):
        # create project as client
        r = self.client.post("/api/v1/projects/", {"title": "P", "description": "d", "budget_min": 10, "budget_max": 20}, format="json")
        pid = r.data["id"]
        # login freelancer
        r2 = self.client.post("/api/v1/users/login/", {"email": "f@b.com", "password": "pass12345"}, format="json")
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + r2.data["access"])
        r3 = self.client.post(f"/api/v1/projects/{pid}/bids/", {"amount": 15, "proposal": "I can do", "delivery_days": 5}, format="json")
        self.assertEqual(r3.status_code, 201)
