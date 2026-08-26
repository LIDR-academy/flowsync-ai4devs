import { TaskStatusButtons } from '@/components/task-status-buttons'
import type { Task, TaskStatus } from '@/lib/types'

type TaskRowProps = {
  task: Task
  pending?: boolean
  onStatusChange: (status: TaskStatus) => void
}

/**
 * Una fila responde las tres preguntas sin abrir nada: qué trabajo es, quién lo
 * lleva y en qué estado está. Nada de fechas ni marcas de vencimiento: eso llega
 * en otra historia y el alcance exige que viva fuera de la vista principal.
 */
export function TaskRow({ task, pending, onStatusChange }: TaskRowProps) {
  const { assignee } = task

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
          aria-hidden="true"
        >
          {assignee.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{task.title}</p>
          {/* Una cuenta puede no tener nombre; la fila sigue diciendo de quién es. */}
          <p className="text-muted-foreground truncate text-sm">
            {assignee.fullName ?? 'Sin nombre'}
          </p>
        </div>
      </div>

      <TaskStatusButtons
        current={task.status}
        disabled={pending}
        onChange={onStatusChange}
      />
    </li>
  )
}
