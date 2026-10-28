import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <p className="mt-2 text-slate-500">Page not found</p>
      <Link to="/" className="mt-4"><Button>Go home</Button></Link>
    </div>
  );
}
