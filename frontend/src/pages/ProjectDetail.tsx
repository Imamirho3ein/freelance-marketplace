import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import { reviewsApi } from "@/api/other";
import { useAuth } from "@/store/auth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { id } = useParams();
  const pid = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [bidForm, setBidForm] = useState({ amount: "", proposal: "", delivery_days: "7" });
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", pid],
    queryFn: async () => (await projectsApi.get(pid)).data,
  });

  const { data: bids } = useQuery({
    queryKey: ["bids", pid],
    queryFn: async () => (await projectsApi.bids(pid)).data,
    enabled: !!project && (user?.id === (typeof project.client === "string" ? null : project.client?.id) || user?.role === "admin"),
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", pid],
    queryFn: async () => (await reviewsApi.list({ project: pid })).data,
  });

  const bidMutation = useMutation({
    mutationFn: () => projectsApi.createBid(pid, { amount: bidForm.amount, proposal: bidForm.proposal, delivery_days: Number(bidForm.delivery_days) }),
    onSuccess: () => { toast.success("Bid submitted!"); setBidForm({ amount: "", proposal: "", delivery_days: "7" }); qc.invalidateQueries({ queryKey: ["bids", pid] }); },
    onError: (e: any) => toast.error(e.response?.data?.error?.detail || "Failed to bid"),
  });

  const acceptMutation = useMutation({
    mutationFn: (bidId: number) => projectsApi.acceptBid(pid, bidId),
    onSuccess: () => { toast.success("Bid accepted!"); qc.invalidateQueries({ queryKey: ["project", pid] }); },
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create({ project: pid, reviewee: (project as any)?.client?.id === user?.id ? (project as any)?.contract?.freelancer?.id : (project as any)?.client?.id, rating: Number(reviewForm.rating), comment: reviewForm.comment, contract: (project as any)?.contract?.id }),
    onSuccess: () => { toast.success("Review submitted!"); qc.invalidateQueries({ queryKey: ["reviews", pid] }); },
  });

  if (isLoading || !project) return <div className="flex justify-center py-16"><Spinner /></div>;

  const clientObj = typeof project.client === "string" ? null : project.client;
  const isOwner = user?.id === clientObj?.id;
  const isFreelancer = user?.role === "freelancer";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <Badge value={project.status} />
            <span className="text-xs text-slate-500">{project.views_count} views · {project.bids_count} bids</span>
          </div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Posted by {typeof project.client === "string" ? project.client : project.client.username} · {new Date(project.created_at).toLocaleDateString()}</p>
          <div className="mt-4 whitespace-pre-wrap text-slate-700">{project.description}</div>
          <div className="mt-4 flex flex-wrap gap-1">
            {(project.skills || []).map((s: any, i: number) => <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{typeof s === "string" ? s : s.name}</span>)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Budget:</span> <span className="font-medium">${project.budget_min} - ${project.budget_max}</span></div>
            <div><span className="text-slate-500">Deadline:</span> <span className="font-medium">{project.deadline || "Flexible"}</span></div>
          </div>
          {project.contract && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">
              Contract #{project.contract.id} — <Badge value={project.contract.status} /> — ${project.contract.total_amount}
              <Link to={`/contracts/${project.contract.id}`} className="ml-2 text-brand-600 hover:underline">View</Link>
            </div>
          )}
        </Card>

        {isOwner && bids && (
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Bids ({bids.length})</h2>
            {bids.length === 0 ? <p className="text-sm text-slate-500">No bids yet.</p> : (
              <div className="space-y-3">
                {bids.map((b: any) => (
                  <div key={b.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{b.freelancer.username}</span>
                        <Badge value={b.status} />
                      </div>
                      <span className="font-semibold text-brand-700">${b.amount}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{b.proposal}</p>
                    <p className="mt-1 text-xs text-slate-400">Delivery in {b.delivery_days} days</p>
                    {project.status === "open" && b.status === "pending" && (
                      <div className="mt-3">
                        <Button size="sm" onClick={() => acceptMutation.mutate(b.id)} loading={acceptMutation.isPending}>Accept bid</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {isFreelancer && project.status === "open" && !project.contract && (
          <Card>
            <h2 className="mb-4 text-lg font-semibold">Submit a bid</h2>
            <form onSubmit={(e) => { e.preventDefault(); bidMutation.mutate(); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-sm font-medium">Amount ($)</label><Input type="number" value={bidForm.amount} onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })} required /></div>
                <div><label className="mb-1 block text-sm font-medium">Delivery (days)</label><Input type="number" value={bidForm.delivery_days} onChange={(e) => setBidForm({ ...bidForm, delivery_days: e.target.value })} required /></div>
              </div>
              <div><label className="mb-1 block text-sm font-medium">Proposal</label><Textarea rows={4} value={bidForm.proposal} onChange={(e) => setBidForm({ ...bidForm, proposal: e.target.value })} required /></div>
              <Button type="submit" loading={bidMutation.isPending}>Submit bid</Button>
            </form>
          </Card>
        )}

        <Card>
          <h2 className="mb-4 text-lg font-semibold">Reviews</h2>
          {(reviews || []).length === 0 ? <p className="text-sm text-slate-500">No reviews yet.</p> : (
            <div className="space-y-3">
              {(reviews || []).map((r: any) => (
                <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.reviewer.username}</span>
                    <span className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
          {user && project.contract && (project.contract.status === "completed") && (
            <form onSubmit={(e) => { e.preventDefault(); reviewMutation.mutate(); }} className="mt-4 space-y-3 border-t pt-4">
              <h3 className="font-medium">Leave a review</h3>
              <div><label className="mb-1 block text-sm font-medium">Rating</label>
                <select className="rounded border border-slate-300 px-2 py-1" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} stars</option>)}
                </select>
              </div>
              <Textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Your feedback..." />
              <Button type="submit" size="sm" loading={reviewMutation.isPending}>Submit review</Button>
            </form>
          )}
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <h3 className="mb-3 font-semibold">Project info</h3>
          <ul className="space-y-2 text-sm">
            <li><span className="text-slate-500">Status:</span> <Badge value={project.status} /></li>
            <li><span className="text-slate-500">Client:</span> {typeof project.client === "string" ? project.client : project.client.username}</li>
            <li><span className="text-slate-500">Category:</span> {project.category?.name || "—"}</li>
          </ul>
          {isOwner && project.status === "open" && (
            <Button variant="danger" size="sm" className="mt-4 w-full" onClick={async () => { await projectsApi.close(pid); navigate("/projects"); }}>Close project</Button>
          )}
        </Card>
      </div>
    </div>
  );
}
