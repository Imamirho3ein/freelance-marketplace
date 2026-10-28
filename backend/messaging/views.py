from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).prefetch_related("participants", "messages")

    def create(self, request, *args, **kwargs):
        participant_ids = request.data.get("participant_ids", [])
        if not participant_ids:
            return Response({"error": "participant_ids required"}, status=400)
        # find existing conversation with same participants
        qs = Conversation.objects.filter(participants=request.user)
        for pid in participant_ids:
            qs = qs.filter(participants__id=pid)
        conv = qs.first()
        if not conv:
            conv = Conversation.objects.create()
            conv.participants.add(request.user, *participant_ids)
            if request.data.get("project"):
                conv.project_id = request.data["project"]
                conv.save(update_fields=["project"])
        return Response(ConversationSerializer(conv, context={"request": request}).data, status=201 if conv.messages.count() == 0 else 200)


class ConversationDetailView(generics.RetrieveAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return super().get_queryset().filter(participants=self.request.user)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        conv_id = self.kwargs["conversation_id"]
        conv = Conversation.objects.get(id=conv_id, participants=self.request.user)
        # mark read
        conv.messages.filter(is_read=False).exclude(sender=self.request.user).update(is_read=True)
        return conv.messages.select_related("sender")

    def perform_create(self, serializer):
        conv = Conversation.objects.get(id=self.kwargs["conversation_id"], participants=self.request.user)
        msg = serializer.save(conversation=conv, sender=self.request.user)
        conv.updated_at = msg.created_at
        conv.save(update_fields=["updated_at"])
        # websocket broadcast
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"chat_{conv.id}",
                {"type": "chat.message", "message": MessageSerializer(msg).data},
            )
        except Exception:
            pass


class MarkReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, conversation_id):
        conv = Conversation.objects.get(id=conversation_id, participants=request.user)
        conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({"status": "ok"})
