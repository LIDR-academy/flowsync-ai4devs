import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, ApiError, type User } from "@/lib/api";

export default function ProfilePage() {
  const { user, hydrated, logout, expireSession } = useAuth();
  const navigate = useNavigate();
  // Tras una recarga el contexto ya pidió GET /account/profile: se reutiliza.
  const [profile, setProfile] = useState<User | null>(hydrated ? user : null);
  const [error, setError] = useState<string | null>(null);

  // Consume GET /account/profile al entrar a la vista protegida.
  useEffect(() => {
    if (hydrated) return;
    let cancelled = false;
    api
      .profile()
      .then((data) => !cancelled && setProfile(data))
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          expireSession();
          navigate("/login", { replace: true });
        } else {
          setError(
            e instanceof ApiError ? e.message : "No se pudo cargar el perfil.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, expireSession, navigate]);

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
          <CardDescription>Datos de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && <Alert>{error}</Alert>}
          {!profile && !error && (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          )}
          {profile && (
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                {profile.initials}
              </div>
              <div>
                <p className="font-medium">
                  {profile.fullName ?? "Sin nombre"}
                </p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>
          )}
          <Button variant="outline" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
