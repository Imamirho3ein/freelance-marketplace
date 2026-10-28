from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "reviewer", "reviewee", "project", "contract", "rating", "comment", "created_at"]
        read_only_fields = ["id", "reviewer", "created_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def create(self, validated_data):
        validated_data["reviewer"] = self.context["request"].user
        return super().create(validated_data)
