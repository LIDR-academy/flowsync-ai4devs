import { useCallback, useEffect, useState, type ReactNode } from 'react'
import * as api from '@/lib/api'
import { AuthContext, type AuthStatus } from '@/auth/auth-context'
import type { LoginPayload, SignupPayload, User } from '@/lib/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)

  /**
   * Un token en localStorage no garantiza una sesión viva: puede haber sido
   * revocado con un logout desde otra pestaña. Se valida contra el backend
   * antes de dar por buena la sesión.
   */
  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (!localStorage.getItem(api.TOKEN_STORAGE_KEY)) {
        if (!cancelled) setStatus('anonymous')
        return
      }

      try {
        const profile = await api.getProfile()
        if (cancelled) return
        setUser(profile)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        api.clearToken()
        setStatus('anonymous')
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const { token, user: loggedIn } = await api.login(payload)
    api.storeToken(token)
    setUser(loggedIn)
    setStatus('authenticated')
  }, [])

  const register = useCallback(async (payload: SignupPayload) => {
    const { token, user: created } = await api.signup(payload)
    api.storeToken(token)
    setUser(created)
    setStatus('authenticated')
  }, [])

  /**
   * El token local se borra pase lo que pase. Si la revocación en servidor
   * falla, dejar al usuario "dentro" sería peor que perder esa llamada.
   */
  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      api.clearToken()
      setUser(null)
      setStatus('anonymous')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
