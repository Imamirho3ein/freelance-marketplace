import { api } from "./client";
import type { Review, Notification, User, Skill } from "@/types";

export const reviewsApi = {
  list: (params?: any) => api.get<Review[]>("/reviews/", { params }),
  create: (payload: any) => api.post<Review>("/reviews/", payload),
};

export const notificationsApi = {
  list: () => api.get<Notification[]>("/notifications/"),
  readAll: () => api.post("/notifications/read-all/"),
  read: (id: number) => api.post(`/notifications/${id}/read/`),
};

export const adminApi = {
  stats: () => api.get("/admin/stats/"),
};
export const usersApi = {
  me: () => api.get<User>("/users/me/"),
  updateMe: (payload: any) => api.patch<User>("/users/me/", payload),
  updateProfile: (payload: any) => api.patch("/users/me/profile/", payload),
  uploadAvatar: (file: File) => {
    const fd = new FormData(); fd.append("avatar", file);
    return api.post("/users/me/avatar/", fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  skills: () => api.get<Skill[]>("/users/skills/"),
  freelancers: (params?: any) => api.get<User[]>("/users/freelancers/", { params }),
  get: (id: number) => api.get<User>(`/users/${id}/`),
};
