import { api } from "./client";
import type { Project, Bid, Contract, Paginated, Category } from "@/types";

export const projectsApi = {
  list: (params?: any) => api.get<Paginated<Project> | Project[]>("/projects/", { params }),
  get: (id: number) => api.get<Project>(`/projects/${id}/`),
  create: (payload: any) => api.post<Project>("/projects/", payload),
  update: (id: number, payload: any) => api.patch<Project>(`/projects/${id}/`, payload),
  delete: (id: number) => api.delete(`/projects/${id}/`),
  close: (id: number) => api.post(`/projects/${id}/close/`),
  uploadAttachment: (id: number, file: File) => {
    const fd = new FormData(); fd.append("file", file);
    return api.post(`/projects/${id}/upload_attachment/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  },
  bids: (id: number) => api.get<Bid[]>(`/projects/${id}/bids/`),
  createBid: (id: number, payload: any) => api.post<Bid>(`/projects/${id}/bids/`, payload),
  acceptBid: (projectId: number, bidId: number) => api.post<Contract>(`/projects/${projectId}/accept-bid/${bidId}/`),
  categories: () => api.get<Category[]>("/projects/categories/"),
};

export const bidsApi = {
  mine: () => api.get<Bid[]>("/projects/bids/"),
  withdraw: (id: number) => api.post(`/projects/bids/${id}/withdraw/`),
};

export const contractsApi = {
  list: () => api.get<Contract[]>("/projects/contracts/"),
  get: (id: number) => api.get<Contract>(`/projects/contracts/${id}/`),
  addMilestone: (id: number, payload: any) => api.post(`/projects/contracts/${id}/milestones/`, payload),
  complete: (id: number) => api.post(`/projects/contracts/${id}/complete/`),
};

export const milestonesApi = {
  update: (id: number, payload: any) => api.patch(`/projects/milestones/${id}/`, payload),
  submit: (id: number) => api.post(`/projects/milestones/${id}/submit/`),
  approve: (id: number) => api.post(`/projects/milestones/${id}/approve/`),
  pay: (id: number) => api.post(`/projects/milestones/${id}/pay/`),
};
