import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.group_name = f"chat_{self.conversation_id}"

        # authenticate via ?token= query param
        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]
        user = await self.get_user_from_token(token)
        if user is None:
            await self.close()
            return
        self.scope["user"] = user

        is_member = await self.is_member(user.id, self.conversation_id)
        if not is_member:
            await self.close()
            return
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        text = data.get("text", "").strip()
        if not text:
            return
        user = self.scope["user"]
        msg = await self.save_message(user.id, self.conversation_id, text)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "chat.message", "message": msg},
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def get_user_from_token(self, token):
        if not token:
            return None
        try:
            access = AccessToken(token)
            User = get_user_model()
            return User.objects.get(id=access["user_id"])
        except Exception:
            return None

    @database_sync_to_async
    def is_member(self, user_id, conv_id):
        from .models import Conversation
        return Conversation.objects.filter(id=conv_id, participants__id=user_id).exists()

    @database_sync_to_async
    def save_message(self, user_id, conv_id, text):
        from django.contrib.auth import get_user_model
        from .models import Conversation, Message
        from .serializers import MessageSerializer
        User = get_user_model()
        user = User.objects.get(id=user_id)
        conv = Conversation.objects.get(id=conv_id)
        msg = Message.objects.create(conversation=conv, sender=user, text=text)
        conv.updated_at = msg.created_at
        conv.save(update_fields=["updated_at"])
        return MessageSerializer(msg).data
