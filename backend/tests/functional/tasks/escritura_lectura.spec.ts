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
 * `updatedAt`: comparar solo el campo sospechoso dejaría de morder en cuanto el
 * desajuste se mudara a otro.
 *
 * Y eso solo no basta, que es lo que la sexta revisión adversarial demostró.
 * Quitó `updatedAt` de **los dos** transformers y las 71 pruebas siguieron en
 * verde, con el verificador también: escritura y lectura salen del mismo
 * transformer, así que un campo ausente en los dos lados sigue siendo
 * `deepEqual`. Justo el campo del que trata H-14, y el contrato lo promete en
 * `TareaDeLista` y `TareaConDetalle`.
 *
 * Por eso hay además un **conjunto cerrado de campos**. En `s3/start` existía;
 * al portar el arreglo a esta rama vino el arreglo y no el guardarraíl, que es
 * el quinto caso del patrón de H-22.
 */
const CAMPOS_DE_LISTA = ['id', 'title', 'status', 'createdAt', 'updatedAt', 'assignee']
const CAMPOS_DE_DETALLE = [...CAMPOS_DE_LISTA, 'dueDate', 'isOverdue']

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

    assert.sameMembers(Object.keys(tarea(creada)), CAMPOS_DE_LISTA)
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

    assert.sameMembers(Object.keys(tarea(cambiada)), CAMPOS_DE_LISTA)
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

    assert.sameMembers(Object.keys(tarea(fijada)), CAMPOS_DE_DETALLE)
    assert.deepEqual(tarea(fijada), tarea(leida))
  })
})
