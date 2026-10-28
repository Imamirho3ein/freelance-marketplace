import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/other";
import { reviewsApi } from "@/api/other";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";

export default function FreelancerDetail() {
  const { id } = useParams();
  const fid = Number(id);
  const { data: user, isLoading } = useQuery({ queryKey: ["user", fid], queryFn: async () => (await usersApi.get(fid)).data });
  const { data: reviews } = useQuery({ queryKey: ["reviews-user", fid], queryFn: async () => (await reviewsApi.list({ reviewee: fid })).data });

  if (isLoading || !user) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <h2 className="mt-3 text-xl font-bold">{user.username}</h2>
            <p className="text-sm text-slate-500">{user.profile?.title}</p>
            <div className="mt-2 text-amber-500">★ {user.profile?.rating} ({user.profile?.reviews_count} reviews)</div>
            <div className="mt-2 font-medium text-brand-700">${user.profile?.hourly_rate}/hr</div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p><span className="text-slate-500">Location:</span> {user.profile?.location || "—"}</p>
            <p><span className="text-slate-500">Completed:</span> {user.profile?.completed_projects} projects</p>
            {user.profile?.portfolio_url && <a href={user.profile.portfolio_url} target="_blank" rel="noreferrer" className="block text-brand-600 hover:underline">Portfolio</a>}
            {user.profile?.github_url && <a href={user.profile.github_url} target="_blank" rel="noreferrer" className="block text-brand-600 hover:underline">GitHub</a>}
          </div>
          <div className="mt-4 flex flex-wrap gap-1">
            {(user.profile?.skills || []).map((s: any) => <Badge key={s.id} value={s.name} />)}
          </div>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <h3 className="mb-3 font-semibold">About</h3>
          <p className="whitespace-pre-wrap text-slate-700">{user.profile?.bio || "No bio yet."}</p>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Reviews</h3>
          {(reviews || []).length === 0 ? <p className="text-sm text-slate-500">No reviews yet.</p> : (
            <div className="space-y-3">
              {(reviews || []).map((r: any) => (
                <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.reviewer.username}</span>
                    <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
