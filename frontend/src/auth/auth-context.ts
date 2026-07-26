import { createContext } from 'react'
import type { User } from '@/lib/types'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  user: User | null
  token: string | null
  status: AuthStatus
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Vive en su propio módulo para no romper el fast refresh del provider
// (regla `react/only-export-components` de oxlint).
export const AuthContext = createContext<AuthContextValue | null>(null)
