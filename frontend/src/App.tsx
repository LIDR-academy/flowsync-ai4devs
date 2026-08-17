import { AuthProvider, useAuth } from './hooks/useAuth'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import './App.css'

function AppContent() {
  const { status } = useAuth()

  return (
    <section id="center">
      {status === 'restoring' && <p>Loading…</p>}
      {status === 'signed-out' && <LoginForm />}
      {status === 'signed-in' && <Dashboard />}
    </section>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
