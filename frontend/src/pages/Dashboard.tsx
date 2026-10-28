import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
import { projectsApi, bidsApi, contractsApi } from "@/api/projects";
import { usersApi } from "@/api/other";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, fetchMe } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(user?.profile || {});

  const { data: myProjects } = useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => (await projectsApi.list({ client: user?.id })).data,
    enabled: user?.role === "client",
  });
  const { data: myBids } = useQuery({
    queryKey: ["my-bids"],
    queryFn: async () => (await bidsApi.mine()).data,
    enabled: user?.role === "freelancer",
  });
  const { data: myContracts } = useQuery({
    queryKey: ["my-contracts"],
    queryFn: async () => (await contractsApi.list()).data,
  });

  const updateProfile = useMutation({
    mutationFn: () => usersApi.updateProfile(profile),
    onSuccess: () => { toast.success("Profile updated"); fetchMe(); setEditing(false); },
  });

  const projects = Array.isArray(myProjects) ? myProjects : myProjects?.results || [];
  const bids = Array.isArray(myBids) ? myBids : [];
  const contracts = Array.isArray(myContracts) ? myContracts : [];

  if (!user) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Profile</h2>
              <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>{editing ? "Cancel" : "Edit"}</Button>
            </div>
            {editing ? (
              <div className="space-y-3">
                <Input placeholder="Title" value={profile.title || ""} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
                <Textarea rows={3} placeholder="Bio" value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                <Input type="number" placeholder="Hourly rate" value={profile.hourly_rate || ""} onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })} />
                <Input placeholder="Location" value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                <Button size="sm" loading={updateProfile.isPending} onClick={() => updateProfile.mutate()}>Save</Button>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{user.username}</p>
                <p className="text-slate-500">{user.profile?.title}</p>
                <p className="text-slate-600">{user.profile?.bio}</p>
                <div className="flex items-center gap-2"><Badge value={user.role} /><span className="text-amber-500">★ {user.profile?.rating}</span></div>
                <p className="text-slate-500">{user.profile?.location}</p>
                <p className="font-medium text-brand-700">${user.profile?.hourly_rate}/hr</p>
              </div>
            )}
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          {user.role === "client" && (
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">My Projects</h2>
                <Link to="/projects/new"><Button size="sm">New project</Button></Link>
              </div>
              {projects.length === 0 ? <p className="text-sm text-slate-500">No projects yet.</p> : (
                <div className="space-y-2">
                  {projects.map((p: any) => (
                    <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                      <span className="font-medium">{p.title}</span>
                      <Badge value={p.status} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
          {user.role === "freelancer" && (
            <Card>
              <h2 className="mb-3 font-semibold">My Bids</h2>
              {bids.length === 0 ? <p className="text-sm text-slate-500">No bids yet.</p> : (
                <div className="space-y-2">
                  {bids.map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <span>Project #{b.project}</span>
                      <div className="flex items-center gap-2"><span className="font-medium">${b.amount}</span><Badge value={b.status} /></div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
          <Card>
            <h2 className="mb-3 font-semibold">Contracts</h2>
            {contracts.length === 0 ? <p className="text-sm text-slate-500">No contracts yet.</p> : (
              <div className="space-y-2">
                {contracts.map((c: any) => (
                  <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                    <span>Contract #{c.id}</span>
                    <div className="flex items-center gap-2"><span className="font-medium">${c.total_amount}</span><Badge value={c.status} /></div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
