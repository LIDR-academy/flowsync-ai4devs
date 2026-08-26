import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useAuth } from '@/auth/use-auth'
import { EmptyTaskList } from '@/components/empty-task-list'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { NewTaskForm } from '@/components/new-task-form'
import { TaskRow } from '@/components/task-row'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import type { Task, TaskStatus } from '@/lib/types'

export function TasksPage() {
  const { token, user, logout } = useAuth()
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | undefined>()
  const [isCreating, setCreating] = useState(false)
  const [pendingIds, setPendingIds] = useState<number[]>([])
  // Remontar el formulario es lo que vacía el campo tras crear, sin duplicar
  // su estado aquí.
  const [formKey, setFormKey] = useState(0)

  const describe = (error: unknown) =>
    error instanceof ApiError
      ? error.message
      : 'Algo ha ido mal. Inténtalo de nuevo.'

  useEffect(() => {
    if (!token) return

    let cancelled = false

    api
      .getTasks(token)
      .then((loaded) => {
        if (!cancelled) setTasks(loaded)
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(describe(error))
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const handleCreate = useCallback(
    async (title: string) => {
      if (!token) return

      setCreating(true)
      setTitleError(undefined)
      setActionError(null)

      try {
        const created = await api.createTask(token, { title })
        setTasks((current) => [...(current ?? []), created])
        setFormKey((key) => key + 1)
      } catch (error: unknown) {
        if (error instanceof ApiError && error.fieldErrors.title) {
          setTitleError(error.fieldErrors.title)
        } else {
          setActionError(describe(error))
        }
      } finally {
        setCreating(false)
      }
    },
    [token],
  )

  /**
   * Actualización optimista: la fila cambia antes de que el servidor conteste,
   * porque el requisito pide que el cambio se refleje de inmediato. Si falla,
   * la fila vuelve a su estado real y se explica: una vista que se queda
   * mintiendo es peor que una que tarda.
   */
  const handleStatusChange = useCallback(
    async (task: Task, status: TaskStatus) => {
      if (!token) return

      const previous = task.status
      setActionError(null)
      setPendingIds((ids) => [...ids, task.id])
      setTasks((current) =>
        (current ?? []).map((t) => (t.id === task.id ? { ...t, status } : t)),
      )

      try {
        const updated = await api.updateTask(token, task.id, { status })
        setTasks((current) =>
          (current ?? []).map((t) => (t.id === task.id ? updated : t)),
        )
      } catch (error: unknown) {
        setTasks((current) =>
          (current ?? []).map((t) =>
            t.id === task.id ? { ...t, status: previous } : t,
          ),
        )
        setActionError(describe(error))
      } finally {
        setPendingIds((ids) => ids.filter((id) => id !== task.id))
      }
    },
    [token],
  )

  if (loadError) {
    // Un 401 ya no llega aquí: cierra la sesión y lleva al acceso. Lo que sí
    // llega es el resto (servidor caído, error propio), y esa pantalla también
    // necesita salida: sin ella se queda en un aviso del que solo se sale
    // recargando, que es la misma forma de callejón que H-13.
    return (
      <div className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-4">
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
            <Button variant="ghost" onClick={() => void logout()}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (tasks === null) return <FullScreenLoader />

  return (
    <div className="bg-muted/40 flex min-h-svh justify-center p-6">
      <Card className="h-fit w-full max-w-2xl">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>El trabajo del equipo</CardTitle>
              <CardDescription>
                La misma lista para todos. Sin preguntar a nadie.
              </CardDescription>
            </div>
            <Link
              to="/profile"
              className="text-muted-foreground hover:text-foreground text-sm underline"
            >
              {user?.fullName ?? 'Mi perfil'}
            </Link>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          <NewTaskForm
            key={formKey}
            isSubmitting={isCreating}
            error={titleError}
            onSubmit={handleCreate}
          />

          {actionError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          {tasks.length === 0 ? (
            <EmptyTaskList />
          ) : (
            <ul>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  pending={pendingIds.includes(task.id)}
                  onStatusChange={(status) =>
                    void handleStatusChange(task, status)
                  }
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
