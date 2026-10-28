from django.contrib.auth import get_user_model
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project, Bid, Contract
from reviews.models import Review

User = get_user_model()


class AdminStatsView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        return Response({
            "users": User.objects.count(),
            "clients": User.objects.filter(role="client").count(),
            "freelancers": User.objects.filter(role="freelancer").count(),
            "projects": Project.objects.count(),
            "open_projects": Project.objects.filter(status="open").count(),
            "bids": Bid.objects.count(),
            "contracts": Contract.objects.count(),
            "active_contracts": Contract.objects.filter(status="active").count(),
            "reviews": Review.objects.count(),
        })
