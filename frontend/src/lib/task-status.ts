import type { TaskStatus } from '@/lib/types'

/**
 * Único sitio donde un estado se traduce a lo que se lee en pantalla. El valor
 * viaja en inglés con la API; en la interfaz siempre se pinta desde aquí.
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
}
