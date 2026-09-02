import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { errores, invalido, tareas } from '#tests/helpers/api'

/**
 * Cubre los requisitos «Acotar la lista por estado», «Un filtro válido sin
 * resultados es una lista vacía legítima», «Un estado que no existe se rechaza,
 * no se responde vacío» y «Una sola lista compartida del espacio».
 *
 * El tercero estaba incumplido: el validador declaraba `status` como cadena
 * suelta, así que un estado inventado llegaba al `where` y salía como lista
 * vacía con un 200 bien formado, indistinguible de un filtro válido sin
 * resultados. Además dejaba sin ejecutar nunca tres ramas del frontend escritas
 * a propósito para ese 422.
 */
async function espacioConTareas() {
  const usuario = await User.create({
    fullName: 'Ada Lovelace',
    email: 'ada@flowsync.test',
    password: 'contrasena123',
  })

  for (const [title, status] of [
    ['Pendiente de arrancar', 'pending'],
    ['En marcha', 'in_progress'],
    ['Ya terminada', 'done'],
  ] as const) {
    await Task.create({ title, status, assigneeId: usuario.id })
  }

  return usuario
}

test.group('Tasks | filtro por estado', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un estado que no existe se rechaza y no se responde vacío', async ({ client, assert }) => {
    const usuario = await espacioConTareas()

    const inventado = await client
      .get('/api/v1/tasks')
      .qs(invalido({ status: 'archivado' }))
      .loginAs(usuario)

    inventado.assertStatus(422)
    assert.equal(errores(inventado)[0].field, 'status')
    assert.includeMembers(errores(inventado)[0].meta?.choices as string[], [
      'pending',
      'in_progress',
      'done',
    ])
  })

  test('el estado de una tarea tampoco admite un valor fuera del conjunto', async ({
    client,
    assert,
  }) => {
    const usuario = await espacioConTareas()
    const [alguna] = await Task.query().limit(1)

    // El filtro de la lista y el cambio de estado son dos validadores distintos.
    // Cerrar el de la lista no dice nada del otro.
    for (const status of ['archivado', 'Pendiente', '', 'PENDING']) {
      const respuesta = await client
        .patch(`/api/v1/tasks/${alguna.id}/status`)
        .json(invalido({ status }))
        .loginAs(usuario)

      respuesta.assertStatus(422)
      assert.equal(errores(respuesta)[0].field, 'status')
    }

    const sinCambios = await Task.findOrFail(alguna.id)
    assert.equal(sinCambios.status, alguna.status)
  })

  test('pedir algo que no existe se distingue de no encontrar nada', async ({ client, assert }) => {
    const usuario = await espacioConTareas()
    await Task.query().where('status', 'in_progress').delete()

    const valido = await client.get('/api/v1/tasks').qs({ status: 'in_progress' }).loginAs(usuario)
    const inventado = await client
      .get('/api/v1/tasks')
      .qs(invalido({ status: 'archivado' }))
      .loginAs(usuario)

    // La propiedad que se protege es que las dos respuestas NO sean iguales.
    // Cuando lo eran, el frontend leía «no hay tareas en archivado», que
    // además afirmaba algo falso.
    valido.assertStatus(200)
    assert.isEmpty(tareas(valido))
    assert.notEqual(valido.status(), inventado.status())
  })

  test('un filtro válido sin resultados es una lista vacía legítima', async ({
    client,
    assert,
  }) => {
    const usuario = await espacioConTareas()
    await Task.query().where('status', 'done').delete()

    const respuesta = await client.get('/api/v1/tasks').qs({ status: 'done' }).loginAs(usuario)

    respuesta.assertStatus(200)
    assert.isEmpty(tareas(respuesta))
  })

  test('cada estado devuelve solo el suyo', async ({ client, assert }) => {
    const usuario = await espacioConTareas()

    for (const status of ['pending', 'in_progress', 'done'] as const) {
      const respuesta = await client.get('/api/v1/tasks').qs({ status }).loginAs(usuario)

      respuesta.assertStatus(200)
      assert.lengthOf(tareas(respuesta), 1)
      assert.equal(tareas(respuesta)[0].status, status)
    }
  })

  test('sin filtro no es «todas»: lo hecho se queda fuera', async ({ client, assert }) => {
    const usuario = await espacioConTareas()

    const respuesta = await client.get('/api/v1/tasks').loginAs(usuario)

    const estados = tareas(respuesta).map((t) => t.status)
    assert.sameMembers(estados, ['pending', 'in_progress'])
    assert.notInclude(estados, 'done')
  })

  test('acotar es solo lectura: ninguna tarea cambia por consultarla', async ({
    client,
    assert,
  }) => {
    const usuario = await espacioConTareas()
    const antes = await Task.query().orderBy('id')

    await client.get('/api/v1/tasks').qs({ status: 'done' }).loginAs(usuario)

    const despues = await Task.query().orderBy('id')
    assert.deepEqual(
      despues.map((t) => ({ id: t.id, status: t.status, title: t.title })),
      antes.map((t) => ({ id: t.id, status: t.status, title: t.title }))
    )
  })
})
