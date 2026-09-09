import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: el responsable se identifica por nombre e
 * iniciales, la tarea no filtra ningún otro dato de esa cuenta (ni suelta ni
 * en la lista), y una cuenta sin nombre sigue dando iniciales.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any, datos: { fullName: string | null; email: string }) {
    await User.create({ ...datos, password: 'secreto123' })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: datos.email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function crearTarea(client: any, token: string, title = 'Revisar el informe') {
    const response = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title })

    return response.body().data
  }

  test('el assignee trae el nombre y las iniciales del responsable', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, {
      fullName: 'Ada Lovelace',
      email: 'ada.responsable@example.com',
    })
    const tarea = await crearTarea(client, token)

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
    lista.assertStatus(200)

    const enLista = lista.body().data.find((t: any) => t.id === tarea.id)
    assert.equal(enLista.assignee.fullName, 'Ada Lovelace')
    assert.equal(enLista.assignee.initials, 'AL')
  })

  // TODO: falta assertar directamente sobre el body de `POST /tasks`
  // (`tarea`, abajo solo se usa `tarea.id`) — hoy queda cubierto indirectamente
  // porque `POST` y `GET /tasks` comparten `TaskTransformer`, pero este test no
  // fija esa forma para la respuesta de creación.
  test('el assignee no incluye el email ni ningún otro dato de acceso, suelta o en la lista', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, {
      fullName: 'Ada Lovelace',
      email: 'ada.sin-filtracion@example.com',
    })
    const tarea = await crearTarea(client, token)

    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
    lista.assertStatus(200)
    const enLista = lista.body().data.find((t: any) => t.id === tarea.id)
    assert.notProperty(enLista.assignee, 'email')

    const suelta = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-01-01' })
      .header('Authorization', `Bearer ${token}`)
    suelta.assertStatus(200)
    assert.notProperty(suelta.body().data.assignee, 'email')
  })

  test('un responsable sin nombre llega con el nombre nulo y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, {
      fullName: null,
      email: 'sin-nombre.responsable@example.com',
    })
    const tarea = await crearTarea(client, token)

    const suelta = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-01-01' })
      .header('Authorization', `Bearer ${token}`)

    suelta.assertStatus(200)
    const { assignee } = suelta.body().data
    assert.isNull(assignee.fullName)
    assert.equal(assignee.initials, 'SE')
  })
})
