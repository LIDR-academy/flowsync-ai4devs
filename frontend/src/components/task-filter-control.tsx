import { Button } from '@/components/ui/button'
import {
  NO_FILTER,
  TASK_FILTERS,
  TASK_FILTER_LABELS,
  type TaskFilter,
} from '@/lib/task-status'

type TaskFilterControlProps = {
  filter: TaskFilter
  onChange: (filter: TaskFilter) => void
}

/**
 * Las cuatro vistas posibles, a la vista y a un clic. «Sin filtro» es la
 * primera y es una opción de pleno derecho, no un gesto que haya que adivinar:
 * quitar el filtro tiene que costar lo mismo que ponerlo.
 *
 * A diferencia de `TaskStatusControl`, el botón activo no se deshabilita. Allí
 * deshabilitar dice «esto no es un cambio»; aquí dejaría fuera del tabulador
 * justo el botón que cuenta cuál es la vista actual.
 */
export function TaskFilterControl({
  filter,
  onChange,
}: TaskFilterControlProps) {
  return (
    <div className="grid gap-1.5">
      <div
        role="group"
        aria-label="Filtrar por estado"
        className="flex flex-wrap gap-1"
      >
        {TASK_FILTERS.map((option) => (
          <Button
            key={option}
            type="button"
            size="xs"
            variant={option === filter ? 'default' : 'outline'}
            aria-pressed={option === filter}
            onClick={() => onChange(option)}
          >
            {TASK_FILTER_LABELS[option]}
          </Button>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        {filter === NO_FILTER
          ? 'Se ven las pendientes y las que están en curso. Las hechas quedan fuera.'
          : `Solo las tareas en «${TASK_FILTER_LABELS[filter]}».`}
      </p>
    </div>
  )
}
