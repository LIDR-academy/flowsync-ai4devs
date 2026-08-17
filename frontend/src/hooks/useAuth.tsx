import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { AuthUser } from '../api/auth'

const TOKEN_STORAGE_KEY = 'flowsync.token'

type AuthStatus = 'restoring' | 'signed-out' | 'signed-in'

type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>(token ? 'restoring' : 'signed-out')

  useEffect(() => {
    if (!token) return

    authApi
      .fetchProfile(token)
      .then((profile) => {
        setUser(profile)
        setStatus('signed-in')
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setToken(null)
        setStatus('signed-out')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(email: string, password: string) {
    const { user: loggedInUser, token: newToken } = await authApi.login(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    setToken(newToken)
    setUser(loggedInUser)
    setStatus('signed-in')
  }

  async function logout() {
    try {
      if (token) await authApi.logout(token)
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setToken(null)
      setUser(null)
      setStatus('signed-out')
    }
  }

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
