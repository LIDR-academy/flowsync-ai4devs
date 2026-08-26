import type { TaskStatus } from '#models/task_status'

/**
 * El registro tipado de Tuyau modela **solo la respuesta de éxito** de cada
 * ruta. Una prueba que verifique un rechazo, o que envíe a propósito un dato
 * que el validador debe negar, no cabe en esos tipos.
 *
 * La salida se concentra aquí, con nombre, en vez de esparcir castings por las
 * suites: así cada vez que una prueba se sale del contrato tipado se ve que lo
 * está haciendo y por qué. Registrado como H-12 en `docs/hallazgos.md`.
 */
type Respuesta = { body(): unknown }

export type ErrorDeApi = {
  message: string
  field?: string
  rule?: string
  meta?: Record<string, unknown>
}

export type TareaSerializada = {
  id: number
  title: string
  status: TaskStatus
  createdAt: string | null
  updatedAt: string | null
  assignee: { id: number; fullName: string | null; initials: string }
}

/** Lee el cuerpo de una respuesta de error, que el registro no tipa. */
export function errores(respuesta: Respuesta): ErrorDeApi[] {
  return (respuesta.body() as { errors: ErrorDeApi[] }).errors
}

/** Lee la tarea de una respuesta de creación o actualización. */
export function tarea(respuesta: Respuesta): TareaSerializada {
  return (respuesta.body() as { data: TareaSerializada }).data
}

/** Lee la lista completa de tareas. */
export function tareas(respuesta: Respuesta): TareaSerializada[] {
  return (respuesta.body() as { data: TareaSerializada[] }).data
}

/**
 * Marca un payload que el validador **debe** rechazar. El nombre es la
 * documentación: si una prueba lo usa, está probando un borde a propósito.
 */
export function invalido<T>(payload: Record<string, unknown>): T {
  return payload as T
}
