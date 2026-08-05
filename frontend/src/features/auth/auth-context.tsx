import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '@/lib/api'
import type { ApiUser } from '@/lib/api'

const TOKEN_STORAGE_KEY = 'flowsync_token'

type AuthContextValue = {
  user: ApiUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (input: {
    fullName: string
    email: string
    password: string
    passwordConfirmation: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_STORAGE_KEY)
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    api
      .getProfile(token)
      .then(setUser)
      .catch(() => {
        setToken(null)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  function applySession(session: api.AuthResponse) {
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token)
    setToken(session.token)
    setUser(session.user)
  }

  async function login(email: string, password: string) {
    const session = await api.login({ email, password })
    applySession(session)
  }

  async function signup(input: {
    fullName: string
    email: string
    password: string
    passwordConfirmation: string
  }) {
    const session = await api.signup(input)
    applySession(session)
  }

  async function logout() {
    if (token) {
      await api.logout(token).catch(() => {})
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
