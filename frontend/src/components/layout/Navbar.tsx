import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import Button from "@/components/ui/Button";
import { Bell, MessageCircle, User as UserIcon, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-700">
          <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">G</span>
          GigForge
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/projects" className="text-sm text-slate-600 hover:text-brand-600">Find Work</Link>
          <Link to="/freelancers" className="text-sm text-slate-600 hover:text-brand-600">Hire Talent</Link>
          {user?.role === "client" && <Link to="/projects/new" className="text-sm text-slate-600 hover:text-brand-600">Post a Job</Link>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/messages" className="text-slate-600 hover:text-brand-600"><MessageCircle size={20} /></Link>
              <Link to="/notifications" className="text-slate-600 hover:text-brand-600"><Bell size={20} /></Link>
              <Link to="/dashboard" className="text-slate-600 hover:text-brand-600"><UserIcon size={20} /></Link>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
                <LogOut size={16} />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-600 hover:text-brand-600">Log in</Link>
              <Button size="sm" onClick={() => navigate("/register")}>Sign up</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
