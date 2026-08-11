import Task from '#models/task'
import { test } from '@japa/runner'
import { bodyOf, createUser } from '#tests/helpers/index'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Ningún test de este fichero afirma en qué posición sale una tarea: no hay
 * criterio de ordenación decidido, así que solo se comprueba pertenencia al
 * conjunto.
 */
const titlesOf = (body: any) => body.data.map((task: any) => task.title)

test.group('GET /api/v1/tasks', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('dos personas distintas reciben exactamente la misma lista', async ({ client, assert }) => {
    const ana = await createUser()
    const bruno = await createUser()
    await Task.create({ title: 'Revisar el backlog', status: 'pendiente', assigneeId: ana.id })
    await Task.create({ title: 'Preparar la demo', status: 'en curso', assigneeId: bruno.id })

    const asAna = await client.get('/api/v1/tasks').loginAs(ana)
    const asBruno = await client.get('/api/v1/tasks').loginAs(bruno)

    asAna.assertStatus(200)
    asBruno.assertStatus(200)
    assert.sameDeepMembers(bodyOf(asAna).data, bodyOf(asBruno).data)
    assert.sameMembers(titlesOf(bodyOf(asAna)), ['Revisar el backlog', 'Preparar la demo'])
  })

  test('una tarea que otra persona creó y se autoasignó está en la lista de todos', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()
    const bruno = await createUser()

    const created = await client
      .post('/api/v1/tasks')
      .json({ title: 'Cerrar el sprint' })
      .loginAs(ana)
    created.assertStatus(200)

    const response = await client.get('/api/v1/tasks').loginAs(bruno)

    response.assertStatus(200)
    const task = bodyOf(response).data.find((item: any) => item.title === 'Cerrar el sprint')
    assert.exists(task)
    assert.equal(task.assignee.id, ana.id)
  })

  test('cada tarea llega con título, estado y responsable sin consultas extra', async ({
    client,
    assert,
  }) => {
    const ana = await createUser({ fullName: 'Ana Ortiz' })
    const bruno = await createUser({ fullName: 'Bruno Salas' })
    await Task.create({ title: 'Escribir el informe', status: 'hecho', assigneeId: ana.id })
    await Task.create({ title: 'Actualizar el tablero', status: 'en curso', assigneeId: bruno.id })
    await Task.create({ title: 'Sin dueño', status: 'pendiente', assigneeId: null })

    const response = await client.get('/api/v1/tasks').loginAs(ana)

    response.assertStatus(200)
    const byTitle = Object.fromEntries(bodyOf(response).data.map((task: any) => [task.title, task]))

    assert.equal(byTitle['Escribir el informe'].status, 'hecho')
    assert.equal(byTitle['Escribir el informe'].assignee.fullName, 'Ana Ortiz')
    assert.equal(byTitle['Actualizar el tablero'].status, 'en curso')
    assert.equal(byTitle['Actualizar el tablero'].assignee.fullName, 'Bruno Salas')
    // Sin responsable se dice con un nulo explícito, no con un hueco.
    assert.isNull(byTitle['Sin dueño'].assignee)
  })

  test('la lista sin tareas devuelve una colección vacía', async ({ client, assert }) => {
    const ana = await createUser()

    const response = await client.get('/api/v1/tasks').loginAs(ana)

    response.assertStatus(200)
    assert.isArray(bodyOf(response).data)
    assert.lengthOf(bodyOf(response).data, 0)
  })

  test('consultar la lista dos veces no altera ninguna tarea', async ({ client, assert }) => {
    const ana = await createUser()
    const pendiente = await Task.create({
      title: 'Pendiente',
      status: 'pendiente',
      assigneeId: ana.id,
    })
    const hecho = await Task.create({ title: 'Hecho', status: 'hecho', assigneeId: null })

    const first = await client.get('/api/v1/tasks').loginAs(ana)
    const second = await client.get('/api/v1/tasks').loginAs(ana)

    assert.sameDeepMembers(bodyOf(first).data, bodyOf(second).data)

    await pendiente.refresh()
    await hecho.refresh()
    assert.deepEqual(
      { title: pendiente.title, status: pendiente.status, assigneeId: pendiente.assigneeId },
      { title: 'Pendiente', status: 'pendiente', assigneeId: ana.id }
    )
    assert.deepEqual(
      { title: hecho.title, status: hecho.status, assigneeId: hecho.assigneeId },
      { title: 'Hecho', status: 'hecho', assigneeId: null }
    )
  })

  test('el responsable no expone email, contraseña ni marcas de tiempo de la cuenta', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()
    await Task.create({ title: 'Con responsable', status: 'pendiente', assigneeId: ana.id })

    const response = await client.get('/api/v1/tasks').loginAs(ana)

    response.assertStatus(200)
    const { assignee } = bodyOf(response).data[0]
    assert.sameMembers(Object.keys(assignee), ['id', 'fullName', 'initials'])
    assert.notProperty(assignee, 'email')
    assert.notProperty(assignee, 'password')
    assert.notProperty(assignee, 'createdAt')
    assert.notProperty(assignee, 'updatedAt')
    // Y el email no se cuela por ninguna otra vía en el cuerpo entero.
    assert.notInclude(JSON.stringify(bodyOf(response)), ana.email)
  })

  test('ninguna tarea trae fechas ni campo de vencimiento', async ({ client, assert }) => {
    const ana = await createUser()
    await Task.create({ title: 'Una tarea', status: 'pendiente', assigneeId: ana.id })

    const response = await client.get('/api/v1/tasks').loginAs(ana)

    response.assertStatus(200)
    const task = bodyOf(response).data[0]
    assert.sameMembers(Object.keys(task), ['id', 'title', 'status', 'assignee'])
    for (const forbidden of ['dueDate', 'dueAt', 'deadline', 'createdAt', 'updatedAt']) {
      assert.notProperty(task, forbidden)
    }
  })

  test('sin credencial la lista responde 401 y no devuelve tareas', async ({ client, assert }) => {
    const ana = await createUser()
    await Task.create({ title: 'Invisible sin sesión', status: 'pendiente', assigneeId: ana.id })

    const response = await client.get('/api/v1/tasks')

    response.assertStatus(401)
    assert.notProperty(bodyOf(response), 'data')
    assert.notInclude(JSON.stringify(bodyOf(response)), 'Invisible sin sesión')
  })
})
