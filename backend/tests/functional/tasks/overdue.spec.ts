import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Cuándo una tarea está vencida. Cubre el scenario «Una tarea hecha con la
 * fecha pasada» del requirement «Cuándo una tarea está vencida» de
 * `openspec/specs/tasks/spec.md`: estar `done` la deja fuera del vencimiento
 * aunque su fecha ya haya pasado, porque la regla exige las tres condiciones
 * a la vez y no solo la fecha.
 */
test.group('Tasks | vencimiento', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any) {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })

    return response.body().data.token as string
  }

  test('una tarea hecha con la fecha pasada no llega marcada como vencida', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const ada = await User.findByOrFail('email', 'ada@example.com')
    const task = await Task.create({
      title: 'Revisar el informe',
      status: 'done',
      assigneeId: ada.id,
      dueDate: '2020-01-01',
    })

    const response = await client
      .get(`/api/v1/tasks/${task.id}?today=2026-09-16`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isFalse(response.body().data.isOverdue)
  })

  test('la misma fecha pasada sí vence una tarea que no está hecha', async ({ client, assert }) => {
    const token = await sesion(client)
    const ada = await User.findByOrFail('email', 'ada@example.com')
    const task = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: ada.id,
      dueDate: '2020-01-01',
    })

    const response = await client
      .get(`/api/v1/tasks/${task.id}?today=2026-09-16`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isTrue(response.body().data.isOverdue)
  })
})
