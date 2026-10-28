export default function Spinner({ className = "" }: { className?: string }) {
  return <span className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600 ${className}`} />;
}
