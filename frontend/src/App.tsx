import './App.css'
import { LoginForm } from './components/LoginForm'
import { useAuth } from './hooks/useAuth'

function App() {
  const { session, login, logout } = useAuth()

  return (
    <section id="center">
      {session ? (
        <div className="session-panel">
          <h1>Hola, {session.user.fullName ?? session.user.email}</h1>
          <p>Sesión iniciada como {session.user.email}</p>
          <button type="button" className="counter" onClick={() => void logout()}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <LoginForm onSubmit={login} />
      )}
    </section>
  )
}

export default App
