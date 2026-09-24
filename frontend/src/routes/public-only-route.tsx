import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth/use-auth'
import { FullScreenLoader } from '@/components/full-screen-loader'

/**
 * El espejo de `ProtectedRoute`: con sesión activa, login y registro no tienen
 * sentido y se rebota al perfil.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <FullScreenLoader />
  if (status === 'authenticated') return <Navigate to="/profile" replace />

  return <Outlet />
}
