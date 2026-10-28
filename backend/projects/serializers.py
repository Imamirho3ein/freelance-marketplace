from rest_framework import serializers

from users.models import Skill
from users.serializers import UserSerializer, SkillSerializer
from .models import Category, Project, ProjectAttachment, Bid, Contract, Milestone


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProjectAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAttachment
        fields = ["id", "file", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ["id", "title", "description", "amount", "due_date", "status", "order", "submitted_at", "approved_at", "created_at"]
        read_only_fields = ["id", "status", "submitted_at", "approved_at", "created_at"]


class ContractSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    client = UserSerializer(read_only=True)
    freelancer = UserSerializer(read_only=True)

    class Meta:
        model = Contract
        fields = ["id", "project", "client", "freelancer", "bid", "total_amount", "status", "started_at", "completed_at", "milestones"]
        read_only_fields = ["id", "started_at", "completed_at"]


class BidSerializer(serializers.ModelSerializer):
    freelancer = UserSerializer(read_only=True)

    class Meta:
        model = Bid
        fields = ["id", "project", "freelancer", "amount", "proposal", "delivery_days", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "project", "freelancer", "status", "created_at", "updated_at"]


class ProjectSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Skill.objects.all(),
        source="skills", required=False,
    )
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False, allow_null=True
    )
    attachments = ProjectAttachmentSerializer(many=True, read_only=True)
    bids_count = serializers.IntegerField(read_only=True)
    contract = ContractSerializer(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "client", "title", "description", "category", "category_id",
            "skills", "skill_ids", "budget_min", "budget_max", "deadline", "status",
            "is_featured", "views_count", "bids_count", "attachments", "contract",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "client", "views_count", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["client"] = self.context["request"].user
        return super().create(validated_data)


class ProjectListSerializer(serializers.ModelSerializer):
    client = serializers.StringRelatedField()
    skills = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")
    bids_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Project
        fields = ["id", "client", "title", "description", "budget_min", "budget_max", "deadline", "status", "skills", "bids_count", "created_at"]
