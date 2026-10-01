const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333/api/v1";

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

type ErrorItem = { field?: string; message: string };

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
    for (const item of items) {
      if (item.field && !fieldErrors[item.field])
        fieldErrors[item.field] = item.message;
    }
    throw new ApiError(
      response.status,
      items[0]?.message ?? "Ha ocurrido un error inesperado.",
      fieldErrors,
    );
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
