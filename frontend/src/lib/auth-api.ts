import { request, requestData } from '@/lib/api-client'

export type User = {
  id: number
  fullName: string | null
  email: string
  createdAt: string
  updatedAt: string
  initials: string
}

export type AuthResult = {
  user: User
  token: string
}

export function signup(payload: {
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}) {
  return requestData<AuthResult>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload: { email: string; password: string }) {
  return requestData<AuthResult>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getProfile(token: string) {
  return requestData<User>('/api/v1/account/profile', undefined, token)
}

export function logout(token: string) {
  return request('/api/v1/account/logout', { method: 'POST' }, token)
}
