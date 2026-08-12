import { useState } from "react";
import { login, type AuthUser } from "../lib/api";

interface LoginFormProps {
  onSuccess: (user: AuthUser, token: string) => void;
}

function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { user, token } = await login(email, password);
      onSuccess(user, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error && (
        <p className="login-form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="counter" disabled={isSubmitting}>
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

export default LoginForm;
