/**
 * Espejo de `UserTransformer` del backend (app/transformers/user_transformer.ts).
 */
export type User = {
  id: number
  fullName: string | null
  email: string
  initials: string
  createdAt: string
  updatedAt: string
}

/**
 * Respuesta de `POST /auth/signup` y `POST /auth/login`, ya sin el envoltorio `{ data }`.
 */
export type AuthResult = {
  user: User
  token: string
}

export type SignupPayload = {
  /** El backend lo declara `.nullable()`: la clave debe viajar siempre, aunque valga `null`. */
  fullName: string | null
  email: string
  password: string
  passwordConfirmation: string
}

export type LoginPayload = {
  email: string
  password: string
}

/** Los tres estados fijos de una tarea. Ni se añaden, ni se renombran. */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

/**
 * Lo que enseña la lista cuando no se pide ningún filtro: lo que sigue
 * abierto. Espejo de `DEFAULT_LIST_STATUSES` del backend, y tiene que seguir
 * siéndolo — es el mismo predicado el que aplica el servidor al consultar y el
 * cliente al pintar, y de ahí sale que marcar algo como hecho lo saque de la
 * vista al instante sin volver a preguntar.
 */
export const DEFAULT_LIST_STATUSES: readonly TaskStatus[] = [
  'pending',
  'in_progress',
]

/** Etiquetas de los estados para pintarlos en pantalla. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
}

/**
 * El responsable tal y como lo devuelve la API junto a una tarea: lo justo
 * para identificarlo en la lista. No trae el email a propósito.
 */
export type TaskAssignee = {
  id: number
  fullName: string | null
  initials: string
}

export type Task = {
  id: number
  title: string
  status: TaskStatus
  assignee: TaskAssignee
  createdAt: string
  updatedAt: string
}

/** El título es lo único que hace falta para crear una tarea. */
export type CreateTaskPayload = {
  title: string
}

/**
 * Una tarea abierta: lo mismo que en la lista, más su fecha de vencimiento y su
 * condición de vencida.
 *
 * Es un tipo aparte de `Task` y no `Task` con campos opcionales, porque la lista
 * de verdad no los trae: el backend usa otro transformer. Si estuvieran aquí como
 * opcionales, la lista podría intentar pintarlos y siempre saldrían vacíos.
 *
 * `isOverdue` llega ya resuelto por el servidor contra el día que se le manda. No
 * se calcula aquí: la regla de vencimiento vive en un solo sitio y no es este.
 */
export type TaskDetail = Task & {
  /** Un día del calendario, `AAAA-MM-DD`, o `null` si no tiene fecha. */
  dueDate: string | null
  isOverdue: boolean
}
