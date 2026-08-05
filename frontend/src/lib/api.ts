const API_BASE_URL = 'http://localhost:3333/api/v1'

export type ApiUser = {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string
  initials: string
}

export type AuthResponse = {
  user: ApiUser
  token: string
}

export class ApiError extends Error {
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.fieldErrors = fieldErrors
  }
}

async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  const { method = 'GET', body, token } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)

    if (Array.isArray(payload?.errors)) {
      const fieldErrors: Record<string, string> = {}
      for (const error of payload.errors) {
        if (error.field && error.message) {
          fieldErrors[error.field] = error.message
        }
      }
      const message = payload.errors[0]?.message ?? 'Ocurrió un error inesperado.'
      throw new ApiError(message, fieldErrors)
    }

    throw new ApiError(payload?.message ?? 'Ocurrió un error inesperado.')
  }

  const payload = await response.json()
  return payload.data as T
}

export function signup(input: {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
}) {
  return apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body: input })
}

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: input })
}

export function getProfile(token: string) {
  return apiFetch<ApiUser>('/account/profile', { token })
}

export function logout(token: string) {
  return apiFetch<{ message: string }>('/account/logout', { method: 'POST', token })
}
