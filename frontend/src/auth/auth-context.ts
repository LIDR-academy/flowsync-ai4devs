import { createContext } from 'react'
import type { LoginPayload, SignupPayload, User } from '@/lib/types'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: SignupPayload) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

/**
 * Vive en su propio fichero, sin componentes: la regla `react/only-export-components`
 * de oxlint prohíbe mezclar componentes y otros exports en el mismo módulo.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)
