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

export function RegisterPage() {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)

    try {
      // fullName es nullable, no opcional: el campo tiene que viajar siempre.
      // Omitirlo cuando está vacío devuelve un 422 del validador.
      await register({
        fullName: fullName.trim() === '' ? null : fullName.trim(),
        email,
        password,
        passwordConfirmation,
      })
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
      title="Crea tu cuenta"
      description="Regístrate para empezar a organizar el trabajo del equipo."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium underline underline-offset-4"
          >
            Inicia sesión
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
          <Label htmlFor="fullName">
            Nombre completo{' '}
            <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="fullName"
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
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? 'password-error' : 'password-hint'
            }
            required
          />
          <FieldError id="password-error" message={fieldErrors.password} />
          {!fieldErrors.password && (
            <p id="password-hint" className="text-sm text-muted-foreground">
              Entre 8 y 32 caracteres.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="passwordConfirmation">Repite la contraseña</Label>
          <Input
            id="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            aria-invalid={Boolean(fieldErrors.passwordConfirmation)}
            aria-describedby={
              fieldErrors.passwordConfirmation
                ? 'passwordConfirmation-error'
                : undefined
            }
            required
          />
          <FieldError
            id="passwordConfirmation-error"
            message={fieldErrors.passwordConfirmation}
          />
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  )
}
