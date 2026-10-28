import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/other";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";


export default function Freelancers() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["freelancers", search],
    queryFn: async () => (await usersApi.freelancers({ search })).data,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Find Freelancers</h1>
        <div className="flex gap-2">
          <Input placeholder="Search by skill or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> :
        !data || data.length === 0 ? <EmptyState title="No freelancers found" /> :
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((f: any) => (
            <Link key={f.id} to={`/freelancers/${f.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                    {f.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.username}</h3>
                    <p className="text-sm text-slate-500">{f.profile?.title || "Freelancer"}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <span className="text-amber-500">★ {f.profile?.rating || 0}</span>
                  <span className="text-slate-400">({f.profile?.reviews_count || 0})</span>
                  <span className="ml-auto font-medium text-brand-700">${f.profile?.hourly_rate || 0}/hr</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(f.profile?.skills || []).slice(0, 4).map((s: any) => <span key={s.id} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{s.name}</span>)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      }
    </div>
  );
}
