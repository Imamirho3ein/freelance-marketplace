import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contractsApi, milestonesApi } from "@/api/projects";
import { useAuth } from "@/store/auth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";
import { useState } from "react";

export default function ContractDetail() {
  const { id } = useParams();
  const cid = Number(id);
  const { user } = useAuth();
  const qc = useQueryClient();
  const [msForm, setMsForm] = useState({ title: "", amount: "", description: "" });

  const { data: contract, isLoading } = useQuery({ queryKey: ["contract", cid], queryFn: async () => (await contractsApi.get(cid)).data });

  const addMs = useMutation({
    mutationFn: () => contractsApi.addMilestone(cid, { title: msForm.title, amount: msForm.amount, description: msForm.description }),
    onSuccess: () => { toast.success("Milestone added"); setMsForm({ title: "", amount: "", description: "" }); qc.invalidateQueries({ queryKey: ["contract", cid] }); },
  });
  const submitMs = useMutation({ mutationFn: (mid: number) => milestonesApi.submit(mid), onSuccess: () => { toast.success("Submitted"); qc.invalidateQueries({ queryKey: ["contract", cid] }); } });
  const approveMs = useMutation({ mutationFn: (mid: number) => milestonesApi.approve(mid), onSuccess: () => { toast.success("Approved"); qc.invalidateQueries({ queryKey: ["contract", cid] }); } });
  const payMs = useMutation({ mutationFn: (mid: number) => milestonesApi.pay(mid), onSuccess: () => { toast.success("Paid"); qc.invalidateQueries({ queryKey: ["contract", cid] }); } });
  const complete = useMutation({ mutationFn: () => contractsApi.complete(cid), onSuccess: () => { toast.success("Contract completed"); qc.invalidateQueries({ queryKey: ["contract", cid] }); } });

  if (isLoading || !contract) return <div className="flex justify-center py-16"><Spinner /></div>;

  const isClient = user?.id === contract.client?.id;
  const isFreelancer = user?.id === contract.freelancer?.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Contract #{contract.id}</h1>
          <Badge value={contract.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">Total: ${contract.total_amount} · Started {new Date(contract.started_at).toLocaleDateString()}</p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-500">Client:</span> {contract.client?.username}</div>
          <div><span className="text-slate-500">Freelancer:</span> {contract.freelancer?.username}</div>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Milestones</h2>
        {(contract.milestones || []).length === 0 && <p className="text-sm text-slate-500">No milestones yet.</p>}
        <div className="space-y-3">
          {(contract.milestones || []).map((m: any) => (
            <div key={m.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{m.title}</span>
                <div className="flex items-center gap-2"><span className="font-medium">${m.amount}</span><Badge value={m.status} /></div>
              </div>
              <p className="mt-1 text-sm text-slate-600">{m.description}</p>
              <div className="mt-2 flex gap-2">
                {isFreelancer && m.status === "pending" && <Button size="sm" onClick={() => submitMs.mutate(m.id)} loading={submitMs.isPending}>Submit</Button>}
                {isFreelancer && m.status === "in_progress" && <Button size="sm" onClick={() => submitMs.mutate(m.id)} loading={submitMs.isPending}>Submit</Button>}
                {isClient && m.status === "submitted" && <Button size="sm" onClick={() => approveMs.mutate(m.id)} loading={approveMs.isPending}>Approve</Button>}
                {isClient && m.status === "approved" && <Button size="sm" onClick={() => payMs.mutate(m.id)} loading={payMs.isPending}>Pay</Button>}
              </div>
            </div>
          ))}
        </div>
        {isClient && contract.status === "active" && (
          <div className="mt-4 border-t pt-4">
            <h3 className="mb-2 font-medium">Add milestone</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <Input placeholder="Title" value={msForm.title} onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} />
              <Input type="number" placeholder="Amount" value={msForm.amount} onChange={(e) => setMsForm({ ...msForm, amount: e.target.value })} />
              <Input placeholder="Description" value={msForm.description} onChange={(e) => setMsForm({ ...msForm, description: e.target.value })} />
            </div>
            <Button size="sm" className="mt-2" loading={addMs.isPending} onClick={() => addMs.mutate()}>Add</Button>
          </div>
        )}
        {isClient && contract.status === "active" && (
          <div className="mt-4">
            <Button onClick={() => complete.mutate()} loading={complete.isPending}>Complete contract</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
