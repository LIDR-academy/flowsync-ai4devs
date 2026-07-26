import { useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router'
import { z } from 'zod'
import { CircleAlertIcon, LoaderCircleIcon } from 'lucide-react'
import { useAuth } from '@/auth/use-auth'
import { ApiError } from '@/lib/api'
import { zodResolver } from '@/lib/zod-resolver'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Espejo de `loginValidator` (backend/app/validators/user.ts). El backend solo
 * exige 8–32 caracteres de contraseña en el signup, no en el login, así que
 * aquí basta con que no vaya vacía.
 */
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .max(254, 'El email no puede superar los 254 caracteres')
    .pipe(z.email('Introduce un email válido')),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { status, signIn } = useAuth()
  const location = useLocation()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password)
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof ApiError
            ? error.message
            : 'No se ha podido iniciar sesión. Inténtalo de nuevo.',
      })
    }
  })

  if (status === 'loading') {
    return <FullScreenLoader />
  }

  // Al autenticarse, este mismo guard devuelve al usuario a donde iba.
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/'} replace />
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Entrar en FlowSync</CardTitle>
          <CardDescription>
            Introduce tus credenciales para acceder a tu espacio de trabajo.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            {errors.root ? (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>No se ha podido iniciar sesión</AlertTitle>
                <AlertDescription>{errors.root.message}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                aria-invalid={errors.email !== undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...form.register('email')}
              />
              {errors.email ? (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors.password !== undefined}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                {...form.register('password')}
              />
              {errors.password ? (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : null}
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
