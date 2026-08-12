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
 * Los tres estados son fijos. El valor viaja en inglés y se pinta en castellano
 * (ver `TASK_STATUS_LABELS`).
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

/**
 * Vista reducida del responsable: la lista solo necesita su nombre, así que el
 * backend no manda el resto de la cuenta.
 */
export type TaskAssignee = {
  id: number
  /** El registro permite cuentas sin nombre; la lista muestra «Sin nombre». */
  fullName: string | null
}

/**
 * Espejo de `TaskTransformer` del backend (app/transformers/task_transformer.ts).
 */
export type Task = {
  id: number
  title: string
  status: TaskStatus
  assignee: TaskAssignee
  createdAt: string
  updatedAt: string
}
