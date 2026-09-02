import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { cuerpo, tarea, tareas } from '#tests/helpers/api'

/**
 * H-14: lo que devuelve una escritura tiene que ser lo mismo que devuelve la
 * lectura siguiente.
 *
 * El modelo en memoria trae `updatedAt` con milisegundos y la base lo guarda
 * con precisión de segundo, así que devolver el objeto recién guardado hacía
 * que la escritura y la lectura dijeran valores distintos del mismo campo, sin
 * que nada cambiara en medio.
 *
 * ```
 * PATCH -> "updatedAt":"2026-08-26T06:09:01.596+00:00"
 * GET   -> "updatedAt":"2026-08-26T06:09:01.000+00:00"
 * ```
 *
 * Se arregló en el Módulo 3 y el arreglo no cruzó a `s4/start`, que además
 * añadió una tercera escritura -la fecha de vencimiento- con el mismo patrón.
 *
 * La comparación es **campo por campo sobre el objeto entero**, no sobre
 * `updatedAt`. Comparar solo el campo sospechoso dejaría de morder en cuanto el
 * desajuste se mudara a otro, y ya pasó una vez: dos respuestas que salían del
 * mismo transformer se comparaban entre sí, así que borrar el campo las dejaba
 * iguales y la prueba seguía en verde.
 */
test.group('Tasks | la escritura devuelve lo persistido', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion() {
    return User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
  }

  test('crear devuelve lo mismo que la lista siguiente', async ({ client, assert }) => {
    const usuario = await sesion()

    const creada = await client
      .post('/api/v1/tasks')
      .loginAs(usuario)
      .json(cuerpo({ title: 'Preparar la demo' }))

    creada.assertStatus(201)

    const lista = await client.get('/api/v1/tasks').loginAs(usuario)
    const enLista = tareas(lista).find((t) => t.id === tarea(creada).id)

    assert.deepEqual(tarea(creada), enLista)
  })

  test('cambiar el estado devuelve lo mismo que la lista siguiente', async ({ client, assert }) => {
    const usuario = await sesion()

    const creada = await client
      .post('/api/v1/tasks')
      .loginAs(usuario)
      .json(cuerpo({ title: 'Preparar la demo' }))

    const cambiada = await client
      .patch(`/api/v1/tasks/${tarea(creada).id}/status`)
      .loginAs(usuario)
      .json(cuerpo({ status: 'in_progress' }))

    cambiada.assertStatus(200)

    const lista = await client.get('/api/v1/tasks').loginAs(usuario)
    const enLista = tareas(lista).find((t) => t.id === tarea(cambiada).id)

    assert.deepEqual(tarea(cambiada), enLista)
  })

  test('fijar la fecha devuelve lo mismo que la lectura siguiente', async ({ client, assert }) => {
    const usuario = await sesion()

    const creada = await client
      .post('/api/v1/tasks')
      .loginAs(usuario)
      .json(cuerpo({ title: 'Preparar la demo' }))

    const id = tarea(creada).id

    const fijada = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .loginAs(usuario)
      .json(cuerpo({ today: '2026-09-02', dueDate: '2026-09-30' }))

    fijada.assertStatus(200)

    const leida = await client
      .get(`/api/v1/tasks/${id}`)
      .loginAs(usuario)
      .qs({ today: '2026-09-02' })

    assert.deepEqual(tarea(fijada), tarea(leida))
  })
})
