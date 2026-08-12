const API_BASE_URL = "http://localhost:3333/api/v1";

export interface AuthUser {
  id: number;
  fullName: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
  initials: string;
}

interface LoginResponse {
  data: {
    user: AuthUser;
    token: string;
  };
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    const message = body?.errors?.[0]?.message;
    return typeof message === "string" ? message : "No se pudo iniciar sesión";
  } catch {
    return "No se pudo iniciar sesión";
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  const { data } = (await response.json()) as LoginResponse;
  return data;
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_BASE_URL}/account/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
