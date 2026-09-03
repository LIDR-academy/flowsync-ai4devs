import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import "./App.css";

type Mode = "login" | "signup";
type User = { fullName?: string; email: string; initials?: string };
type AuthData = { user: User; token: string };
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "flowsync_token";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    errors?: Array<{ message?: string }>;
  };
  if (!response.ok)
    throw new Error(
      body.message ??
        body.errors?.[0]?.message ??
        "No se pudo completar la solicitud.",
    );
  return body;
}

function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    request<{ data: User }>("/api/v1/account/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(({ data }) => setProfile(data))
      .catch(() => localStorage.removeItem(TOKEN_KEY));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      ...(mode === "signup"
        ? {
            fullName: String(form.get("fullName") ?? ""),
            passwordConfirmation: String(
              form.get("passwordConfirmation") ?? "",
            ),
          }
        : {}),
    };
    try {
      const { data } = await request<{ data: AuthData }>(
        `/api/v1/auth/${mode === "login" ? "login" : "signup"}`,
        { method: "POST", body: JSON.stringify(payload) },
      );
      localStorage.setItem(TOKEN_KEY, data.token);
      setProfile(data.user);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo completar la solicitud.",
      );
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setProfile(null);
    setMode("login");
  }

  if (profile)
    return (
      <main className="app-shell">
        <section className="profile-panel">
          <span className="brand-mark">FS</span>
          <p className="eyebrow">CUENTA PROTEGIDA</p>
          <h1>Hola, {profile.fullName ?? profile.email}</h1>
          <p className="muted">
            Tu sesión está activa y tu perfil fue cargado desde la API.
          </p>
          <div className="profile-card">
            <div className="avatar">
              {profile.initials ?? profile.email.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{profile.fullName ?? "Usuario FlowSync"}</strong>
              <span>{profile.email}</span>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            Cerrar sesión
          </Button>
        </section>
      </main>
    );

  const signup = mode === "signup";
  return (
    <main className="app-shell">
      <section className="intro-panel">
        <span className="brand-mark">FS</span>
        <p className="eyebrow">WORKSPACE FORWARD</p>
        <h1>
          Todo tu flujo,
          <br />
          <em>en sincronía.</em>
        </h1>
        <p className="intro-copy">
          Un espacio simple para que los equipos conviertan el trabajo pendiente
          en progreso visible.
        </p>
        <div className="intro-line" />
        <span className="intro-note">Diseñado para avanzar juntos.</span>
      </section>
      <section className="form-panel">
        <Card>
          <CardHeader>
            <p className="eyebrow">BIENVENIDO</p>
            <CardTitle>{signup ? "Crea tu cuenta" : "Inicia sesión"}</CardTitle>
            <CardDescription>
              {signup
                ? "Comienza a organizar tu trabajo con FlowSync."
                : "Continúa donde lo dejaste."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {signup && (
                <div className="field">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    placeholder="Ada Lovelace"
                  />
                </div>
              )}
              <div className="field">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="field">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              {signup && (
                <div className="field">
                  <Label htmlFor="passwordConfirmation">
                    Confirma tu contraseña
                  </Label>
                  <Input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    minLength={8}
                    required
                    placeholder="Repite tu contraseña"
                  />
                </div>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? "Procesando…" : signup ? "Crear cuenta" : "Entrar"}
              </Button>
            </form>
            <p className="switch-mode">
              {signup ? "¿Ya tienes una cuenta?" : "¿Aún no tienes una cuenta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(signup ? "login" : "signup");
                  setError("");
                }}
              >
                {signup ? "Inicia sesión" : "Regístrate"}
              </button>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default App;
