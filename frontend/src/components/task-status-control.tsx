import { Button } from '@/components/ui/button'
import { TASK_STATUS_LABELS } from '@/lib/task-status'
import { TASK_STATUSES, type TaskStatus } from '@/lib/types'

type TaskStatusControlProps = {
  status: TaskStatus
  taskTitle: string
  disabled?: boolean
  onChange: (status: TaskStatus) => void
}

/**
 * Los tres estados a la vista en la propia fila: un clic cambia, sin abrir la
 * tarea, sin diálogo y sin rellenar nada. El estado actual va resaltado y no es
 * pulsable, porque cambiar una tarea al estado que ya tiene no es un cambio.
 */
export function TaskStatusControl({
  status,
  taskTitle,
  disabled,
  onChange,
}: TaskStatusControlProps) {
  return (
    <div
      role="group"
      aria-label={`Estado de «${taskTitle}»`}
      className="flex shrink-0 gap-1"
    >
      {TASK_STATUSES.map((option) => {
        const isCurrent = option === status

        return (
          <Button
            key={option}
            type="button"
            size="xs"
            variant={isCurrent ? 'default' : 'outline'}
            aria-pressed={isCurrent}
            disabled={disabled || isCurrent}
            onClick={() => onChange(option)}
          >
            {TASK_STATUS_LABELS[option]}
          </Button>
        )
      })}
    </div>
  )
}
