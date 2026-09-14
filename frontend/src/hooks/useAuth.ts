import { useCallback, useState } from 'react'
import { login as loginRequest, logout as logoutRequest, type Session } from '../api/auth'

const STORAGE_KEY = 'flowsync.session'

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
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
      await logoutRequest(session.token).catch(() => {})
    }
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [session])

  return { session, login, logout }
}
