import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/other";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { toast } from "sonner";

export default function Notifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: async () => (await notificationsApi.list()).data });
  const readAll = useMutation({ mutationFn: () => notificationsApi.readAll(), onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); toast.success("All read"); } });
  const read = useMutation({ mutationFn: (id: number) => notificationsApi.read(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button size="sm" variant="ghost" onClick={() => readAll.mutate()}>Mark all read</Button>
      </div>
      <div className="space-y-3">
        {(data || []).length === 0 && <Card><p className="text-sm text-slate-500">No notifications.</p></Card>}
        {(data || []).map((n: any) => (
          <Card key={n.id} className={n.is_read ? "opacity-60" : ""}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-slate-600">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && <Button size="sm" variant="ghost" onClick={() => read.mutate(n.id)}>Mark read</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
