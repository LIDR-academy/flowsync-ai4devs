import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth/use-auth'
import { FullScreenLoader } from '@/components/full-screen-loader'

/**
 * Deja pasar solo con sesión válida. Mientras se rehidrata el token guardado
 * no redirige, o un recargado de página echaría al usuario fuera.
 */
export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <FullScreenLoader />
  if (status === 'anonymous') return <Navigate to="/login" replace />

  return <Outlet />
}
