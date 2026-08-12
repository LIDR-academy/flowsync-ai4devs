import { TaskStatusControl } from '@/components/task-status-control'
import type { Task, TaskStatus } from '@/lib/types'

type TaskRowProps = {
  task: Task
  disabled?: boolean
  onStatusChange: (status: TaskStatus) => void
}

/**
 * Título, responsable y estado, que es lo que hay que poder leer sin abrir
 * nada. Deliberadamente no muestra fechas: el vencimiento no se adelanta en la
 * lista.
 */
export function TaskRow({ task, disabled, onStatusChange }: TaskRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{task.title}</p>
        <p className="text-muted-foreground truncate text-sm">
          {task.assignee.fullName ?? 'Sin nombre'}
        </p>
      </div>

      <TaskStatusControl
        status={task.status}
        taskTitle={task.title}
        disabled={disabled}
        onChange={onStatusChange}
      />
    </li>
  )
}
