import { useEffect, useState } from 'react'
import './App.css'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const TOKEN_STORAGE_KEY = 'flowsync.token'

type AuthMode = 'login' | 'signup'

type User = {
  id: number
  fullName: string | null
  email: string
  initials: string | null
  createdAt: string
  updatedAt: string
}

type AuthResponse = {
  user: User
  token: string
}

type ApiEnvelope<T> = {
  data: T
}

type ApiErrorItem = {
  field?: string
  message?: string
  rule?: string
}

type SessionState =
  | {
      token: string
      user: User
    }
  | {
      token: null
      user: null
    }

type LoginForm = {
  email: string
  password: string
}

type SignupForm = {
  fullName: string
  email: string
  password: string
  passwordConfirmation: string
}

const loginInitialState: LoginForm = {
  email: '',
  password: '',
}

const signupInitialState: SignupForm = {
  fullName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
}

function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [session, setSession] = useState<SessionState>({ token: null, user: null })
  const [profileLoading, setProfileLoading] = useState(true)
  const [loginForm, setLoginForm] = useState<LoginForm>(loginInitialState)
  const [signupForm, setSignupForm] = useState<SignupForm>(signupInitialState)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!token) {
      setProfileLoading(false)
      return
    }

    void loadProfile(token)
  }, [])

  async function loadProfile(token: string) {
    setProfileLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/account/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(await getErrorMessage(response))
      }

      const payload = (await response.json()) as ApiEnvelope<User>
      setSession({ token, user: payload.data })
    } catch {
      clearSession()
      setLoginError('Your session is no longer valid. Please sign in again.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setLoginError(null)

    try {
      const payload = await post<AuthResponse>('/api/v1/auth/login', loginForm)
      persistSession(payload)
    } catch (error) {
      setLoginError(getReadableError(error, 'Invalid email or password.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setSignupError(null)

    try {
      const payload = await post<AuthResponse>('/api/v1/auth/signup', signupForm)
      persistSession(payload)
    } catch (error) {
      setSignupError(getReadableError(error, 'We could not create your account.'))
    } finally {
      setSubmitting(false)
    }
  }

  function persistSession(payload: AuthResponse) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
    setSession({ token: payload.token, user: payload.user })
    setLoginForm(loginInitialState)
    setSignupForm(signupInitialState)
    setLoginError(null)
    setSignupError(null)
  }

  function clearSession() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    setSession({ token: null, user: null })
  }

  async function post<T>(path: string, body: LoginForm | SignupForm) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(await getErrorMessage(response))
    }

    const payload = (await response.json()) as ApiEnvelope<T>
    return payload.data
  }

  if (profileLoading) {
    return (
      <main className="app-shell">
        <section className="status-panel">
          <p className="eyebrow">FlowSync</p>
          <h1>Checking your session</h1>
          <p>Loading the authenticated workspace against the Spring backend.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">FlowSync Auth</p>
        <h1>Access the protected workspace without leaving the frontend.</h1>
        <p className="hero-copy">
          This frontend uses the real Spring Boot contract for signup, login, token persistence,
          and profile retrieval.
        </p>
        <div className="hero-metrics" aria-label="Authentication checklist">
          <div>
            <strong>POST</strong>
            <span>/api/v1/auth/signup</span>
          </div>
          <div>
            <strong>POST</strong>
            <span>/api/v1/auth/login</span>
          </div>
          <div>
            <strong>GET</strong>
            <span>/api/v1/account/profile</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        {session.user ? (
          <ProfileCard
            user={session.user}
            onLogout={() => {
              clearSession()
              setMode('login')
            }}
          />
        ) : (
          <Card className="auth-card">
            <CardHeader>
              <div className="tab-row" role="tablist" aria-label="Authentication forms">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  className={mode === 'login' ? 'tab active' : 'tab'}
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  className={mode === 'signup' ? 'tab active' : 'tab'}
                  onClick={() => setMode('signup')}
                >
                  Register
                </button>
              </div>
              <CardTitle>{mode === 'login' ? 'Welcome back' : 'Create your account'}</CardTitle>
              <CardDescription>
                {mode === 'login'
                  ? 'Enter your credentials to get a JWT and open the protected profile view.'
                  : 'The backend signup contract also requires full name and password confirmation.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode === 'login' ? (
                <form className="auth-form" onSubmit={handleLoginSubmit}>
                  <FormField
                    label="Email"
                    inputId="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(value) => setLoginForm((current) => ({ ...current, email: value }))}
                  />
                  <FormField
                    label="Password"
                    inputId="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(value) =>
                      setLoginForm((current) => ({ ...current, password: value }))
                    }
                  />
                  {loginError ? (
                    <InlineError title="Login failed" description={loginError} />
                  ) : null}
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'Sign in'}
                  </Button>
                  <p className="switch-copy">
                    No account yet?{' '}
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => {
                        setMode('signup')
                        setLoginError(null)
                      }}
                    >
                      Create one here
                    </button>
                  </p>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleSignupSubmit}>
                  <FormField
                    label="Full name"
                    inputId="signup-full-name"
                    value={signupForm.fullName}
                    onChange={(value) =>
                      setSignupForm((current) => ({ ...current, fullName: value }))
                    }
                  />
                  <FormField
                    label="Email"
                    inputId="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(value) =>
                      setSignupForm((current) => ({ ...current, email: value }))
                    }
                  />
                  <FormField
                    label="Password"
                    inputId="signup-password"
                    type="password"
                    value={signupForm.password}
                    onChange={(value) =>
                      setSignupForm((current) => ({ ...current, password: value }))
                    }
                  />
                  <FormField
                    label="Confirm password"
                    inputId="signup-password-confirmation"
                    type="password"
                    value={signupForm.passwordConfirmation}
                    onChange={(value) =>
                      setSignupForm((current) => ({
                        ...current,
                        passwordConfirmation: value,
                      }))
                    }
                  />
                  {signupError ? (
                    <InlineError title="Signup failed" description={signupError} />
                  ) : null}
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Create account'}
                  </Button>
                  <p className="switch-copy">
                    Already registered?{' '}
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => {
                        setMode('login')
                        setSignupError(null)
                      }}
                    >
                      Go to login
                    </button>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  )
}

type FormFieldProps = {
  inputId: string
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}

function FormField({ inputId, label, onChange, type = 'text', value }: FormFieldProps) {
  return (
    <div className="field">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

function InlineError({ description, title }: { description: string; title: string }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}

function ProfileCard({ onLogout, user }: { onLogout: () => void; user: User }) {
  return (
    <Card className="auth-card profile-card">
      <CardHeader>
        <div className="profile-avatar" aria-hidden="true">
          {user.initials ?? user.email.slice(0, 2).toUpperCase()}
        </div>
        <CardTitle>Protected profile</CardTitle>
        <CardDescription>
          Authenticated against /api/v1/account/profile with the stored JWT.
        </CardDescription>
      </CardHeader>
      <CardContent className="profile-content">
        <dl className="profile-grid">
          <div>
            <dt>Full name</dt>
            <dd>{user.fullName || 'Not provided'}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd>{user.id}</dd>
          </div>
          <div>
            <dt>Initials</dt>
            <dd>{user.initials || 'N/A'}</dd>
          </div>
        </dl>
        <Button type="button" variant="secondary" onClick={onLogout}>
          Sign out locally
        </Button>
      </CardContent>
    </Card>
  )
}

async function getErrorMessage(response: Response) {
  const fallbackMessage =
    response.status === 401 ? 'Invalid email or password.' : 'Unexpected error while calling the API.'

  try {
    const payload = (await response.json()) as { errors?: ApiErrorItem[]; message?: string }

    if (payload.message) {
      return normalizeMessage(payload.message)
    }

    if (payload.errors?.length) {
      return payload.errors.map((item) => normalizeValidationMessage(item)).join(' ')
    }

    return fallbackMessage
  } catch {
    return fallbackMessage
  }
}

function normalizeValidationMessage(error: ApiErrorItem) {
  if (error.field === 'email' && error.rule === 'database.unique') {
    return 'This email is already registered.'
  }

  if (error.field === 'passwordConfirmation') {
    return 'Password confirmation must match the password.'
  }

  return normalizeMessage(error.message ?? 'Invalid request.')
}

function normalizeMessage(message: string) {
  if (message === 'Invalid credentials') {
    return 'Invalid email or password.'
  }

  return message
}

function getReadableError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export default App
