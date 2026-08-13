import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useAuth } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'long',
})

export function ProfilePage() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setLoggingOut] = useState(false)

  // `ProtectedRoute` garantiza que aquí ya hay sesión resuelta.
  if (!user) return null

  const handleLogout = () => {
    setLoggingOut(true)
    // No hace falta redirigir a mano: al cerrar sesión `ProtectedRoute` manda a /login.
    return logout()
  }

  return (
    <div className="bg-muted/40 flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/tasks">
            <ArrowLeftIcon />
            Volver a las tareas
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-medium">
              {user.initials}
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate">
                {user.fullName ?? 'Sin nombre'}
              </CardTitle>
              <CardDescription className="truncate">
                {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <dl className="grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Miembro desde</dt>
              <dd className="font-medium">
                {dateFormatter.format(new Date(user.createdAt))}
              </dd>
            </div>
          </dl>
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
