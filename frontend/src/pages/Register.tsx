import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "", password2: "", first_name: "", last_name: "", role: "client" });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(JSON.stringify(err.response?.data || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <h1 className="mb-6 text-2xl font-bold">Create account</h1>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">First name</label><Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} /></div>
            <div><label className="mb-1 block text-sm font-medium">Last name</label><Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Username</label><Input value={form.username} onChange={(e) => set("username", e.target.value)} required /></div>
          <div><label className="mb-1 block text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
          <div><label className="mb-1 block text-sm font-medium">I am a</label>
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="client">Client (hiring)</option>
              <option value="freelancer">Freelancer (working)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Password</label><Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required /></div>
            <div><label className="mb-1 block text-sm font-medium">Confirm</label><Input type="password" value={form.password2} onChange={(e) => set("password2", e.target.value)} required /></div>
          </div>
          <Button type="submit" loading={loading} className="w-full">Create account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Have an account? <Link to="/login" className="text-brand-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
