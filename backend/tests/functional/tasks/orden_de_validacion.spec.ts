import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { errores, invalido } from '#tests/helpers/api'

/**
 * H-21: qué gana cuando la petición está mal formada **y** el recurso no
 * existe. Lo decide [ADR-0006](../../../docs/adr/0006-validar-antes-de-resolver.md):
 * gana el `422`.
 *
 * Un `404` afirma «te entendí y ese recurso no está». Esa afirmación no se
 * puede hacer honestamente sobre una petición que no se ha entendido.
 *
 * Antes dependía de la ruta: `GET /tasks/:id` validaba primero y las dos
 * escrituras resolvían primero, así que la misma clase de petición daba `422`
 * o `404` según a cuál llegaras. Ninguna de las dos órdenes estaba mal; tener
 * las dos, sí.
 *
 * El identificador es `99999` a propósito en todos los casos: si el orden se
 * invierte, `findOrFail` corta antes y la respuesta pasa a `404`.
 */
test.group('Tasks | la petición se valida antes de resolver el identificador', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion() {
    return User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
  }

  test('un estado inventado sobre una tarea que no existe da 422', async ({ client, assert }) => {
    const usuario = await sesion()

    const respuesta = await client
      .patch('/api/v1/tasks/99999/status')
      .loginAs(usuario)
      .json(invalido({ status: 'archivado' }))

    respuesta.assertStatus(422)
    assert.equal(errores(respuesta)[0].field, 'status')
  })

  test('una fecha que no existe sobre una tarea que no existe da 422', async ({
    client,
    assert,
  }) => {
    const usuario = await sesion()

    const respuesta = await client
      .put('/api/v1/tasks/99999/due-date')
      .loginAs(usuario)
      .json(invalido({ today: '2026-09-02', dueDate: '2026-02-31' }))

    respuesta.assertStatus(422)
    assert.equal(errores(respuesta)[0].field, 'dueDate')
  })

  /**
   * La otra mitad, y la que impide que esto se «arregle» devolviendo siempre
   * 422: cuando la petición sí se entiende, el 404 vuelve a ser la respuesta
   * correcta.
   */
  test('una petición válida sobre una tarea que no existe sigue dando 404', async ({ client }) => {
    const usuario = await sesion()

    const cambio = await client
      .patch('/api/v1/tasks/99999/status')
      .loginAs(usuario)
      .json({ status: 'done' })
    cambio.assertStatus(404)

    const fecha = await client
      .put('/api/v1/tasks/99999/due-date')
      .loginAs(usuario)
      .json({ today: '2026-09-02', dueDate: '2026-09-30' })
    fecha.assertStatus(404)
  })

  /**
   * `GET /tasks/:id` ya validaba primero. Se fija aquí para que las tres rutas
   * que resuelven un identificador queden en el mismo sitio: si mañana alguien
   * mueve una, el hueco no vuelve a abrirse solo en dos de tres.
   */
  test('la lectura de una tarea suelta sigue el mismo orden', async ({ client, assert }) => {
    const usuario = await sesion()

    const respuesta = await client
      .get('/api/v1/tasks/99999')
      .loginAs(usuario)
      .qs({ today: 'no-es-una-fecha' })

    respuesta.assertStatus(422)
    assert.equal(errores(respuesta)[0].field, 'today')
  })
})
