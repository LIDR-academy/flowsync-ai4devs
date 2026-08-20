import { useContext } from 'react'
import { AuthContext } from '@/auth/auth-context'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
