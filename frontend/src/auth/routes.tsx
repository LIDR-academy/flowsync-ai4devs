import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/auth/AuthContext";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return <p className="p-8 text-center text-muted-foreground">Cargando…</p>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading)
    return <p className="p-8 text-center text-muted-foreground">Cargando…</p>;
  return user ? <Navigate to="/profile" replace /> : <Outlet />;
}
