/**
 * El registro tipado de Tuyau modela **solo la respuesta de éxito** de cada
 * ruta, y cuando dos métodos comparten camino -como `GET` y `POST` sobre
 * `/api/v1/tasks`- infiere el cuerpo como la unión de ambas respuestas, que no
 * se puede leer sin estrechar.
 *
 * La salida del contrato tipado se concentra aquí, con nombre, en vez de
 * esparcir castings por las suites: así cada vez que una prueba se sale de los
 * tipos se ve que lo está haciendo y por qué.
 */
import type { TaskStatus } from '#models/task'

type Respuesta = { body(): unknown }

export type ErrorDeApi = {
  message: string
  field?: string
  rule?: string
  meta?: Record<string, unknown>
}

export type ResponsableSerializado = {
  id: number
  fullName: string | null
  initials: string
}

export type TareaSerializada = {
  id: number
  title: string
  status: TaskStatus
  dueDate?: string | null
  isOverdue?: boolean
  createdAt: string | null
  updatedAt: string | null
  assignee: ResponsableSerializado
}

/** Lee el cuerpo de una respuesta de error, que el registro no tipa. */
export function errores(respuesta: Respuesta): ErrorDeApi[] {
  return (respuesta.body() as { errors: ErrorDeApi[] }).errors
}

/** Lee una tarea suelta. */
export function tarea(respuesta: Respuesta): TareaSerializada {
  return (respuesta.body() as { data: TareaSerializada }).data
}

/** Lee la lista de tareas. */
export function tareas(respuesta: Respuesta): TareaSerializada[] {
  return (respuesta.body() as { data: TareaSerializada[] }).data
}

/**
 * Marca un payload que el validador **debe** rechazar. El nombre es la
 * documentación: si una prueba lo usa, está probando un borde a propósito.
 *
 * Acepta `unknown` y no `Record`, porque el borde más interesante no es un
 * objeto con campos malos: es un cuerpo que ni siquiera llega a ser un objeto.
 * Un JSON cortado a la mitad falla en el parser, antes de que exista ningún
 * validador que pueda decir nada, y es el caso que hacía falso el «todo error
 * viaja como `{ errors: [...] }`» del contrato.
 */
export function invalido<T>(payload: unknown): T {
  return payload as T
}

/**
 * Atraviesa el tipado del registro para un cuerpo que **sí** es válido.
 *
 * Existe para que `invalido()` no se use como casting genérico: si se usara
 * para todo, su nombre dejaría de significar «esto prueba un borde a
 * propósito», que es justo lo que lo hace útil de leer.
 */
export function cuerpo<T>(payload: Record<string, unknown>): T {
  return payload as T
}
