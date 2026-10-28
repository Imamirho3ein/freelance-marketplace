from django.urls import path
from . import views

urlpatterns = [
    path("conversations/", views.ConversationListCreateView.as_view(), name="conversations"),
    path("conversations/<int:pk>/", views.ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<int:conversation_id>/messages/", views.MessageListCreateView.as_view(), name="messages"),
    path("conversations/<int:conversation_id>/read/", views.MarkReadView.as_view(), name="mark-read"),
]
