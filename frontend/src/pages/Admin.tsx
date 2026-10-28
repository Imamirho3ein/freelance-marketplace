import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api/other";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

export default function Admin() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: async () => (await adminApi.stats()).data });
  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  const items = [
    ["Users", data?.users], ["Clients", data?.clients], ["Freelancers", data?.freelancers],
    ["Projects", data?.projects], ["Open projects", data?.open_projects], ["Bids", data?.bids],
    ["Contracts", data?.contracts], ["Active contracts", data?.active_contracts], ["Reviews", data?.reviews],
  ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(([label, val]) => (
          <Card key={label as string}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-brand-700">{val}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
