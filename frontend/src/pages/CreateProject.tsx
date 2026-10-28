import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/api/projects";
import { usersApi } from "@/api/other";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Card from "@/components/ui/Card";
import { toast } from "sonner";

export default function CreateProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", budget_min: "", budget_max: "", deadline: "", category: "", skill_ids: [] as number[] });
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: async () => (await projectsApi.categories()).data });
  const { data: skills } = useQuery({ queryKey: ["skills"], queryFn: async () => (await usersApi.skills()).data });

  const toggleSkill = (id: number) => setForm((f) => ({
    ...f, skill_ids: f.skill_ids.includes(id) ? f.skill_ids.filter((x) => x !== id) : [...f.skill_ids, id],
  }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        title: form.title, description: form.description,
        budget_min: form.budget_min, budget_max: form.budget_max,
        deadline: form.deadline || null, skill_ids: form.skill_ids,
      };
      if (form.category) payload.category_id = Number(form.category);
      const { data } = await projectsApi.create(payload);
      toast.success("Project created!");
      navigate(`/projects/${data.id}`);
    } catch (err: any) {
      toast.error(JSON.stringify(err.response?.data || "Failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <h1 className="mb-6 text-2xl font-bold">Post a new project</h1>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div><label className="mb-1 block text-sm font-medium">Description</label><Textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Min budget ($)</label><Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} required /></div>
            <div><label className="mb-1 block text-sm font-medium">Max budget ($)</label><Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Deadline</label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Category</label>
              <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select...</option>
                {(categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Skills</label>
            <div className="flex flex-wrap gap-2">
              {(skills || []).map((s: any) => (
                <button type="button" key={s.id} onClick={() => toggleSkill(s.id)}
                  className={`rounded-full px-3 py-1 text-xs ${form.skill_ids.includes(s.id) ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" loading={loading}>Publish project</Button>
        </form>
      </Card>
    </div>
  );
}
