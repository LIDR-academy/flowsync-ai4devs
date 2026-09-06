import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { errores, invalido, tarea } from '#tests/helpers/api'

/**
 * Cubre «Creación de una tarea con solo el título» y «Ninguna tarea sin título»
 * de `openspec/specs/tasks/spec.md`.
 *
 * `POST /api/v1/tasks` no tenía ninguna prueba, y es la única ruta por la que se
 * escribe. La revisión adversarial del PR #21 lo señaló como el hueco más caro
 * de la matriz: leer los datos de la petición para el responsable y el estado
 * -que es la forma natural de "arreglar" la creación- dejaba la suite en verde
 * y permitía crear una tarea a nombre de otra cuenta.
 */
async function cuenta(email: string, fullName = 'Ada Lovelace') {
  return User.create({ fullName, email, password: 'contrasena123' })
}

test.group('Tasks | creación', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('el título es lo único que hace falta', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')

    const respuesta = await client
      .post('/api/v1/tasks')
      .json({ title: 'Revisar el contrato de la API' })
      .loginAs(ada)

    respuesta.assertStatus(201)
    assert.equal(tarea(respuesta).title, 'Revisar el contrato de la API')
    assert.equal(tarea(respuesta).status, 'pending')
    assert.equal(tarea(respuesta).assignee.id, ada.id)
  })

  test('el responsable y el estado los pone el servidor, no la petición', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    const respuesta = await client
      .post('/api/v1/tasks')
      .json(
        invalido({
          title: 'Intento de suplantación',
          assigneeId: grace.id,
          status: 'done',
          dueDate: '2020-01-01',
          id: 9999,
        })
      )
      .loginAs(ada)

    respuesta.assertStatus(201)
    // A nombre de quien la crea, en el estado inicial y sin fecha, pase lo que
    // pase en el cuerpo.
    assert.equal(tarea(respuesta).assignee.id, ada.id)
    assert.equal(tarea(respuesta).status, 'pending')

    const guardada = await Task.findOrFail(tarea(respuesta).id)
    assert.equal(guardada.assigneeId, ada.id)
    assert.equal(guardada.status, 'pending')
    assert.isNull(guardada.dueDate)
  })

  test('sin título no se crea nada, y solo espacios cuenta como vacío', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')

    for (const title of ['', '   ']) {
      const respuesta = await client.post('/api/v1/tasks').json({ title }).loginAs(ada)

      respuesta.assertStatus(422)
      assert.equal(errores(respuesta)[0].field, 'title')
    }

    assert.lengthOf(await Task.all(), 0)
  })

  test('un título excesivo se avisa y no se guarda recortado', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')

    const justo = await client
      .post('/api/v1/tasks')
      .json({ title: 'a'.repeat(200) })
      .loginAs(ada)
    justo.assertStatus(201)

    const pasado = await client
      .post('/api/v1/tasks')
      .json({ title: 'a'.repeat(201) })
      .loginAs(ada)
    pasado.assertStatus(422)
    assert.equal(errores(pasado)[0].meta?.max, 200)

    // Lo que protege el requisito no es el 422, es que no exista un recorte
    // silencioso: solo puede haber la del límite justo.
    assert.lengthOf(await Task.all(), 1)
  })

  test('crear exige sesión', async ({ client }) => {
    const respuesta = await client.post('/api/v1/tasks').json({ title: 'Sin sesión' })

    respuesta.assertStatus(401)
  })
})
