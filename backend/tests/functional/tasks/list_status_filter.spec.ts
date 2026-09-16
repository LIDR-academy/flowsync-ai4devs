import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Filtrar la lista por un estado que no existe. Cubre los tres scenarios del
 * requirement «Un estado que no existe se rechaza, no se responde vacío» de
 * `openspec/specs/tasks/spec.md`: un estado inventado es un 422, ese 422 no
 * se puede confundir con un filtro válido sin resultados, y nada cambia como
 * consecuencia de pedirlo.
 */
test.group('Tasks | filtro por estado inventado', (group) => {
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

  test('un estado inventado es 422 sobre el campo status, no una lista', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)

    const response = await client
      .get('/api/v1/tasks?status=archivado')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'status' }] })
    assert.notProperty(response.body(), 'data')
  })

  test('el 422 de un estado inventado no se confunde con un filtro válido sin resultados', async ({
    client,
  }) => {
    const token = await sesion(client)

    const inventado = await client
      .get('/api/v1/tasks?status=archivado')
      .header('Authorization', `Bearer ${token}`)

    const sinResultados = await client
      .get('/api/v1/tasks?status=in_progress')
      .header('Authorization', `Bearer ${token}`)

    inventado.assertStatus(422)
    sinResultados.assertStatus(200)
    sinResultados.assertBodyContains({ data: [] })
  })

  test('pedir un estado inventado no cambia ninguna tarea', async ({ client, assert }) => {
    const token = await sesion(client)
    const ada = await User.findByOrFail('email', 'ada@example.com')
    const task = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: ada.id,
    })

    await client.get('/api/v1/tasks?status=archivado').header('Authorization', `Bearer ${token}`)

    await task.refresh()
    assert.equal(task.status, 'pending')
  })
})
