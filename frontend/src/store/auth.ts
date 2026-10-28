import { create } from "zustand";
import { api, clearTokens } from "@/api/client";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  fetchMe: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { set({ user: null }); return; }
    set({ loading: true });
    try {
      const { data } = await api.get("/users/me/");
      set({ user: data, loading: false });
    } catch {
      clearTokens();
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    const { data } = await api.post("/users/login/", { email, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    set({ user: data.user });
  },
  register: async (payload) => {
    await api.post("/users/register/", payload);
    const res = await api.post("/users/login/", { email: payload.email, password: payload.password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    set({ user: res.data.user });
  },
  logout: () => { clearTokens(); set({ user: null }); },
  setUser: (u) => set({ user: u }),
}));
