import { Button } from '@/components/ui/button'
import { TASK_STATUSES, type TaskStatus } from '@/lib/types'

/**
 * Las etiquetas que se pintan, sobre los valores en minúsculas que viajan por
 * la API. La capitalización es cosa de la vista.
 */
const LABELS: Record<TaskStatus, string> = {
  pendiente: 'Pendiente',
  'en curso': 'En curso',
  hecho: 'Hecho',
}

type TaskStatusControlProps = {
  status: TaskStatus
  onChange: (status: TaskStatus) => void
  /** Mientras hay una petición en vuelo no se encadenan más cambios. */
  disabled?: boolean
  taskTitle: string
}

/**
 * Los tres destinos, siempre a la vista y a un clic: ni desplegable que los
 * esconda, ni diálogo que confirme, ni campo que rellenar. El estado actual se
 * distingue por la variante del botón.
 */
export function TaskStatusControl({
  status,
  onChange,
  disabled = false,
  taskTitle,
}: TaskStatusControlProps) {
  return (
    <div
      className="flex flex-wrap gap-1"
      role="group"
      aria-label={`Estado de «${taskTitle}»`}
    >
      {TASK_STATUSES.map((candidate) => {
        const isCurrent = candidate === status

        return (
          <Button
            key={candidate}
            type="button"
            size="sm"
            variant={isCurrent ? 'default' : 'outline'}
            aria-pressed={isCurrent}
            disabled={disabled}
            onClick={() => onChange(candidate)}
          >
            {LABELS[candidate]}
          </Button>
        )
      })}
    </div>
  )
}
