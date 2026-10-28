from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ProjectViewSet, BidViewSet, ContractViewSet, MilestoneViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("", ProjectViewSet, basename="project")
router.register("bids", BidViewSet, basename="bid")
router.register("contracts", ContractViewSet, basename="contract")
router.register("milestones", MilestoneViewSet, basename="milestone")

urlpatterns = [
    path("", include(router.urls)),
]
