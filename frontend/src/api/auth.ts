const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export type AuthUser = {
  id: number
  fullName: string | null
  email: string
  initials: string
}

type ValidationErrorBody = {
  errors?: { message: string }[]
}

async function unwrap<T>(response: Response): Promise<T> {
  const body = await response.json()

  if (!response.ok) {
    const validationBody = body as ValidationErrorBody
    const message = validationBody.errors?.map((error) => error.message).join(', ')
    throw new Error(message || 'Something went wrong. Please try again.')
  }

  return (body as { data: T }).data
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return unwrap<{ user: AuthUser; token: string }>(response)
}

export async function fetchProfile(token: string) {
  const response = await fetch(`${API_URL}/api/v1/account/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  return unwrap<AuthUser>(response)
}

export async function logout(token: string) {
  await fetch(`${API_URL}/api/v1/account/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}
