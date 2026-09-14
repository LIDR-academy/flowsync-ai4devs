import { useContext } from 'react'
import { AuthContext } from '@/auth/auth-context'

/**
 * La sesión: estado, cuenta, token y las acciones de entrar, registrarse y salir.
 *
 * @throws {Error} Si se usa fuera de `<AuthProvider>`, para que el olvido falle
 * al montar y no como un `undefined` más adelante.
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }

  return context
}
