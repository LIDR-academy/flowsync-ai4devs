import { apiFetch } from './client'

export interface AuthUser {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  user: AuthUser
  token: string
}

interface LoginResponse {
  data: Session
}

export async function login(email: string, password: string): Promise<Session> {
  const response = await apiFetch<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return response.data
}

export async function logout(token: string): Promise<void> {
  await apiFetch('/api/v1/account/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}
