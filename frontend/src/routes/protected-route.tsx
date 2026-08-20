import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth/use-auth'
import { FullScreenLoader } from '@/components/full-screen-loader'

/**
 * Deja pasar solo con sesión válida. Mientras el token guardado se valida
 * contra el backend no se redirige: hacerlo expulsaría al usuario en cada
 * recarga de página.
 */
export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <FullScreenLoader />
  if (status === 'anonymous') return <Navigate to="/login" replace />

  return <Outlet />
}
