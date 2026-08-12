import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/auth/use-auth'
import { FullScreenLoader } from '@/components/full-screen-loader'

/**
 * El espejo de `ProtectedRoute`: con sesión activa, login y registro no tienen
 * sentido y se rebota a la lista de tareas.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'loading') return <FullScreenLoader />
  if (status === 'authenticated') return <Navigate to="/tasks" replace />

  return <Outlet />
}
