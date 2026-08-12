import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/auth/use-auth'
import { CreateTaskForm } from '@/components/create-task-form'
import { EmptyTaskList } from '@/components/empty-task-list'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { TaskRow } from '@/components/task-row'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Task, TaskStatus } from '@/lib/types'

export function TasksPage() {
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    api
      .listTasks(token)
      .then((loaded) => {
        if (!cancelled) setTasks(loaded)
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        setTasks([])
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'No hemos podido cargar la lista.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token])

  /**
   * La tarea nueva se coloca en cabeza, que es donde la dejaría el orden del
   * backend, en vez de volver a pedir la lista entera.
   */
  const handleCreate = useCallback(
    async (title: string) => {
      if (!token) return
      const created = await api.createTask(token, title)
      setError(null)
      setTasks((current) => [created, ...(current ?? [])])
    },
    [token],
  )

  /**
   * El nuevo estado se pinta al instante. Si el servidor lo rechaza, la fila
   * vuelve a como estaba y se explica por qué.
   */
  const handleStatusChange = useCallback(
    async (task: Task, status: TaskStatus) => {
      if (!token) return

      const previous = task.status
      setError(null)
      setTasks((current) =>
        (current ?? []).map((item) =>
          item.id === task.id ? { ...item, status } : item,
        ),
      )

      try {
        const updated = await api.updateTaskStatus(token, task.id, status)
        setTasks((current) =>
          (current ?? []).map((item) => (item.id === task.id ? updated : item)),
        )
      } catch (caught) {
        setTasks((current) =>
          (current ?? []).map((item) =>
            item.id === task.id ? { ...item, status: previous } : item,
          ),
        )
        setError(
          caught instanceof ApiError
            ? `No se ha podido cambiar el estado: ${caught.message}`
            : 'No se ha podido cambiar el estado. Inténtalo de nuevo.',
        )
      }
    },
    [token],
  )

  if (tasks === null) return <FullScreenLoader />

  return (
    <div className="bg-muted/40 min-h-svh p-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">FlowSync</h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/profile">{user?.fullName ?? 'Mi perfil'}</Link>
          </Button>
        </header>

        <div className="grid gap-4">
          <CreateTaskForm onCreate={handleCreate} />

          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="px-0">
              {tasks.length === 0 ? (
                <EmptyTaskList />
              ) : (
                <ul className="divide-y">
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onStatusChange={(status) =>
                        handleStatusChange(task, status)
                      }
                    />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
