const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3333/api/v1" : undefined);

// "" es válido (mismo origen con proxy); solo falla si no está definida.
if (API_URL === undefined) {
  throw new Error(
    "Falta VITE_API_URL: defínela al compilar (ver .env.example).",
  );
}

export const TOKEN_KEY = "flowsync.token";

export type User = {
  id: number;
  fullName: string | null;
  email: string;
  initials: string;
  createdAt: string;
  updatedAt: string | null;
};

export type AuthResult = { user: User; token: string };

type ErrorItem = { field?: string; message: string; rule?: string };

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  fieldRules: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
    fieldRules: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.fieldRules = fieldRules;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // almacenamiento no disponible: la sesión dura solo mientras la pestaña
  }
}

const RULE_MESSAGES: Record<string, string> = {
  required: "Este campo es obligatorio.",
  email: "Introduce un email válido.",
  minLength: "El valor es demasiado corto.",
  maxLength: "El valor es demasiado largo.",
  sameAs: "Las contraseñas no coinciden.",
  "database.unique": "Este email ya está registrado.",
};

/** Mensaje en español para un error de validación, según la regla del backend. */
export function fieldMessage(error: ApiError, field: string) {
  const rule = error.fieldRules[field];
  return (rule && RULE_MESSAGES[rule]) ?? error.fieldErrors[field];
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (token && !headers.has("Authorization"))
    headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      "No se pudo conectar con el servidor. Inténtalo de nuevo.",
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const items: ErrorItem[] = Array.isArray(body?.errors) ? body.errors : [];
    const fieldErrors: Record<string, string> = {};
    const fieldRules: Record<string, string> = {};
    for (const item of items) {
      if (item.field && !fieldErrors[item.field]) {
        fieldErrors[item.field] = item.message;
        if (item.rule) fieldRules[item.field] = item.rule;
      }
    }
    throw new ApiError(
      response.status,
      items[0]?.message ?? "Ha ocurrido un error inesperado.",
      fieldErrors,
      fieldRules,
    );
  }
  if (typeof body !== "object" || body === null || !("data" in body)) {
    throw new ApiError(response.status, "Respuesta inesperada del servidor.");
  }
  return body.data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (input: {
    fullName: string | null;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) =>
    request<AuthResult>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  profile: () => request<User>("/account/profile"),
  logout: () =>
    request<{ message: string }>("/account/logout", { method: "POST" }),
};
