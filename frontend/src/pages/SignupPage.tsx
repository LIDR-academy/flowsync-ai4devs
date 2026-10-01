import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { useAuth } from "@/auth/AuthContext";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, fieldMessage } from "@/lib/api";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await signup({
        fullName: fullName.trim() || null,
        email,
        password,
        passwordConfirmation,
      });
      navigate("/profile", { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.status === 422) {
        const translated = Object.fromEntries(
          Object.keys(e.fieldErrors).map((f) => [f, fieldMessage(e, f)]),
        );
        setFieldErrors(translated);
        if (Object.keys(translated).length === 0) setError(e.message);
      } else {
        setError(
          e instanceof ApiError
            ? e.message
            : "Ha ocurrido un error inesperado.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  const fieldError = (name: string) =>
    fieldErrors[name] ? (
      <p className="text-sm text-destructive">{fieldErrors[name]}</p>
    ) : null;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate para empezar con FlowSync.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <CardContent className="flex flex-col gap-4">
            {error && <Alert>{error}</Alert>}
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Nombre (opcional)</Label>
              <Input
                id="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {fieldError("fullName")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldError("email")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                maxLength={32}
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {fieldError("password")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="passwordConfirmation">Confirmar contraseña</Label>
              <Input
                id="passwordConfirmation"
                type="password"
                required
                autoComplete="new-password"
                aria-invalid={!!fieldErrors.passwordConfirmation}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
              {fieldError("passwordConfirmation")}
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creando cuenta…" : "Registrarse"}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="text-primary underline underline-offset-4"
              >
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
