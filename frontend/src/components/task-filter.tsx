import { Button } from '@/components/ui/button'
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from '@/lib/types'

type TaskFilterProps = {
  /**
   * El estado por el que se está acotando, o `null` para la vista por defecto.
   * Se declara `string` porque el valor sale de la URL y puede ser cualquier
   * cosa: si no es ninguno de los tres, no se marca ninguna opción, que es la
   * lectura correcta —lo que se está mostrando no es ninguna de ellas.
   */
  value: string | null
  onChange: (status: TaskStatus | null) => void
}

/**
 * El control para acotar la lista. La primera opción no es un cuarto estado:
 * es la ausencia de filtro, y por eso se nombra por lo que enseña en vez de
 * llamarse «Todas» —un «Todas» devolvería a la pantalla justo lo que este
 * filtro existe para quitar de en medio.
 *
 * Son botones nativos, así que se recorre y se acciona con el teclado sin
 * escribir una línea de más, y elegir uno sustituye al anterior en lugar de
 * sumarse: un solo estado a la vez.
 */
export function TaskFilter({ value, onChange }: TaskFilterProps) {
  const options = [
    { key: null, label: 'Pendientes y en curso' },
    ...TASK_STATUSES.map((status) => ({
      key: status,
      label: TASK_STATUS_LABELS[status],
    })),
  ]

  return (
    <div
      className="flex flex-wrap gap-1"
      role="group"
      aria-label="Filtrar por estado"
    >
      {options.map(({ key, label }) => {
        const isActive = key === value

        return (
          <Button
            key={key ?? 'sin-filtro'}
            type="button"
            size="sm"
            variant={isActive ? 'secondary' : 'ghost'}
            aria-pressed={isActive}
            onClick={() => onChange(key)}
          >
            {label}
          </Button>
        )
      })}
    </div>
  )
}
