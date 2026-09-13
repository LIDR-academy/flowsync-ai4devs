import { describe, expect, it } from 'vitest'
import { colocarRecienCreada } from '@/lib/lista'
import type { Task, TaskStatus } from '@/lib/types'

/**
 * Dónde entra en la pantalla una tarea recién creada, sin volver a pedir la
 * lista. Es el escenario «La nueva no se cuela delante de lo que está en
 * curso» del change `lista-en-curso-primero` (PA-3).
 *
 * Vive fuera de la pantalla para poder probarlo: no hay runner de navegador,
 * y la pantalla es la que decidía antes, poniéndola delante de todo.
 */
const tarea = (id: number, status: TaskStatus): Task => ({
  id,
  title: `Tarea ${id}`,
  status,
  createdAt: '2026-09-13T08:00:00.000Z',
  updatedAt: '2026-09-13T08:00:00.000Z',
  assignee: { id: 1, fullName: 'Ada Lovelace', initials: 'AL' },
})

const ids = (tareas: Task[]) => tareas.map((t) => t.id)

describe('Colocar una tarea recién creada', () => {
  it('entra debajo de las en curso y encima de las pendientes', () => {
    const lista = [
      tarea(1, 'in_progress'),
      tarea(2, 'in_progress'),
      tarea(3, 'pending'),
    ]

    expect(ids(colocarRecienCreada(lista, tarea(9, 'pending')))).toEqual([
      1, 2, 9, 3,
    ])
  })

  it('sin nada en curso, encabeza la lista', () => {
    const lista = [tarea(3, 'pending'), tarea(4, 'pending')]

    expect(ids(colocarRecienCreada(lista, tarea(9, 'pending')))).toEqual([
      9, 3, 4,
    ])
  })

  it('con todo en curso, va al final', () => {
    const lista = [tarea(1, 'in_progress'), tarea(2, 'in_progress')]

    expect(ids(colocarRecienCreada(lista, tarea(9, 'pending')))).toEqual([
      1, 2, 9,
    ])
  })

  it('una tarea en curso que la fila no ha movido no desplaza a la nueva por detrás de pendientes', () => {
    // D2: cambiar el estado no mueve la fila, así que puede haber una en curso
    // en mitad de las pendientes. La nueva entra detrás de las en curso que
    // encabezan, no detrás de la última en curso que haya en la lista.
    const lista = [
      tarea(1, 'in_progress'),
      tarea(3, 'pending'),
      tarea(5, 'in_progress'),
    ]

    expect(ids(colocarRecienCreada(lista, tarea(9, 'pending')))).toEqual([
      1, 9, 3, 5,
    ])
  })

  it('no modifica la lista que recibe', () => {
    const lista = [tarea(1, 'in_progress'), tarea(3, 'pending')]
    colocarRecienCreada(lista, tarea(9, 'pending'))

    expect(ids(lista)).toEqual([1, 3])
  })
})
