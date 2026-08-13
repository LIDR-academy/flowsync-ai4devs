import { Link } from 'react-router'
import { ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Task,
  type TaskStatus,
} from '@/lib/types'

type TaskItemProps = {
  task: Task
  onChangeStatus: (task: Task, status: TaskStatus) => void
  isBusy: boolean
}

/**
 * Una fila de la lista: título, responsable y estado a la vista, para poder
 * responder «quién está en qué» sin abrir nada.
 *
 * Los tres estados se pintan como tres botones en vez de un desplegable a
 * propósito: así el cambio cuesta un solo clic y los tres destinos posibles
 * están siempre a la vista, que es justo lo que pide el criterio.
 */
export function TaskItem({ task, onChangeStatus, isBusy }: TaskItemProps) {
  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
          aria-hidden="true"
        >
          {task.assignee.initials}
        </span>
        <div className="min-w-0">
          {/* Se abre desde el título y no pulsando la fila entera: los tres
              botones de estado están dentro de esa fila, y convertirlos en
              zonas muertas de una superficie pulsable es una trampa clásica. */}
          {/* El chevron va visible en reposo y no solo al pasar por encima:
              si la única pista de que la tarea se abre es un subrayado que
              aparece al acercar el ratón, quien no lo acerque nunca sabrá que
              hay algo dentro — y la fecha de vencimiento vive justo ahí. */}
          <Link
            to={`/tasks/${task.id}`}
            className="flex items-center gap-1 font-medium hover:underline"
          >
            <span className="truncate">{task.title}</span>
            <ChevronRightIcon
              className="size-4 shrink-0 opacity-50"
              aria-hidden="true"
            />
          </Link>
          <p className="text-muted-foreground truncate text-sm">
            {task.assignee.fullName ?? 'Sin nombre'}
          </p>
        </div>
      </div>

      <div
        className="flex shrink-0 gap-1"
        role="group"
        aria-label={`Estado de «${task.title}»`}
      >
        {TASK_STATUSES.map((status) => {
          const isCurrent = status === task.status

          return (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={isCurrent ? 'default' : 'outline'}
              aria-pressed={isCurrent}
              disabled={isBusy}
              onClick={() => onChangeStatus(task, status)}
            >
              {TASK_STATUS_LABELS[status]}
            </Button>
          )
        })}
      </div>
    </li>
  )
}
