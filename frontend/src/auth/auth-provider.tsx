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

  const forgetSession = useCallback(() => {
    api.clearToken()
    setUser(null)
    setStatus('anonymous')
  }, [])

  /**
   * El token local se borra pase lo que pase. Que la revocación en servidor
   * falle (token ya inválido, backend caído, sin red) no puede dejar al
   * usuario "dentro", ni propagar un rechazo que nadie captura.
   */
  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // Sin acción: lo que importa es que la sesión local desaparezca.
    } finally {
      forgetSession()
    }
  }, [forgetSession])

  /**
   * Relee el perfil desde el backend. Un 401 aquí significa que la sesión
   * murió mientras la app seguía abierta, así que se cierra en el sitio.
   */
  const refreshProfile = useCallback(async () => {
    try {
      setUser(await api.getProfile())
    } catch (error) {
      if (error instanceof api.ApiError && error.status === 401) forgetSession()
    }
  }, [forgetSession])

  return (
    <AuthContext.Provider
      value={{ status, user, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}
