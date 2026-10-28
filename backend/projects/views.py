from django.db.models import Q, Count, Avg
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsOwnerOrReadOnly, IsClient, IsFreelancer
from .models import Category, Project, Bid, Contract, Milestone, ProjectAttachment
from .serializers import (
    CategorySerializer, ProjectSerializer, ProjectListSerializer,
    BidSerializer, ContractSerializer, MilestoneSerializer, ProjectAttachmentSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related("client", "category").prefetch_related("skills", "bids")
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly)
    filterset_fields = ["status", "category", "client"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "budget_min", "budget_max", "deadline"]

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        return ProjectSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=["views_count"])
        return super().retrieve(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsClient])
    def close(self, request, pk=None):
        project = self.get_object()
        if project.client != request.user:
            return Response({"error": "Not owner"}, status=403)
        project.status = Project.Status.CLOSED
        project.save(update_fields=["status"])
        return Response({"status": project.status})

    @action(detail=True, methods=["get", "post"], url_path="bids", permission_classes=[permissions.IsAuthenticated])
    def bids(self, request, pk=None):
        project = self.get_object()
        if request.method == "GET":
            qs = project.bids.select_related("freelancer", "freelancer__profile")
            return Response(BidSerializer(qs, many=True).data)
        if not request.user.is_freelancer:
            return Response({"error": "Only freelancers can bid"}, status=403)
        if project.status != Project.Status.OPEN:
            return Response({"error": "Project not open"}, status=400)
        if Bid.objects.filter(project=project, freelancer=request.user).exists():
            return Response({"error": "Already bid"}, status=400)
        serializer = BidSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(project=project, freelancer=request.user)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["post"], url_path="accept-bid/(?P<bid_id>[^/.]+)", permission_classes=[IsClient])
    def accept_bid(self, request, pk=None, bid_id=None):
        project = self.get_object()
        if project.client != request.user:
            return Response({"error": "Not owner"}, status=403)
        try:
            bid = Bid.objects.get(id=bid_id, project=project)
        except Bid.DoesNotExist:
            return Response({"error": "Bid not found"}, status=404)
        # accept bid, reject others
        Bid.objects.filter(project=project).exclude(id=bid.id).update(status=Bid.Status.REJECTED)
        bid.status = Bid.Status.ACCEPTED
        bid.save(update_fields=["status"])
        # create contract
        contract = Contract.objects.create(
            project=project,
            client=project.client,
            freelancer=bid.freelancer,
            bid=bid,
            total_amount=bid.amount,
            status=Contract.Status.ACTIVE,
        )
        project.status = Project.Status.IN_PROGRESS
        project.save(update_fields=["status"])
        # notify
        from notifications.models import Notification
        Notification.objects.create(
            user=bid.freelancer, type="bid_accepted",
            title="Your bid was accepted!",
            message=f"Your bid on '{project.title}' was accepted.",
            link=f"/projects/{project.id}",
        )
        return Response(ContractSerializer(contract).data, status=201)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def upload_attachment(self, request, pk=None):
        project = self.get_object()
        if project.client != request.user:
            return Response({"error": "Not owner"}, status=403)
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file"}, status=400)
        att = ProjectAttachment.objects.create(
            project=project, file=file, name=file.name, uploaded_by=request.user
        )
        return Response(ProjectAttachmentSerializer(att).data, status=201)


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.select_related("project", "freelancer", "freelancer__profile")
    serializer_class = BidSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_freelancer:
            return qs.filter(freelancer=user)
        return qs.filter(project__client=user)

    @action(detail=True, methods=["post"])
    def withdraw(self, request, pk=None):
        bid = self.get_object()
        if bid.freelancer != request.user:
            return Response({"error": "Not owner"}, status=403)
        if bid.status != Bid.Status.PENDING:
            return Response({"error": "Cannot withdraw"}, status=400)
        bid.status = Bid.Status.WITHDRAWN
        bid.save(update_fields=["status"])
        return Response(BidSerializer(bid).data)


class ContractViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Contract.objects.select_related("client", "freelancer", "project").prefetch_related("milestones")
    serializer_class = ContractSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return super().get_queryset().filter(Q(client=user) | Q(freelancer=user))

    @action(detail=True, methods=["post"], url_path="milestones")
    def add_milestone(self, request, pk=None):
        contract = self.get_object()
        if contract.client != request.user:
            return Response({"error": "Only client"}, status=403)
        serializer = MilestoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(contract=contract)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        contract = self.get_object()
        if contract.client != request.user:
            return Response({"error": "Only client"}, status=403)
        # all milestones must be paid/approved
        if contract.milestones.exclude(status__in=[Milestone.Status.APPROVED, Milestone.Status.PAID]).exists():
            return Response({"error": "Milestones not finished"}, status=400)
        contract.status = Contract.Status.COMPLETED
        contract.completed_at = timezone.now()
        contract.save(update_fields=["status", "completed_at"])
        project = contract.project
        project.status = Project.Status.COMPLETED
        project.save(update_fields=["status"])
        # update freelancer profile
        prof = contract.freelancer.profile
        prof.completed_projects += 1
        prof.save(update_fields=["completed_projects"])
        prof.recompute_rating()
        return Response(ContractSerializer(contract).data)


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.select_related("contract")
    serializer_class = MilestoneSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        return super().get_queryset().filter(Q(contract__client=user) | Q(contract__freelancer=user))

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        ms = self.get_object()
        if ms.contract.freelancer != request.user:
            return Response({"error": "Only freelancer"}, status=403)
        ms.status = Milestone.Status.SUBMITTED
        ms.submitted_at = timezone.now()
        ms.save(update_fields=["status", "submitted_at"])
        from notifications.models import Notification
        Notification.objects.create(
            user=ms.contract.client, type="milestone_submitted",
            title="Milestone submitted",
            message=f"'{ms.title}' submitted for review.",
            link=f"/contracts/{ms.contract.id}",
        )
        return Response(MilestoneSerializer(ms).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        ms = self.get_object()
        if ms.contract.client != request.user:
            return Response({"error": "Only client"}, status=403)
        ms.status = Milestone.Status.APPROVED
        ms.approved_at = timezone.now()
        ms.save(update_fields=["status", "approved_at"])
        return Response(MilestoneSerializer(ms).data)

    @action(detail=True, methods=["post"])
    def pay(self, request, pk=None):
        ms = self.get_object()
        if ms.contract.client != request.user:
            return Response({"error": "Only client"}, status=403)
        if ms.status != Milestone.Status.APPROVED:
            return Response({"error": "Approve first"}, status=400)
        ms.status = Milestone.Status.PAID
        ms.save(update_fields=["status"])
        return Response(MilestoneSerializer(ms).data)
