import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import Spinner from "@/components/ui/Spinner";

export default function ProtectedRoute({ roles }: { roles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
