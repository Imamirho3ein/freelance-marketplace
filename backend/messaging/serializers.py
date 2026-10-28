from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "text", "file", "is_read", "created_at"]
        read_only_fields = ["id", "sender", "is_read", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "participants", "project", "last_message", "unread_count", "created_at", "updated_at"]

    def get_last_message(self, obj):
        m = obj.messages.order_by("-created_at").first()
        return MessageSerializer(m).data if m else None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
