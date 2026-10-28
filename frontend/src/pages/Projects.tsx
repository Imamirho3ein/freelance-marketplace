import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { Search } from "lucide-react";

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const status = searchParams.get("status") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["projects", searchParams.toString()],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await projectsApi.list(params);
      return Array.isArray(res.data) ? res.data : res.data.results;
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (search) p.set("search", search); else p.delete("search");
    setSearchParams(p);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <form onSubmit={submit} className="flex gap-2">
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="submit"><Search size={16} /></Button>
        </form>
      </div>
      <div className="mb-4 flex gap-2">
        {["", "open", "in_progress", "completed"].map((s) => (
          <button
            key={s}
            onClick={() => { const p = new URLSearchParams(searchParams); if (s) p.set("status", s); else p.delete("status"); setSearchParams(p); }}
            className={`rounded-full px-3 py-1 text-sm ${status === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            {s || "All"}
          </button>
        ))}
      </div>
      {isLoading ? <div className="flex justify-center py-16"><Spinner /></div> :
        !data || data.length === 0 ? <EmptyState title="No projects found" description="Try adjusting your filters." /> :
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p: any) => (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <div className="mb-2 flex items-center justify-between">
                  <Badge value={p.status} />
                  <span className="text-xs text-slate-500">{p.bids_count} bids</span>
                </div>
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(p.skills || []).slice(0, 4).map((s: any, i: number) => (
                    <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{typeof s === "string" ? s : s.name}</span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-700">${p.budget_min} - ${p.budget_max}</span>
                  <span className="text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      }
    </div>
  );
}
