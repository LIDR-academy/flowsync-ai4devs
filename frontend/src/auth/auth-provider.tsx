import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from '@/auth/auth-context'
import type { AuthContextValue, AuthStatus } from '@/auth/auth-context'
import * as api from '@/lib/api'
import type { User } from '@/lib/types'

const STORAGE_KEY = 'flowsync.token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  // Rehidratación al arrancar: el token vive en localStorage, pero el perfil se
  // vuelve a pedir para descartar tokens que el servidor ya haya revocado.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === null) {
      setStatus('anonymous')
      return
    }

    let active = true

    api
      .getProfile(stored)
      .then((profile) => {
        if (!active) return
        setUser(profile)
        setToken(stored)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        localStorage.removeItem(STORAGE_KEY)
        setStatus('anonymous')
      })

    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await api.login({ email, password })

    localStorage.setItem(STORAGE_KEY, session.token)
    setUser(session.user)
    setToken(session.token)
    setStatus('authenticated')
  }, [])

  const signOut = useCallback(async () => {
    try {
      if (token !== null) await api.logout(token)
    } catch {
      // Best effort: si el servidor no responde, la sesión local se limpia igual.
    } finally {
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      setToken(null)
      setStatus('anonymous')
    }
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, status, signIn, signOut }),
    [user, token, status, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
