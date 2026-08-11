import { TaskStatusControl } from '@/components/task-status-control'
import type { Task, TaskStatus } from '@/lib/types'

type TaskRowProps = {
  task: Task
  onStatusChange: (task: Task, status: TaskStatus) => void
  isBusy?: boolean
}

/**
 * Una fila de la lista: título, responsable por su nombre y el control de
 * estado. Sin fechas y sin distintivos de urgencia — el vencimiento no existe
 * en este producto todavía.
 */
export function TaskRow({
  task,
  onStatusChange,
  isBusy = false,
}: TaskRowProps) {
  // `fullName` es opcional en las cuentas; el mismo criterio que ya usa el perfil.
  const assignee = task.assignee
    ? (task.assignee.fullName ?? 'Sin nombre')
    : 'Sin responsable'

  return (
    <li className="flex flex-col gap-3 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium break-words">{task.title}</p>
        <p className="text-muted-foreground text-sm">{assignee}</p>
      </div>

      <TaskStatusControl
        status={task.status}
        taskTitle={task.title}
        disabled={isBusy}
        onChange={(status) => onStatusChange(task, status)}
      />
    </li>
  )
}
