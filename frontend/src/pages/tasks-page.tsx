import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/auth/use-auth'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { NewTaskForm } from '@/components/new-task-form'
import { TaskRow } from '@/components/task-row'
import { TasksEmptyState } from '@/components/tasks-empty-state'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import type { Task, TaskStatus } from '@/lib/types'

export function TasksPage() {
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState<Task[] | null>(null)
  // «No hay tareas» y «no hemos podido cargarlas» son cosas distintas, y solo
  // la primera merece la explicación del estado vacío.
  const [loadFailed, setLoadFailed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | undefined>(undefined)
  const [isCreating, setCreating] = useState(false)
  // Qué filas tienen un cambio de estado en vuelo, para no encadenar clics
  // sobre una respuesta que aún no ha llegado.
  const [busyIds, setBusyIds] = useState<number[]>([])

  const describe = useCallback(
    (cause: unknown) =>
      cause instanceof ApiError
        ? cause.message
        : 'Algo ha ido mal. Inténtalo de nuevo.',
    [],
  )

  useEffect(() => {
    if (!token) return

    let cancelled = false

    api
      .listTasks(token)
      .then((loaded) => {
        if (!cancelled) setTasks(loaded)
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        setLoadFailed(true)
        setError(describe(cause))
      })

    return () => {
      cancelled = true
    }
  }, [token, describe])

  /**
   * La tarea recién creada se inserta con la respuesta del POST: ni se recarga
   * la lista ni se navega a ningún sitio.
   */
  const handleCreate = async (title: string) => {
    if (!token) return false

    setCreating(true)
    setError(null)
    setTitleError(undefined)

    try {
      const created = await api.createTask({ title }, token)
      setTasks((current) => [...(current ?? []), created])
      return true
    } catch (cause) {
      if (cause instanceof ApiError && cause.fieldErrors.title) {
        setTitleError(cause.fieldErrors.title)
      } else {
        setError(describe(cause))
      }
      return false
    } finally {
      setCreating(false)
    }
  }

  /**
   * El cambio se pinta antes de confirmarse y se revierte si el backend lo
   * rechaza. La fila se sustituye en su sitio: no hay criterio de ordenación
   * decidido, así que recargar la lista podría moverlo todo de sitio.
   */
  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (!token || task.status === status) return

    const previous = task.status
    const replace = (id: number, next: TaskStatus) =>
      setTasks((current) =>
        (current ?? []).map((item) =>
          item.id === id ? { ...item, status: next } : item,
        ),
      )

    setError(null)
    setBusyIds((current) => [...current, task.id])
    replace(task.id, status)

    try {
      // El título viaja también porque el backend lo exige en toda actualización.
      const updated = await api.updateTask(
        task.id,
        { title: task.title, status },
        token,
      )
      setTasks((current) =>
        (current ?? []).map((item) =>
          item.id === updated.id ? updated : item,
        ),
      )
    } catch (cause) {
      replace(task.id, previous)
      setError(describe(cause))
    } finally {
      setBusyIds((current) => current.filter((id) => id !== task.id))
    }
  }

  if (tasks === null && !loadFailed) return <FullScreenLoader />

  return (
    <div className="bg-muted/40 min-h-svh p-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">FlowSync</h1>
          <Link
            to="/profile"
            className="text-muted-foreground text-sm underline-offset-4 hover:underline"
          >
            {user?.fullName ?? 'Mi perfil'}
          </Link>
        </header>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircleIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sin lista cargada no se ofrece crear: la tarea nueva quedaría sola
            en una pantalla que no representa lo que hay en el equipo. */}
        {loadFailed ? (
          <Card className="py-0">
            <p className="text-muted-foreground p-10 text-center text-sm">
              No hemos podido cargar la lista. Vuelve a cargar la página para
              intentarlo otra vez.
            </p>
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <CardContent>
                <NewTaskForm
                  onCreate={handleCreate}
                  titleError={titleError}
                  isSubmitting={isCreating}
                />
              </CardContent>
            </Card>

            <Card className="py-0">
              {tasks!.length === 0 ? (
                <TasksEmptyState />
              ) : (
                <ul>
                  {tasks!.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isBusy={busyIds.includes(task.id)}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
