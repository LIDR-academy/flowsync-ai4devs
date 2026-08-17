import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="dashboard">
      <h1>Welcome, {user.fullName || user.email}</h1>
      <p>
        Signed in as <code>{user.email}</code>
      </p>
      <button type="button" className="counter" onClick={() => logout()}>
        Log out
      </button>
    </div>
  )
}
