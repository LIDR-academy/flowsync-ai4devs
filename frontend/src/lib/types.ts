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
 * Los tres estados, con los identificadores estables que viajan por la API.
 * Punto único de declaración en el frontend: el rótulo en castellano se resuelve
 * en la capa de presentación y nunca se usa como identificador.
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

/**
 * Lo que la fila de la lista necesita saber de quien lleva la tarea.
 * Espejo de `TaskTransformer` del backend.
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

/** Crear una tarea acepta únicamente el título: el resto lo pone el servidor. */
export type CreateTaskPayload = {
  title: string
}

/** Actualizar acepta únicamente el estado. */
export type UpdateTaskPayload = {
  status: TaskStatus
}
