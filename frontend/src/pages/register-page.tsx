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

const FIELDS = [
  'fullName',
  'email',
  'password',
  'passwordConfirmation',
] as const

export function RegisterPage() {
  const { signup } = useAuth()
  const { isSubmitting, formError, fieldErrors, submit, failWith } =
    useAuthForm(FIELDS)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    // Comprobación local para no gastar un viaje al servidor en un despiste
    // evidente; la validación de verdad sigue siendo la del backend.
    if (password !== passwordConfirmation) {
      failWith('passwordConfirmation', 'Las contraseñas no coinciden.')
      return
    }

    return submit(() =>
      signup({
        // `fullName` es `.nullable()` en el backend: la clave viaja siempre.
        fullName: fullName.trim() || null,
        email,
        password,
        passwordConfirmation,
      }),
    )
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      description="Regístrate para empezar a organizar el trabajo del equipo."
    >
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {formError && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-2">
          <Label htmlFor="fullName">
            Nombre completo{' '}
            <span className="text-muted-foreground font-normal">
              (opcional)
            </span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={
              fieldErrors.fullName ? 'fullName-error' : undefined
            }
          />
          <FieldError id="fullName-error" message={fieldErrors.fullName} />
        </div>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'password-error' : 'password-hint'
            }
          />
          {fieldErrors.password ? (
            <FieldError id="password-error" message={fieldErrors.password} />
          ) : (
            <p id="password-hint" className="text-muted-foreground text-sm">
              Entre 8 y 32 caracteres.
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="passwordConfirmation">Repite la contraseña</Label>
          <Input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            aria-invalid={Boolean(fieldErrors.passwordConfirmation)}
            aria-describedby={
              fieldErrors.passwordConfirmation
                ? 'passwordConfirmation-error'
                : undefined
            }
          />
          <FieldError
            id="passwordConfirmation-error"
            message={fieldErrors.passwordConfirmation}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-foreground font-medium underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
