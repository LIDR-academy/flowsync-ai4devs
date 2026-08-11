import Task from '#models/task'
import { test } from '@japa/runner'
import { bodyOf, createUser } from '#tests/helpers/index'
import testUtils from '@adonisjs/core/services/test_utils'

const fieldsOf = (body: any) => body.errors.map((error: any) => error.field)

test.group('POST /api/v1/tasks', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('se crea aportando únicamente el título', async ({ client, assert }) => {
    const ana = await createUser()

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'Escribir el acta' })
      .loginAs(ana)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.title, 'Escribir el acta')
    assert.lengthOf(await Task.all(), 1)
  })

  test('sin indicar nada nace pendiente y a nombre de quien la crea', async ({
    client,
    assert,
  }) => {
    const ana = await createUser({ fullName: 'Ana Ortiz' })

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'Preparar la demo' })
      .loginAs(ana)

    response.assertStatus(200)
    const task = bodyOf(response).data
    assert.equal(task.status, 'pendiente')
    assert.equal(task.assignee.id, ana.id)
    assert.equal(task.assignee.fullName, 'Ana Ortiz')
  })

  test('el estado indicado en la petición manda sobre el valor por defecto', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()

    for (const status of ['pendiente', 'en curso', 'hecho']) {
      const response = await client
        .post('/api/v1/tasks')
        .json({ title: `Tarea en ${status}`, status })
        .loginAs(ana)

      response.assertStatus(200)
      assert.equal(bodyOf(response).data.status, status)
    }
  })

  test('el responsable indicado en la petición manda sobre quien crea', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()
    const bruno = await createUser({ fullName: 'Bruno Salas' })

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'Revisar el diseño', assigneeId: bruno.id })
      .loginAs(ana)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.assignee.id, bruno.id)
    assert.notEqual(bodyOf(response).data.assignee.id, ana.id)
  })

  test('un responsable nulo explícito deja la tarea sin responsable', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'De nadie en particular', assigneeId: null })
      .loginAs(ana)

    response.assertStatus(200)
    assert.isNull(bodyOf(response).data.assignee)

    const task = await Task.firstOrFail()
    assert.isNull(task.assigneeId)
  })

  test('sin título se rechaza con el error atribuido al campo', async ({ client, assert }) => {
    const ana = await createUser()

    const response = await client.post('/api/v1/tasks').json({}).loginAs(ana)

    response.assertStatus(422)
    assert.include(fieldsOf(bodyOf(response)), 'title')
    assert.lengthOf(await Task.all(), 0)
  })

  test('el título vacío se rechaza con el error atribuido al campo', async ({ client, assert }) => {
    const ana = await createUser()

    const response = await client.post('/api/v1/tasks').json({ title: '' }).loginAs(ana)

    response.assertStatus(422)
    assert.include(fieldsOf(bodyOf(response)), 'title')
    assert.lengthOf(await Task.all(), 0)
  })

  test('un título de solo espacios se rechaza igual que uno vacío', async ({ client, assert }) => {
    const ana = await createUser()

    const response = await client.post('/api/v1/tasks').json({ title: '     ' }).loginAs(ana)

    response.assertStatus(422)
    assert.include(fieldsOf(bodyOf(response)), 'title')
    assert.lengthOf(await Task.all(), 0)
  })

  test('un responsable inexistente se rechaza con el error atribuido a su campo', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'Para un fantasma', assigneeId: 999999 })
      .loginAs(ana)

    response.assertStatus(422)
    assert.include(fieldsOf(bodyOf(response)), 'assigneeId')
    assert.lengthOf(await Task.all(), 0)
  })

  test('un estado desconocido se rechaza con el error atribuido a su campo', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'Con estado inventado', status: 'bloqueada' })
      .loginAs(ana)

    response.assertStatus(422)
    assert.include(fieldsOf(bodyOf(response)), 'status')
    assert.lengthOf(await Task.all(), 0)
  })

  test('un estado válido con otra capitalización se rechaza sin normalizarlo', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()

    for (const status of ['Pendiente', 'EN CURSO', 'Hecho']) {
      const response = await client
        .post('/api/v1/tasks')
        .json({ title: 'Capitalización rara', status })
        .loginAs(ana)

      response.assertStatus(422)
      assert.include(fieldsOf(bodyOf(response)), 'status')
    }

    assert.lengthOf(await Task.all(), 0)
  })

  test('varios campos inválidos devuelven un error por cada campo', async ({ client, assert }) => {
    const ana = await createUser()

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: '   ', status: 'bloqueada', assigneeId: 999999 })
      .loginAs(ana)

    response.assertStatus(422)
    const fields = fieldsOf(bodyOf(response))
    assert.includeMembers(fields, ['title', 'status', 'assigneeId'])
    for (const error of bodyOf(response).errors) {
      assert.isString(error.message)
      assert.isString(error.field)
    }
    assert.lengthOf(await Task.all(), 0)
  })

  test('sin credencial se responde 401 y no se crea ninguna tarea', async ({ client, assert }) => {
    const response = await client.post('/api/v1/tasks').json({ title: 'A escondidas' })

    response.assertStatus(401)
    assert.lengthOf(await Task.all(), 0)
  })
})
