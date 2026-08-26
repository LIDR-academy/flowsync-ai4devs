import { Button } from '@/components/ui/button'
import { TASK_STATUSES, type TaskStatus } from '@/lib/types'

/**
 * El rótulo en castellano vive aquí y solo aquí. Por la API viajan siempre los
 * identificadores estables.
 */
const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
}

type TaskStatusButtonsProps = {
  current: TaskStatus
  disabled?: boolean
  onChange: (status: TaskStatus) => void
}

/**
 * Tres botones en lugar de un desplegable: cambiar de estado cuesta un clic, no
 * dos (abrir y elegir). El requisito pide que el gesto sea barato.
 */
export function TaskStatusButtons({
  current,
  disabled,
  onChange,
}: TaskStatusButtonsProps) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Estado">
      {TASK_STATUSES.map((status) => {
        const isCurrent = status === current

        return (
          <Button
            key={status}
            type="button"
            size="sm"
            variant={isCurrent ? 'default' : 'outline'}
            aria-pressed={isCurrent}
            disabled={disabled}
            onClick={() => {
              if (!isCurrent) onChange(status)
            }}
          >
            {STATUS_LABELS[status]}
          </Button>
        )
      })}
    </div>
  )
}

export { STATUS_LABELS }
