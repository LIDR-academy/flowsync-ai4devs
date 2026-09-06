import { useCallback, useEffect, useMemo, useState } from 'react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
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
  // Por qué se cayó una sesión que ya existía. Se pinta en el login para que
  // nadie acabe ahí sin saber por qué.
  const [sessionError, setSessionError] = useState<string | null>(null)

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
      setSessionError(null)
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
      .catch((error: unknown) => {
        if (cancelled) return

        if (error instanceof ApiError && error.status === 401) {
          // El backend ha rechazado el token: ya no sirve para nada.
          clearSession()
        } else {
          // Backend caído o error del servidor. El token puede seguir siendo
          // bueno, así que se conserva y bastará con recargar cuando vuelva;
          // borrarlo aquí cerraría la sesión por un corte de red pasajero.
          setToken(null)
          setUser(null)
          setStatus('anonymous')
        }

        setSessionError(
          error instanceof ApiError
            ? error.message
            : 'No hemos podido restaurar tu sesión.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [clearSession])

  /**
   * Cualquier 401 posterior al arranque cierra la sesión, venga de la operación
   * que venga.
   *
   * Es H-13: antes solo se limpiaba el token al rehidratar, así que una
   * credencial que dejaba de valer con la lista abierta dejaba el estado en
   * `authenticated`, el aviso pedía volver a entrar y el guard de rutas
   * públicas rebotaba `/login` de vuelta a `/tasks`. La persona leía qué hacer
   * y el producto se lo impedía.
   *
   * Se engancha al único punto por el que pasan todas las respuestas, y no a
   * cada pantalla: así lo hereda cualquier pantalla que se añada mañana.
   */
  useEffect(() => {
    return api.onUnauthorized((error) => {
      clearSession()
      setSessionError(error.message)
    })
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
    setSessionError(null)
    if (currentToken) {
      await api.logout(currentToken).catch(() => undefined)
    }
  }, [clearSession, token])

  const value = useMemo(
    () => ({ user, token, status, sessionError, login, signup, logout }),
    [user, token, status, sessionError, login, signup, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
