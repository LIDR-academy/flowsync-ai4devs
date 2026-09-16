import User from '#models/user'
import Task from '#models/task'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: el nombre y las iniciales bastan para
 * identificarlo, ningún otro dato de la cuenta —en particular el email— sale
 * junto a la tarea, y una cuenta sin nombre sigue trayendo iniciales.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any, fullName: string | null, email: string) {
    await User.create({ fullName, email, password: 'secreto123' })

    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function crearTarea(assignee: User, title = 'Revisar el informe') {
    return Task.create({ title, status: 'pending', assigneeId: assignee.id })
  }

  test('el assignee trae el nombre y las iniciales del responsable', async ({ client, assert }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const ada = await User.findByOrFail('email', 'ada@example.com')
    const task = await crearTarea(ada)

    const response = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: '2026-01-01' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('el assignee no incluye el email ni ningún otro dato de acceso, suelta o en la lista', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const ada = await User.findByOrFail('email', 'ada@example.com')
    const task = await crearTarea(ada)

    const suelta = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: '2026-01-01' })
      .header('Authorization', `Bearer ${token}`)

    suelta.assertStatus(200)
    assert.notInclude(JSON.stringify(suelta.body().data.assignee), 'ada@example.com')

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    lista.assertStatus(200)
    assert.notInclude(JSON.stringify(lista.body().data), 'ada@example.com')
  })

  test('una cuenta sin nombre sigue trayendo iniciales en el assignee', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, null, 'sin-nombre@example.com')
    const sinNombre = await User.findByOrFail('email', 'sin-nombre@example.com')
    const task = await crearTarea(sinNombre)

    const response = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: '2026-01-01' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isNotEmpty(assignee.initials)
  })
})
