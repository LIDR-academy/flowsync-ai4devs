import Task from '#models/task'
import { test } from '@japa/runner'

/**
 * `Task.isOverdueOn`, la única definición de «vencida» del sistema, sin base
 * de datos ni HTTP. Cubre el requisito «Cuándo una tarea está vencida» de
 * `openspec/specs/tasks/spec.md` en su forma pura: las tres condiciones y el
 * borde estricto. La misma regla llega por la API en
 * `tests/functional/tasks/vencimiento.spec.ts`; aquí falla en milisegundos y
 * dice qué condición se rompió.
 */
test.group('Tasks | regla de vencida', () => {
  const tarea = (dueDate: string | null, status: Task['status'] = 'pending') => {
    const t = new Task()
    t.dueDate = dueDate
    t.status = status
    return t
  }

  test('sin fecha nunca está vencida', ({ assert }) => {
    assert.isFalse(tarea(null).isOverdueOn('2026-09-13'))
  })

  test('una fecha anterior al día de quien mira está vencida', ({ assert }) => {
    assert.isTrue(tarea('2026-09-12').isOverdueOn('2026-09-13'))
  })

  test('vencer hoy todavía no es estar vencida', ({ assert }) => {
    assert.isFalse(tarea('2026-09-13').isOverdueOn('2026-09-13'))
  })

  test('una tarea hecha nunca está vencida, aunque su fecha haya pasado', ({ assert }) => {
    assert.isFalse(tarea('2026-01-01', 'done').isOverdueOn('2026-09-13'))
  })
})
