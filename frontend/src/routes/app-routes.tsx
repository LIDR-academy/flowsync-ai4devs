import { Navigate, Route, Routes } from 'react-router'
import { LoginPage } from '@/pages/login-page'
import { RegisterPage } from '@/pages/register-page'
import { ProfilePage } from '@/pages/profile-page'
import { TasksPage } from '@/pages/tasks-page'
import { ProtectedRoute } from '@/routes/protected-route'
import { PublicOnlyRoute } from '@/routes/public-only-route'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* La lista es la pantalla principal: cualquier dirección desconocida acaba ahí. */}
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  )
}
