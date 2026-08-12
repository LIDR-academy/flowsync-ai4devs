import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/auth/use-auth'
import { CreateTaskForm } from '@/components/create-task-form'
import { EmptyTaskList } from '@/components/empty-task-list'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { TaskFilterControl } from '@/components/task-filter-control'
import { TaskRow } from '@/components/task-row'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  NO_FILTER,
  matchesFilter,
  parseStatusParam,
  type TaskFilter,
} from '@/lib/task-status'
import type { Task, TaskStatus } from '@/lib/types'

/**
 * Deja la lista como la habría devuelto el servidor tras el cambio: con la
 * tarea actualizada en su sitio, o sin ella si el filtro ya no la incluye.
 */
function applyChange(list: Task[], updated: Task, filter: TaskFilter): Task[] {
  return matchesFilter(updated.status, filter)
    ? list.map((item) => (item.id === updated.id ? updated : item))
    : list.filter((item) => item.id !== updated.id)
}

export function TasksPage() {
  const { token, user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  /**
   * El `?status=` de la URL es puerta de entrada, no de salida: se lee una sola
   * vez al montar y ahí acaba su vida. Los clics posteriores no lo reescriben y
   * el parámetro se borra en cuanto se ha leído, así que recargar devuelve
   * siempre a la vista por defecto en vez de resucitar el filtro de ayer.
   */
  const [requested] = useState(() => searchParams.get('status'))
  const [filter, setFilter] = useState<TaskFilter>(
    () => parseStatusParam(requested) ?? NO_FILTER,
  )
  const [invalidFilter, setInvalidFilter] = useState(() =>
    parseStatusParam(requested) === null ? (requested ?? '') : null,
  )

  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [isLoading, setLoading] = useState(invalidFilter === null)
  const [error, setError] = useState<string | null>(null)

  /** El filtro vigente, legible desde una petición que ya estaba en vuelo. */
  const filterRef = useRef(filter)
  useEffect(() => {
    filterRef.current = filter
  }, [filter])

  /**
   * `setSearchParams` se recrea cada vez que cambian los parámetros, así que sin
   * el pestillo el propio borrado volvería a disparar este efecto.
   */
  const urlCleaned = useRef(false)

  useEffect(() => {
    if (requested === null || urlCleaned.current) return
    urlCleaned.current = true

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('status')
        return next
      },
      { replace: true },
    )
  }, [requested, setSearchParams])

  useEffect(() => {
    // Con un estado que no existe no se pide nada: no hay lista que enseñar,
    // solo un aviso. Pedirla igualmente sería justo el fallo que hay que evitar.
    if (!token || invalidFilter !== null) return

    let cancelled = false
    setLoading(true)

    api
      .listTasks(token, filter === NO_FILTER ? undefined : filter)
      .then((loaded) => {
        if (cancelled) return
        setTasks(loaded)
        setError(null)
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        // La lista no se vacía al fallar: una lista vacía es una respuesta, y
        // esto no lo es. Se deja lo último que sí se pudo leer.
        setError(
          caught instanceof ApiError
            ? caught.message
            : 'No hemos podido cargar la lista.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, filter, invalidFilter])

  /**
   * La tarea nueva se coloca en cabeza, que es donde la dejaría el orden del
   * backend, en vez de volver a pedir la lista entera.
   *
   * Nace pendiente, así que con «En curso» o «Hecho» puestos no encajaría en lo
   * que se está mirando. En ese caso se quita el filtro en lugar de dejar que
   * la tarea desaparezca sin más: acabas de crearla, tienes que verla.
   */
  const handleCreate = useCallback(
    async (title: string) => {
      if (!token) return
      const created = await api.createTask(token, title)
      setError(null)

      if (matchesFilter(created.status, filter)) {
        setTasks((current) => [created, ...(current ?? [])])
      } else {
        setFilter(NO_FILTER)
      }
    },
    [token, filter],
  )

  /**
   * El nuevo estado se pinta al instante, y si con él la tarea se sale del
   * filtro, se va de la vista: filtrar por «Pendiente» y quedarse mirando algo
   * que ya está en curso sería mentir. Si el servidor lo rechaza, la lista
   * vuelve a como estaba y se explica por qué.
   */
  const handleStatusChange = useCallback(
    async (task: Task, status: TaskStatus) => {
      if (!token || tasks === null) return

      const previous = tasks
      setError(null)
      setTasks(applyChange(previous, { ...task, status }, filter))

      try {
        const updated = await api.updateTaskStatus(token, task.id, status)
        setTasks((current) => applyChange(current ?? previous, updated, filter))
      } catch (caught) {
        // Si mientras tanto se ha cambiado de filtro, la lista de la que salió
        // esta fila ya no es la que se está mirando: devolverla ahí metería en
        // la vista tareas que el filtro actual dice que no deberían estar.
        if (filterRef.current === filter) setTasks(previous)

        setError(
          caught instanceof ApiError
            ? `No se ha podido cambiar el estado: ${caught.message}`
            : 'No se ha podido cambiar el estado. Inténtalo de nuevo.',
        )
      }
    },
    [token, tasks, filter],
  )

  // Solo la primera carga tapa la pantalla. Cambiar de filtro deja lo que hay
  // en su sitio hasta que llega la respuesta, en vez de hacer desaparecer la
  // cabecera y el propio control en cada clic.
  if (isLoading && tasks === null && error === null) return <FullScreenLoader />

  return (
    <div className="bg-muted/40 min-h-svh p-6">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">FlowSync</h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/profile">{user?.fullName ?? 'Mi perfil'}</Link>
          </Button>
        </header>

        {invalidFilter !== null ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Ese filtro no existe</AlertTitle>
            <AlertDescription className="grid gap-3">
              <p>
                {invalidFilter.trim() === ''
                  ? 'El enlace con el que has llegado pedía filtrar por un estado en blanco.'
                  : `El enlace con el que has llegado pedía filtrar por «${invalidFilter}», y no es ninguno de los tres estados.`}{' '}
                No es que el equipo no tenga trabajo en ese estado: es que ese
                estado no existe, así que no se ha filtrado nada.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="justify-self-start"
                onClick={() => setInvalidFilter(null)}
              >
                Ver las pendientes y en curso
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4">
            <CreateTaskForm onCreate={handleCreate} />

            <TaskFilterControl filter={filter} onChange={setFilter} />

            {error && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {tasks !== null && (
              <Card>
                <CardContent className="px-0" aria-busy={isLoading}>
                  {tasks.length === 0 ? (
                    <EmptyTaskList filter={filter} />
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
