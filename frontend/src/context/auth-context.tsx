import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '@/lib/auth-api'
import type { User } from '@/lib/auth-api'

const TOKEN_STORAGE_KEY = 'flowsync.token'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type SignupPayload = {
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(token ? 'loading' : 'unauthenticated')

  useEffect(() => {
    if (!token) {
      setStatus('unauthenticated')
      return
    }

    let cancelled = false

    authApi
      .getProfile(token)
      .then((profile) => {
        if (cancelled) return
        setUser(profile)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function persistSession(result: authApi.AuthResult) {
    localStorage.setItem(TOKEN_STORAGE_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
    setStatus('authenticated')
  }

  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password })
    persistSession(result)
  }

  async function signup(payload: SignupPayload) {
    const result = await authApi.signup(payload)
    persistSession(result)
  }

  function logout() {
    if (token) {
      authApi.logout(token).catch(() => {})
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
