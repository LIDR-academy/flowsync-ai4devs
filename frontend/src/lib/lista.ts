import type { Task } from '@/lib/types'

/**
 * Coloca una tarea recién creada donde la pondría la API al volver a pedir la
 * lista: debajo de las que están en curso y encima de las pendientes (PA-3,
 * change `lista-en-curso-primero`).
 *
 * Toda tarea nace pendiente y es la más reciente, así que su sitio es el
 * primero de las pendientes. Se inserta tras el bloque de tareas en curso que
 * **encabeza** la lista, no tras la última en curso que haya: cambiar el estado
 * desde la fila no mueve la fila (D2), y una tarea pasada a «En curso» puede
 * estar en mitad de las pendientes hasta la siguiente carga.
 */
export function colocarRecienCreada(tareas: Task[], creada: Task): Task[] {
  const primeraNoEnCurso = tareas.findIndex(
    (tarea) => tarea.status !== 'in_progress',
  )
  const posicion = primeraNoEnCurso === -1 ? tareas.length : primeraNoEnCurso

  return [...tareas.slice(0, posicion), creada, ...tareas.slice(posicion)]
}
