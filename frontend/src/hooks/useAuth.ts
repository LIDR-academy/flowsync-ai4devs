import { useCallback, useState } from 'react'
import { login as loginRequest, logout as logoutRequest, type Session } from '../api/auth'

const STORAGE_KEY = 'flowsync.session'

function isValidSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<Session>
  return (
    typeof candidate.token === 'string' &&
    typeof candidate.user === 'object' &&
    candidate.user !== null &&
    typeof candidate.user.email === 'string'
  )
}

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isValidSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(readStoredSession)

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = await loginRequest(email, password)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }, [])

  const logout = useCallback(async () => {
    if (session) {
      await logoutRequest(session.token).catch((error: unknown) => {
        console.warn('No se pudo revocar el token en el servidor', error)
      })
    }
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [session])

  return { session, login, logout }
}
