import { useState } from 'react'
import { Link } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useAuth } from '@/auth/use-auth'
import { useAuthForm } from '@/auth/use-auth-form'
import { AuthLayout } from '@/components/auth-layout'
import { FieldError } from '@/components/field-error'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FIELDS = ['email', 'password'] as const

export function LoginPage() {
  const { login } = useAuth()
  const { isSubmitting, formError, fieldErrors, submit } = useAuthForm(FIELDS)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    return submit(() => login({ email, password }))
  }

  return (
    <AuthLayout
      title="Inicia sesión"
      description="Entra con tu cuenta para volver a tus tareas."
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {formError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          <FieldError id="email-error" message={fieldErrors.email} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'password-error' : undefined
            }
          />
          <FieldError id="password-error" message={fieldErrors.password} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" className="text-foreground font-medium underline">
          Crea una
        </Link>
      </p>
    </AuthLayout>
  )
}
