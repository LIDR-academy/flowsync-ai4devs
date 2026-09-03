import { useEffect, useState, type FormEvent } from "react";
import { Alert } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1";
const TOKEN_KEY = "flowsync.auth-token";

type Mode = "login" | "signup";
type User = { id: number; fullName: string; email: string; initials: string };
type AuthResponse = { user: User; token: string };
type ApiEnvelope<T> = { data: T };
type ApiError = { message?: string; errors?: Array<{ message?: string }> };

function messageFrom(error: ApiError, fallback: string) {
  return error.errors?.[0]?.message ?? error.message ?? fallback;
}

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> &
    ApiError;

  if (!response.ok)
    throw new Error(messageFrom(body, "No pudimos completar la solicitud."));
  return body.data;
}

function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    void request<User>("/account/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setError("");
    setSubmitting(true);
    try {
      const payload =
        mode === "signup"
          ? {
              fullName: String(formData.get("fullName") ?? ""),
              email,
              password,
              passwordConfirmation: String(
                formData.get("passwordConfirmation") ?? "",
              ),
            }
          : { email, password };
      const auth = await request<AuthResponse>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      localStorage.setItem(TOKEN_KEY, auth.token);
      setUser(auth.user);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No pudimos iniciar sesión.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
  }
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setMode("login");
  }

  if (loading)
    return (
      <main className="auth-shell">
        <p className="loading">Verificando tu sesión...</p>
      </main>
    );
  if (user)
    return (
      <main className="auth-shell">
        <Card className="profile-card">
          <div className="brand-mark" aria-hidden="true">
            F
          </div>
          <p className="eyebrow">Tu espacio de trabajo</p>
          <h1>Hola, {user.fullName}</h1>
          <p className="profile-copy">
            Tu cuenta está lista para mantener los proyectos en movimiento.
          </p>
          <div className="profile-details">
            <span>{user.initials}</span>
            <div>
              <strong>{user.fullName}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <Button className="secondary-button" onClick={logout}>
            Cerrar sesión
          </Button>
        </Card>
      </main>
    );

  const isSignup = mode === "signup";
  return (
    <main className="auth-shell">
      <section className="intro-panel">
        <div className="brand">
          <span className="brand-mark">F</span> FlowSync
        </div>
        <div>
          <p className="eyebrow">Trabajo claro, equipos conectados</p>
          <h1>Haz que cada entrega avance.</h1>
          <p className="intro-copy">
            Un lugar sencillo para seguir el ritmo de tu equipo y convertir
            pendientes en progreso.
          </p>
        </div>
        <p className="intro-footnote">Organiza. Alinea. Entrega.</p>
      </section>
      <section className="form-panel">
        <Card>
          <p className="eyebrow">
            {isSignup ? "Crea tu cuenta" : "Bienvenido de vuelta"}
          </p>
          <h2>{isSignup ? "Empieza a sincronizar" : "Inicia sesión"}</h2>
          <p className="form-copy">
            {isSignup
              ? "Configura tu acceso en menos de un minuto."
              : "Ingresa tus datos para continuar."}
          </p>
          <form onSubmit={handleSubmit}>
            {isSignup && (
              <div className="field">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div className="field">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="tu@equipo.com"
                required
              />
            </div>
            <div className="field">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={isSignup ? 8 : undefined}
                required
              />
            </div>
            {isSignup && (
              <div className="field">
                <Label htmlFor="passwordConfirmation">
                  Confirma tu contraseña
                </Label>
                <Input
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            )}
            {error && <Alert>{error}</Alert>}
            <Button
              className="submit-button"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Un momento..."
                : isSignup
                  ? "Crear cuenta"
                  : "Entrar a FlowSync"}
            </Button>
          </form>
          <p className="switch-copy">
            {isSignup ? "¿Ya tienes una cuenta?" : "¿Primera vez en FlowSync?"}{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => changeMode(isSignup ? "login" : "signup")}
            >
              {isSignup ? "Inicia sesión" : "Crea tu cuenta"}
            </button>
          </p>
        </Card>
      </section>
    </main>
  );
}

export default App;
