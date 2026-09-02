import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { tarea, tareas } from '#tests/helpers/api'

/**
 * Cubre el requisito «Una sola lista compartida del espacio» de
 * `openspec/specs/tasks/spec.md`, y en particular el escenario «El contenido no
 * depende de quién mira».
 *
 * Existe por un motivo concreto. El material de apoyo del módulo presenta como
 * hallazgo crítico un IDOR -«el listado no filtra por el usuario autenticado y
 * devuelve tareas de otros»- e incluye la instrucción de arreglo:
 *
 *   «filtra las tareas por el usuario autenticado y añade un test que cubra el
 *    aislamiento por usuario»
 *
 * Aplicada al pie de la letra, esa instrucción **rompe el producto**: la
 * aplicación existe precisamente para ver en qué anda el equipo, y el requisito
 * dice que el contenido de la lista no depende de quién la consulta.
 *
 * No es un fallo de autorización: es el requisito. Estas pruebas lo fijan para
 * que aplicar ese arreglo ponga la suite en rojo en vez de pasar en silencio.
 */
async function cuenta(email: string, fullName: string) {
  return User.create({ fullName, email, password: 'contrasena123' })
}

test.group('Tasks | la lista es del espacio, no de quien la mira', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('dos personas distintas ven exactamente el mismo conjunto', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    await Task.create({ title: 'La lleva Ada', status: 'pending', assigneeId: ada.id })
    await Task.create({ title: 'La lleva Grace', status: 'in_progress', assigneeId: grace.id })

    const laDeAda = await client.get('/api/v1/tasks').loginAs(ada)
    const laDeGrace = await client.get('/api/v1/tasks').loginAs(grace)

    // Campo por campo. Filtrar por responsable dejaría una tarea a cada una y
    // las dos listas seguirían teniendo longitud 1.
    assert.deepEqual(tareas(laDeAda), tareas(laDeGrace))
    assert.lengthOf(tareas(laDeAda), 2)
  })

  test('cada una ve la tarea de la otra, con su responsable', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    await Task.create({ title: 'La lleva Grace', status: 'pending', assigneeId: grace.id })

    const respuesta = await client.get('/api/v1/tasks').loginAs(ada)

    const [ajena] = tareas(respuesta)
    assert.equal(ajena.title, 'La lleva Grace')
    assert.equal(ajena.assignee.id, grace.id)
    assert.equal(ajena.assignee.fullName, 'Grace Hopper')
  })

  test('una tarea ajena se consulta suelta igual que una propia', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    const deGrace = await Task.create({
      title: 'La lleva Grace',
      status: 'pending',
      assigneeId: grace.id,
    })

    const respuesta = await client
      .get(`/api/v1/tasks/${deGrace.id}`)
      .qs({ today: '2026-08-26' })
      .loginAs(ada)

    // Ni 403 ni 404 disfrazado: la consulta de una tarea ajena es una lectura
    // legítima del espacio compartido.
    respuesta.assertStatus(200)
    assert.equal(tarea(respuesta).assignee.id, grace.id)
  })

  test('tampoco se recorta cuando se acota por estado', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    await Task.create({ title: 'La lleva Ada', status: 'pending', assigneeId: ada.id })
    await Task.create({ title: 'La lleva Grace', status: 'pending', assigneeId: grace.id })

    // El camino con filtro es una consulta distinta del camino sin filtro, y
    // filtrar por usuario solo en este dejaba la suite en verde.
    const laDeAda = await client.get('/api/v1/tasks').qs({ status: 'pending' }).loginAs(ada)
    const laDeGrace = await client.get('/api/v1/tasks').qs({ status: 'pending' }).loginAs(grace)

    assert.deepEqual(tareas(laDeAda), tareas(laDeGrace))
    assert.lengthOf(tareas(laDeAda), 2)
  })

  test('cambiar el estado de una tarea ajena se aplica igual', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    const deGrace = await Task.create({
      title: 'La lleva Grace',
      status: 'pending',
      assigneeId: grace.id,
    })

    const respuesta = await client
      .patch(`/api/v1/tasks/${deGrace.id}/status`)
      .json({ status: 'done' })
      .loginAs(ada)

    respuesta.assertStatus(200)
    assert.equal(tarea(respuesta).status, 'done')
    // Tocarla no la reasigna.
    assert.equal(tarea(respuesta).assignee.id, grace.id)
  })

  test('fijar la fecha de una tarea ajena se aplica igual', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    const deGrace = await Task.create({
      title: 'La lleva Grace',
      status: 'pending',
      assigneeId: grace.id,
    })

    const respuesta = await client
      .put(`/api/v1/tasks/${deGrace.id}/due-date`)
      .json({ today: '2026-08-26', dueDate: '2026-09-30' })
      .loginAs(ada)

    respuesta.assertStatus(200)
    assert.equal(tarea(respuesta).dueDate, '2026-09-30')
  })

  test('el orden de la lista es el acordado, no el que quiera la base', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')

    // Con fechas distintas. Creadas en el mismo segundo, el desempate por `id`
    // decide y la prueba pasa aunque se invierta el orden por fecha, que es
    // justo el mutante que se escapaba.
    for (const [title, dia] of [
      ['La más vieja', '2026-08-01'],
      ['La de en medio', '2026-08-10'],
      ['La más nueva', '2026-08-20'],
    ] as const) {
      const creada = await Task.create({ title, status: 'pending', assigneeId: ada.id })
      await Task.query()
        .where('id', creada.id)
        .update({ created_at: `${dia} 09:00:00` })
    }

    const respuesta = await client.get('/api/v1/tasks').loginAs(ada)

    // Descendente por creación: lo último anotado encabeza.
    assert.deepEqual(
      tareas(respuesta).map((t) => t.title),
      ['La más nueva', 'La de en medio', 'La más vieja']
    )
  })

  test('dos tareas del mismo instante desempatan de forma estable', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')

    const primera = await Task.create({ title: 'Primera', status: 'pending', assigneeId: ada.id })
    const segunda = await Task.create({ title: 'Segunda', status: 'pending', assigneeId: ada.id })
    await Task.query()
      .whereIn('id', [primera.id, segunda.id])
      .update({ created_at: '2026-08-15 09:00:00' })

    const respuesta = await client.get('/api/v1/tasks').loginAs(ada)

    // Sin el desempate por identificador, el orden lo elegiría la base de datos.
    assert.deepEqual(
      tareas(respuesta).map((t) => t.title),
      ['Segunda', 'Primera']
    )
  })

  test('no existe ninguna vista de «mis tareas»', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test', 'Ada Lovelace')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    await Task.create({ title: 'La lleva Ada', status: 'pending', assigneeId: ada.id })
    await Task.create({ title: 'La lleva Grace', status: 'pending', assigneeId: grace.id })

    // El único parámetro que la lista admite es el estado. Cualquier intento de
    // acotarla por responsable se ignora o se rechaza, pero nunca devuelve una
    // lista recortada, que es lo que dejaría pasar el filtrado por usuario.
    for (const intento of [{ assigneeId: ada.id }, { assignee: ada.id }, { mine: 'true' }]) {
      const respuesta = await client.get('/api/v1/tasks').qs(intento).loginAs(ada)

      if (respuesta.status() === 200) {
        assert.lengthOf(
          tareas(respuesta),
          2,
          `el parámetro ${JSON.stringify(intento)} recortó la lista`
        )
      } else {
        assert.equal(respuesta.status(), 422)
      }
    }
  })
})
