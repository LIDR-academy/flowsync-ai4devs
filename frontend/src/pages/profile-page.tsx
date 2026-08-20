import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfilePage() {
  const { user, logout, refreshProfile } = useAuth()
  const [leaving, setLeaving] = useState(false)

  // La vista lee su dato de GET /account/profile, no del payload del login:
  // así refleja el perfil actual y detecta una sesión revocada al entrar.
  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  if (!user) return null

  async function handleLogout() {
    setLeaving(true)
    await logout()
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Tu perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
              {user.initials}
            </span>
            <div>
              <p className="font-medium">{user.fullName ?? 'Sin nombre'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={leaving}
            onClick={() => void handleLogout()}
          >
            {leaving ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
