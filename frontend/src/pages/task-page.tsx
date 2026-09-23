import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CalendarClockIcon,
  Loader2Icon,
} from 'lucide-react'
import * as api from '@/lib/api'
import { ApiError } from '@/lib/api'
import { useAuth } from '@/auth/use-auth'
import { FieldError } from '@/components/field-error'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TASK_STATUS_LABELS, type TaskDetail } from '@/lib/types'

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' })

/**
 * Pinta un día `AAAA-MM-DD` en castellano sin pasar por `new Date(cadena)`, que
 * interpretaría la cadena como medianoche UTC y, según el huso, mostraría el día
 * anterior. Los tres números se pasan sueltos, que es la forma local.
 */
function formatDay(day: string) {
  const [year, month, date] = day.split('-').map(Number)

  return dateFormatter.format(new Date(year, month - 1, date))
}

export function TaskPage() {
  const { id } = useParams()
  const { token } = useAuth()

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dueDateError, setDueDateError] = useState<string | null>(null)
  const [isSaving, setSaving] = useState(false)
  // Lo que hay escrito en el campo, aparte de lo que la tarea tiene guardado.
  // Un campo de fecha nativo devuelve cadena vacía mientras la fecha está a
  // medias, así que si se atara directamente al valor de la tarea, React
  // devolvería el valor viejo en cada pulsación y se pelearía con quien está
  // tecleando la fecha. El borrador deja escribir; solo se guarda lo completo.
  const [dueDateDraft, setDueDateDraft] = useState('')

  const taskId = Number(id)

  useEffect(() => {
    if (!token || !Number.isInteger(taskId)) return

    let cancelled = false

    api
      .getTask(taskId, token)
      .then((loaded) => {
        if (cancelled) return
        setTask(loaded)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? 'Esta tarea no existe. Puede que se haya borrado o que el enlace esté mal.'
            : error instanceof ApiError
              ? error.message
              : 'No hemos podido cargar la tarea.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [taskId, token])

  // El campo sigue a la tarea: al cargarla, al guardar y también cuando un
  // guardado falla y la fecha vuelve atrás.
  useEffect(() => {
    setDueDateDraft(task?.dueDate ?? '')
  }, [task?.dueDate])

  const saveDueDate = async (dueDate: string | null) => {
    if (!token || !task) return

    const previous = task

    // Se pinta antes de que conteste el servidor: «al instante» no admite
    // esperar a la red. El `isOverdue` optimista se deja como está y lo corrige
    // la respuesta —es el servidor quien decide si está vencida, no la pantalla.
    setTask({ ...task, dueDate })
    setSaving(true)
    setDueDateError(null)

    try {
      setTask(await api.setTaskDueDate(task.id, dueDate, token))
    } catch (error: unknown) {
      setTask(previous)
      setDueDateError(
        error instanceof ApiError
          ? (error.fieldErrors.dueDate ?? error.message)
          : 'No se ha podido guardar la fecha. Inténtalo de nuevo.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDueDateChange = (value: string) => {
    setDueDateDraft(value)

    // Un campo de fecha a medio escribir vale exactamente lo mismo que uno
    // vacío. Si el vacío se guardara, teclear una fecha a medias borraría en
    // silencio la que había — justo lo que no debe pasar. Para quitarla está
    // el botón, que es explícito.
    if (!value) return

    return saveDueDate(value)
  }

  return (
    <div className="bg-muted/40 min-h-svh">
      <header className="bg-background border-b">
        <div className="mx-auto flex max-w-3xl items-center gap-4 p-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tasks">
              <ArrowLeftIcon />
              Volver a las tareas
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        {loadError ? (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription className="flex flex-col items-start gap-3">
              <span>{loadError}</span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/tasks">Volver a la lista</Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : task === null ? (
          <div
            className="text-muted-foreground flex justify-center p-10"
            role="status"
            aria-live="polite"
          >
            <Loader2Icon className="size-6 animate-spin" />
            <span className="sr-only">Cargando la tarea…</span>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                <span
                  className="bg-muted flex size-6 items-center justify-center rounded-full text-xs font-medium"
                  aria-hidden="true"
                >
                  {task.assignee.initials}
                </span>
                <span>{task.assignee.fullName ?? 'Sin nombre'}</span>
                <span aria-hidden="true">·</span>
                <span>{TASK_STATUS_LABELS[task.status]}</span>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4">
              {/* La señal de vencida lleva texto además de color: quien no
                  distinga colores tiene que poder saberlo igual. Y lo dice en
                  palabras para que nadie tenga que comparar con el día de hoy. */}
              {task.isOverdue && task.dueDate !== null && (
                <Alert variant="destructive">
                  <CalendarClockIcon />
                  <AlertDescription>
                    <strong>Vencida.</strong> El plazo terminó el{' '}
                    {formatDay(task.dueDate)} y la tarea sigue sin estar hecha.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    className="w-auto"
                    value={dueDateDraft}
                    disabled={isSaving}
                    aria-invalid={Boolean(dueDateError)}
                    aria-describedby={
                      dueDateError ? 'dueDate-error' : 'dueDate-hint'
                    }
                    onChange={(event) =>
                      handleDueDateChange(event.target.value)
                    }
                  />
                  {/* Solo cuando hay algo que quitar, y sin diálogo: quitar una
                      fecha se deshace en un gesto y confirmarlo sería fricción
                      gratuita. */}
                  {task.dueDate !== null && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSaving}
                      onClick={() => saveDueDate(null)}
                    >
                      Quitar fecha
                    </Button>
                  )}
                </div>

                <FieldError
                  id="dueDate-error"
                  message={dueDateError ?? undefined}
                />

                {!dueDateError && (
                  <p
                    id="dueDate-hint"
                    className="text-muted-foreground text-sm"
                  >
                    {task.dueDate === null
                      ? // Sin aviso ni reproche: no tener fecha es lo normal.
                        'Esta tarea no tiene fecha de vencimiento.'
                      : `Vence el ${formatDay(task.dueDate)}. Se guarda sola, sin confirmar nada.`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
