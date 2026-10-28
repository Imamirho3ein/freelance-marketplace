import { clsx } from "clsx";

const colors: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
  closed: "bg-gray-200 text-gray-700",
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  withdrawn: "bg-gray-200 text-gray-700",
  paid: "bg-emerald-100 text-emerald-700",
  approved: "bg-blue-100 text-blue-700",
  submitted: "bg-purple-100 text-purple-700",
  active: "bg-emerald-100 text-emerald-700",
};

export default function Badge({ value }: { value: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colors[value] || "bg-slate-100 text-slate-700")}>
      {value.replace("_", " ")}
    </span>
  );
}
