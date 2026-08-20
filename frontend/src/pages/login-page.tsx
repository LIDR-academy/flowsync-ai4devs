import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/auth/use-auth'
import { ApiError } from '@/lib/api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth-layout'
import { FieldError } from '@/components/field-error'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    try {
      await login({ email, password })
    } catch (caught) {
      if (caught instanceof ApiError) {
        // Si el error apunta a campos concretos se pinta bajo cada uno; repetirlo
        // arriba sería mostrar el mismo texto dos veces.
        const hasFieldErrors = Object.keys(caught.fieldErrors).length > 0
        setError(hasFieldErrors ? null : caught.message)
        setFieldErrors(caught.fieldErrors)
      } else {
        setError('Ha ocurrido un error inesperado.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Inicia sesión"
      description="Entra con tu cuenta para volver a tus tareas."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium underline underline-offset-4"
          >
            Crea una
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            required
          />
          <FieldError id="email-error" message={fieldErrors.email} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'password-error' : undefined
            }
            required
          />
          <FieldError id="password-error" message={fieldErrors.password} />
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  )
}
