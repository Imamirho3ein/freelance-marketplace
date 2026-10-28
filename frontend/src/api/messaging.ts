import { api } from "./client";
import type { Conversation, Message } from "@/types";

export const messagingApi = {
  conversations: () => api.get<Conversation[]>("/messaging/conversations/"),
  createConversation: (payload: any) => api.post<Conversation>("/messaging/conversations/", payload),
  get: (id: number) => api.get<Conversation>(`/messaging/conversations/${id}/`),
  messages: (id: number) => api.get<Message[]>(`/messaging/conversations/${id}/messages/`),
  sendMessage: (id: number, payload: any) => api.post<Message>(`/messaging/conversations/${id}/messages/`, payload),
  markRead: (id: number) => api.post(`/messaging/conversations/${id}/read/`),
};
