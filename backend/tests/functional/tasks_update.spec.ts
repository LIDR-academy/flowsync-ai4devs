import Task from '#models/task'
import { test } from '@japa/runner'
import { bodyOf, createUser } from '#tests/helpers/index'
import testUtils from '@adonisjs/core/services/test_utils'

const fieldsOf = (body: any) => body.errors.map((error: any) => error.field)

test.group('PATCH /api/v1/tasks/:id', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('recorre los tres estados hacia delante y hacia atrás', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Migrar el módulo', assigneeId: ana.id })

    for (const status of ['en curso', 'hecho', 'en curso', 'pendiente']) {
      const response = await client
        .patch(`/api/v1/tasks/${task.id}`)
        .json({ title: task.title, status })
        .loginAs(ana)

      response.assertStatus(200)
      assert.equal(bodyOf(response).data.status, status)
    }

    await task.refresh()
    assert.equal(task.status, 'pendiente')
  })

  test('salta de pendiente a hecho sin pasar por en curso', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({
      title: 'Cerrar la incidencia',
      status: 'pendiente',
      assigneeId: ana.id,
    })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, status: 'hecho' })
      .loginAs(ana)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.status, 'hecho')
  })

  test('retrocede de hecho a pendiente sin impedimento', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({
      title: 'Reabrir el ticket',
      status: 'hecho',
      assigneeId: ana.id,
    })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, status: 'pendiente' })
      .loginAs(ana)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.status, 'pendiente')
  })

  test('cambiar al estado que ya tiene se acepta', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Ya en curso', status: 'en curso', assigneeId: ana.id })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, status: 'en curso' })
      .loginAs(ana)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.status, 'en curso')
  })

  test('cualquiera cambia el estado de la tarea de otra persona', async ({ client, assert }) => {
    const ana = await createUser()
    const bruno = await createUser()
    const task = await Task.create({ title: 'La lleva Ana', assigneeId: ana.id })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, status: 'hecho' })
      .loginAs(bruno)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.status, 'hecho')
    // Y sigue siendo de Ana: cambiar el estado no reasigna nada.
    assert.equal(bodyOf(response).data.assignee.id, ana.id)
  })

  test('se cambia el estado de una tarea sin responsable sin asignarla antes', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Huérfana', assigneeId: null })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, status: 'en curso' })
      .loginAs(ana)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.status, 'en curso')
    assert.isNull(bodyOf(response).data.assignee)
  })

  test('la tarea se reasigna a otra persona existente', async ({ client, assert }) => {
    const ana = await createUser()
    const bruno = await createUser({ fullName: 'Bruno Salas' })
    const task = await Task.create({ title: 'Cambia de manos', assigneeId: ana.id })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, assigneeId: bruno.id })
      .loginAs(ana)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.assignee.id, bruno.id)
    assert.equal(bodyOf(response).data.assignee.fullName, 'Bruno Salas')
  })

  test('un responsable nulo explícito vacía el responsable', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Se queda sin dueño', assigneeId: ana.id })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, assigneeId: null })
      .loginAs(ana)

    response.assertStatus(200)
    assert.isNull(bodyOf(response).data.assignee)

    await task.refresh()
    assert.isNull(task.assigneeId)
  })

  test('un responsable inexistente se rechaza y la tarea queda intacta', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Intacta', assigneeId: ana.id })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, assigneeId: 999999 })
      .loginAs(ana)

    response.assertStatus(422)
    assert.include(fieldsOf(bodyOf(response)), 'assigneeId')

    await task.refresh()
    assert.equal(task.assigneeId, ana.id)
  })

  test('un título vacío o de solo espacios se rechaza y conserva el anterior', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Título bueno', assigneeId: ana.id })

    for (const title of ['', '   ']) {
      const response = await client
        .patch(`/api/v1/tasks/${task.id}`)
        .json({ title, status: 'hecho' })
        .loginAs(ana)

      response.assertStatus(422)
      assert.include(fieldsOf(bodyOf(response)), 'title')

      await task.refresh()
      assert.equal(task.title, 'Título bueno')
      // El estado que viajaba en la misma petición tampoco se ha aplicado.
      assert.equal(task.status, 'pendiente')
    }
  })

  test('cambiar el estado no toca el responsable', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Solo el estado', assigneeId: ana.id })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, status: 'hecho' })
      .loginAs(ana)

    response.assertStatus(200)
    await task.refresh()
    assert.equal(task.status, 'hecho')
    assert.equal(task.assigneeId, ana.id)
  })

  test('cambiar el estado tampoco toca un responsable vacío', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({ title: 'Sigue sin dueño', assigneeId: null })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, status: 'hecho' })
      .loginAs(ana)

    response.assertStatus(200)
    await task.refresh()
    assert.isNull(task.assigneeId)
  })

  test('cambiar el responsable no toca el estado', async ({ client, assert }) => {
    const ana = await createUser()
    const bruno = await createUser()
    const task = await Task.create({
      title: 'Solo el responsable',
      status: 'en curso',
      assigneeId: ana.id,
    })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: task.title, assigneeId: bruno.id })
      .loginAs(ana)

    response.assertStatus(200)
    await task.refresh()
    assert.equal(task.status, 'en curso')
    assert.equal(task.assigneeId, bruno.id)
  })

  test('cambiar solo el título conserva estado y responsable', async ({ client, assert }) => {
    const ana = await createUser()
    const task = await Task.create({
      title: 'Título viejo',
      status: 'en curso',
      assigneeId: ana.id,
    })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: 'Título nuevo' })
      .loginAs(ana)

    response.assertStatus(200)
    await task.refresh()
    assert.equal(task.title, 'Título nuevo')
    assert.equal(task.status, 'en curso')
    assert.equal(task.assigneeId, ana.id)
  })

  test('una tarea que no existe responde 404 y no crea nada', async ({ client, assert }) => {
    const ana = await createUser()

    const response = await client
      .patch('/api/v1/tasks/999999')
      .json({ title: 'Fantasma', status: 'hecho' })
      .loginAs(ana)

    response.assertStatus(404)
    assert.lengthOf(await Task.all(), 0)
    // La misma forma de error que el resto de la API, y sin filtrar nada del
    // servidor: ni traza, ni rutas de fichero, ni nombres internos.
    const body = bodyOf(response)
    assert.isArray(body.errors)
    assert.isString(body.errors[0].message)
    assert.notProperty(body, 'stack')
    assert.notProperty(body, 'frames')
  })

  test('sin credencial se responde 401 y la tarea queda como estaba', async ({
    client,
    assert,
  }) => {
    const ana = await createUser()
    const task = await Task.create({
      title: 'No la toca nadie',
      status: 'pendiente',
      assigneeId: ana.id,
    })

    const response = await client
      .patch(`/api/v1/tasks/${task.id}`)
      .json({ title: 'Secuestrada', status: 'hecho' })

    response.assertStatus(401)
    await task.refresh()
    assert.equal(task.title, 'No la toca nadie')
    assert.equal(task.status, 'pendiente')
  })
})
