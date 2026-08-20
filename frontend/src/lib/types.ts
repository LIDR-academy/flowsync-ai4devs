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

/**
 * Los tres únicos estados, tal y como viajan por la API: en minúsculas. Las
 * etiquetas que se pintan («Pendiente», «En curso», «Hecho») son cosa de la
 * vista, no del contrato.
 */
export const TASK_STATUSES = ['pendiente', 'en curso', 'hecho'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

/**
 * Espejo de `TaskAssigneeTransformer` (app/transformers/task_assignee_transformer.ts).
 * Lo justo para pintar al responsable por su nombre: nada de datos de cuenta.
 */
export type TaskAssignee = {
  id: number
  fullName: string | null
  initials: string
}

/**
 * Espejo de `TaskTransformer` (app/transformers/task_transformer.ts). Sin marcas
 * de tiempo y sin ningún campo de vencimiento, porque el backend no los expone.
 */
export type Task = {
  id: number
  title: string
  status: TaskStatus
  assignee: TaskAssignee | null
}

/** Cuerpo de `POST /tasks`. El título es el único dato obligatorio. */
export type CreateTaskPayload = {
  title: string
  status?: TaskStatus
  assigneeId?: number | null
}

/**
 * Cuerpo de `PATCH /tasks/:id`. El título viaja siempre; lo que no se envía
 * conserva su valor, así que vaciar el responsable se pide con `null` explícito.
 */
export type UpdateTaskPayload = {
  title: string
  status?: TaskStatus
  assigneeId?: number | null
}
