import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagingApi } from "@/api/messaging";
import { useAuth } from "@/store/auth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";

export default function Messages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [active, setActive] = useState<number | null>(null);
  const [text, setText] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  const { data: convs, isLoading } = useQuery({ queryKey: ["conversations"], queryFn: async () => (await messagingApi.conversations()).data });

  const { data: messages } = useQuery({
    queryKey: ["messages", active],
    queryFn: async () => (await messagingApi.messages(active!)).data,
    enabled: !!active,
  });

  useEffect(() => {
    if (!active) return;
    const token = localStorage.getItem("access_token");
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/chat/${active}/?token=${token}`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      qc.setQueryData(["messages", active], (old: any) => (old ? [...old, msg] : [msg]));
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [active, qc]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text }));
    } else {
      messagingApi.sendMessage(active, { text }).then(() => {
        qc.invalidateQueries({ queryKey: ["messages", active] });
      });
    }
    setText("");
  };

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid gap-4 lg:grid-cols-3 h-[70vh]">
      <Card className="overflow-y-auto">
        <h2 className="mb-3 font-semibold">Conversations</h2>
        {(convs || []).length === 0 && <p className="text-sm text-slate-500">No conversations yet.</p>}
        <div className="space-y-2">
          {(convs || []).map((c: any) => (
            <button key={c.id} onClick={() => setActive(c.id)}
              className={`w-full rounded-lg border p-3 text-left ${active === c.id ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}>
              <div className="font-medium">{c.participants.filter((p: any) => p.id !== user?.id).map((p: any) => p.username).join(", ")}</div>
              <div className="text-xs text-slate-500 truncate">{c.last_message?.text || "No messages"}</div>
            </button>
          ))}
        </div>
      </Card>
      <Card className="lg:col-span-2 flex flex-col">
        {!active ? <div className="flex flex-1 items-center justify-center text-slate-500">Select a conversation</div> : (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {(messages || []).map((m: any) => (
                <div key={m.id} className={`flex ${m.sender.id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-lg px-3 py-2 text-sm ${m.sender.id === user?.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                    {m.text}
                    <div className="mt-1 text-[10px] opacity-70">{new Date(m.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
              <Button type="submit">Send</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
