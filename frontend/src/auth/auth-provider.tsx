import { useCallback, useEffect, useMemo, useState } from 'react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import type { AuthResult, LoginPayload, SignupPayload, User } from '@/lib/types'
import { AuthContext, type AuthStatus } from '@/auth/auth-context'

const TOKEN_KEY = 'flowsync.token'

const readStoredToken = () => localStorage.getItem(TOKEN_KEY)

/**
 * Dueño de la sesión en el navegador.
 *
 * Guarda el token en `localStorage` bajo `flowsync.token` (deuda aceptada,
 * H-06) y al arrancar lo revalida contra el perfil antes de dar la sesión por
 * buena, con `status` en `loading` mientras tanto. Es el único suscriptor de
 * {@link api.onUnauthorized}: cualquier `401` de cualquier pantalla cierra la
 * sesión aquí y deja el motivo para el login.
 */
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

        // Un 401 aquí ya lo ha cerrado `onUnauthorized`, que desde H-13 es el
        // dueño único de «una credencial rechazada cierra la sesión» y corre
        // antes de que esta promesa se rechace. Repetirlo aquí no rompía nada
        // -`clearSession` es idempotente y el mensaje era el mismo- pero dejaba
        // la misma regla escrita en dos sitios, que es como las dos copias
        // acaban divergiendo. Lo señaló el revisor adversarial en CI.
        if (error instanceof ApiError && error.status === 401) return

        // Lo que sí es propio del arranque, y por eso se queda: **un fallo que
        // no sea 401 no borra el token guardado**. La sesión en memoria sí se
        // cierra -se sale a la pantalla de acceso con el aviso-, pero el token
        // sigue en `localStorage`, porque puede seguir siendo bueno: al recargar
        // con el servidor de vuelta, la sesión se restaura sin volver a entrar.
        // Por eso aquí no se llama a `clearSession()`, que lo borraría. Es la D4
        // del change `2026-08-26-fix-defectos-abiertos` y el escenario «Backend
        // apagado al arrancar con sesión guardada» de la spec de `auth`.
        //
        // Hasta el 2026-09-13 este comentario decía «no debe cerrar la sesión»,
        // y el código de debajo la cierra: lo señaló como grave el revisor de
        // CI. Comprobado en navegador con el backend apagado y después
        // arrancado.
        setToken(null)
        setUser(null)
        setStatus('anonymous')

        setSessionError(
          error instanceof ApiError
            ? error.message
            : 'No hemos podido restaurar tu sesión.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [])

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
