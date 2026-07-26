import { useCallback, useEffect, useMemo, useState } from 'react'
import * as api from '@/lib/api'
import type { AuthResult, LoginPayload, SignupPayload, User } from '@/lib/types'
import { AuthContext, type AuthStatus } from '@/auth/auth-context'

const TOKEN_KEY = 'flowsync.token'

const readStoredToken = () => localStorage.getItem(TOKEN_KEY)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken)
  const [user, setUser] = useState<User | null>(null)
  // Si arrancamos con un token guardado hay que validarlo contra el backend
  // antes de dar la sesión por buena.
  const [status, setStatus] = useState<AuthStatus>(() =>
    readStoredToken() ? 'loading' : 'anonymous',
  )

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const startSession = useCallback(
    ({ user: nextUser, token: nextToken }: AuthResult) => {
      localStorage.setItem(TOKEN_KEY, nextToken)
      setToken(nextToken)
      setUser(nextUser)
      setStatus('authenticated')
    },
    [],
  )

  // Rehidrata la sesión al cargar: el token de localStorage solo vale si el
  // backend sigue reconociéndolo.
  useEffect(() => {
    const storedToken = readStoredToken()
    if (!storedToken) return

    let cancelled = false

    api
      .getProfile(storedToken)
      .then((profile) => {
        if (cancelled) return
        setUser(profile)
        setToken(storedToken)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!cancelled) clearSession()
      })

    return () => {
      cancelled = true
    }
  }, [clearSession])

  const login = useCallback(
    async (payload: LoginPayload) => {
      startSession(await api.login(payload))
    },
    [startSession],
  )

  const signup = useCallback(
    async (payload: SignupPayload) => {
      startSession(await api.signup(payload))
    },
    [startSession],
  )

  const logout = useCallback(async () => {
    const currentToken = token
    // La sesión local se cierra pase lo que pase: si el token ya no vale en el
    // servidor, el objetivo (dejar de estar logueado) está igualmente cumplido.
    clearSession()
    if (currentToken) {
      await api.logout(currentToken).catch(() => undefined)
    }
  }, [clearSession, token])

  const value = useMemo(
    () => ({ user, token, status, login, signup, logout }),
    [user, token, status, login, signup, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
