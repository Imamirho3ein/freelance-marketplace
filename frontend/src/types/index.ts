export type Role = "client" | "freelancer" | "admin";

export interface Skill { id: number; name: string; }

export interface Profile {
  title: string; bio: string; hourly_rate: number; location: string;
  skills: Skill[]; rating: number; reviews_count: number; completed_projects: number;
  portfolio_url: string; github_url: string; linkedin_url: string;
}

export interface User {
  id: number; email: string; username: string; first_name: string; last_name: string;
  role: Role; avatar: string | null; is_verified: boolean; profile?: Profile; date_joined: string;
}

export interface Category { id: number; name: string; slug: string; }

export interface Project {
  id: number; client: User | string; title: string; description: string;
  category: Category | null; skills: Skill[] | string[];
  budget_min: number; budget_max: number; deadline: string | null;
  status: "open" | "in_progress" | "completed" | "cancelled" | "closed";
  is_featured: boolean; views_count: number; bids_count: number;
  attachments?: { id: number; file: string; name: string }[];
  contract?: Contract;
  created_at: string; updated_at: string;
}

export interface Bid {
  id: number; project: number; freelancer: User; amount: number;
  proposal: string; delivery_days: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn"; created_at: string;
}

export interface Milestone {
  id: number; title: string; description: string; amount: number;
  due_date: string | null; status: "pending" | "in_progress" | "submitted" | "approved" | "paid";
  order: number;
}

export interface Contract {
  id: number; project: number; client: User; freelancer: User;
  total_amount: number; status: "active" | "completed" | "disputed" | "cancelled";
  started_at: string; completed_at: string | null; milestones: Milestone[];
}

export interface Message { id: number; conversation: number; sender: User; text: string; file: string | null; is_read: boolean; created_at: string; }
export interface Conversation { id: number; participants: User[]; project: number | null; last_message: Message | null; unread_count: number; }
export interface Review { id: number; reviewer: User; reviewee: User; project: number | null; rating: number; comment: string; created_at: string; }
export interface Notification { id: number; type: string; title: string; message: string; link: string; is_read: boolean; created_at: string; }

export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[]; }
