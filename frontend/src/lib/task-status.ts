import { TASK_STATUSES, type TaskStatus } from '@/lib/types'

/**
 * Único sitio donde un estado se traduce a lo que se lee en pantalla. El valor
 * viaja en inglés con la API; en la interfaz siempre se pinta desde aquí.
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
}

/**
 * La ausencia de filtro, como valor manejable por el control. Es cosa de la
 * interfaz y nunca viaja a la API: allí «sin filtro» es no mandar el parámetro.
 */
export const NO_FILTER = 'all'

export type TaskFilter = TaskStatus | typeof NO_FILTER

/**
 * El orden en que se ofrecen los filtros: primero la vista por defecto, luego
 * los tres estados en el orden natural del trabajo.
 */
export const TASK_FILTERS = [NO_FILTER, ...TASK_STATUSES] as const

export const TASK_FILTER_LABELS: Record<TaskFilter, string> = {
  [NO_FILTER]: 'Sin filtro',
  ...TASK_STATUS_LABELS,
}

/**
 * Qué se ve con cada filtro. Sin filtro no es «todas»: son las que siguen
 * vivas, y las hechas se quedan fuera.
 *
 * Es la misma regla que aplica el backend al construir la consulta, y por eso
 * vive en un solo sitio: la lista se retoca en local tras cada cambio de estado
 * y tiene que quedar donde la habría dejado el servidor.
 */
export function matchesFilter(status: TaskStatus, filter: TaskFilter): boolean {
  return filter === NO_FILTER ? status !== 'done' : status === filter
}

/**
 * Interpreta el `?status=` con el que se puede llegar desde un enlace guardado.
 * Devuelve `null` cuando trae algo que no es ninguno de los tres estados: eso
 * no es «sin filtro», es una petición que no tiene sentido y hay que avisar.
 */
export function parseStatusParam(raw: string | null): TaskFilter | null {
  if (raw === null) return NO_FILTER
  return TASK_STATUSES.includes(raw as TaskStatus) ? (raw as TaskStatus) : null
}
