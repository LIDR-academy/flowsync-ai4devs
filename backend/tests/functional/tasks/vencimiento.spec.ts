import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { errores, invalido, tarea } from '#tests/helpers/api'

/**
 * Cubre el requisito «Cuándo una tarea está vencida» y «El día de referencia lo
 * pone quien mira» de `openspec/specs/tasks/spec.md`.
 *
 * Es la única regla de negocio no trivial del MVP y no la comprobaba nada. Una
 * de sus tres condiciones faltaba en el código: una tarea hecha con la fecha
 * pasada llegaba marcada como vencida, con las 24 pruebas de la suite en verde.
 */
let contador = 0

async function tareaCon(dueDate: string | null, status: 'pending' | 'in_progress' | 'done') {
  const usuario = await User.create({
    fullName: 'Ada Lovelace',
    email: `ada.${contador++}@flowsync.test`,
    password: 'contrasena123',
  })
  const creada = await Task.create({
    title: 'Entregar el informe',
    status,
    assigneeId: usuario.id,
    dueDate,
  })

  return { usuario, creada }
}

test.group('Tasks | vencimiento', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('las tres condiciones tienen que darse a la vez', async ({ client, assert }) => {
    const casos: Array<{
      dueDate: string | null
      status: 'pending' | 'in_progress' | 'done'
      vencida: boolean
      porque: string
    }> = [
      { dueDate: '2026-08-12', status: 'pending', vencida: true, porque: 'las tres se dan' },
      { dueDate: null, status: 'pending', vencida: false, porque: 'no tiene fecha' },
      { dueDate: '2026-09-30', status: 'pending', vencida: false, porque: 'la fecha no ha pasado' },
      { dueDate: '2026-08-12', status: 'done', vencida: false, porque: 'está hecha' },
    ]

    for (const caso of casos) {
      const { usuario, creada } = await tareaCon(caso.dueDate, caso.status)

      const respuesta = await client
        .get(`/api/v1/tasks/${creada.id}`)
        .qs({ today: '2026-08-26' })
        .loginAs(usuario)

      respuesta.assertStatus(200)
      assert.equal(
        tarea(respuesta).isOverdue,
        caso.vencida,
        `fecha=${caso.dueDate} estado=${caso.status}: ${caso.porque}`
      )
    }
  })

  test('vencer hoy todavía no es estar vencida', async ({ client, assert }) => {
    const { usuario, creada } = await tareaCon('2026-08-13', 'pending')

    // El borde exacto. Es un `<` frente a un `<=`: un solo carácter, sin
    // síntoma, sin lint que lo vea y sin tipo que lo impida.
    for (const [today, esperado] of [
      ['2026-08-12', false],
      ['2026-08-13', false],
      ['2026-08-14', true],
    ] as const) {
      const respuesta = await client
        .get(`/api/v1/tasks/${creada.id}`)
        .qs({ today })
        .loginAs(usuario)

      assert.equal(tarea(respuesta).isOverdue, esperado, `mirando desde ${today}`)
    }
  })

  test('darla por hecha la deja de vencer, en la misma respuesta', async ({ client, assert }) => {
    const { usuario, creada } = await tareaCon('2026-08-12', 'pending')

    const antes = await client
      .get(`/api/v1/tasks/${creada.id}`)
      .qs({ today: '2026-08-26' })
      .loginAs(usuario)
    assert.isTrue(tarea(antes).isOverdue)

    await client
      .patch(`/api/v1/tasks/${creada.id}/status`)
      .json({ status: 'done' })
      .loginAs(usuario)

    const despues = await client
      .get(`/api/v1/tasks/${creada.id}`)
      .qs({ today: '2026-08-26' })
      .loginAs(usuario)
    assert.isFalse(tarea(despues).isOverdue)
  })

  test('aplazarla la deja de vencer sin tener que volver a preguntar', async ({
    client,
    assert,
  }) => {
    const { usuario, creada } = await tareaCon('2026-08-12', 'pending')

    const aplazada = await client
      .put(`/api/v1/tasks/${creada.id}/due-date`)
      .json({ today: '2026-08-26', dueDate: '2026-09-30' })
      .loginAs(usuario)

    aplazada.assertStatus(200)
    assert.isFalse(tarea(aplazada).isOverdue)
    assert.equal(tarea(aplazada).dueDate, '2026-09-30')
  })

  test('el día de referencia es obligatorio y no lo pone el servidor', async ({
    client,
    assert,
  }) => {
    const { usuario, creada } = await tareaCon('2026-08-12', 'pending')

    // Un valor por defecto funcionaría en toda prueba hecha desde el mismo
    // huso y fallaría solo lejos. Un 422 ruidoso vale más que ese fallo.
    const sinDia = await client.get(`/api/v1/tasks/${creada.id}`).loginAs(usuario)
    sinDia.assertStatus(422)
    assert.equal(errores(sinDia)[0].field, 'today')

    const diaInvalido = await client
      .get(`/api/v1/tasks/${creada.id}`)
      .qs({ today: '2026-02-31' })
      .loginAs(usuario)
    diaInvalido.assertStatus(422)
    assert.equal(errores(diaInvalido)[0].field, 'today')
  })

  test('retirar la fecha es una operación admitida, no un error', async ({ client, assert }) => {
    const { usuario, creada } = await tareaCon('2026-08-12', 'pending')

    const sinFecha = await client
      .put(`/api/v1/tasks/${creada.id}/due-date`)
      .json({ today: '2026-08-26', dueDate: null })
      .loginAs(usuario)

    sinFecha.assertStatus(200)
    assert.isNull(tarea(sinFecha).dueDate)
    // Y deja de estar vencida, que es el escenario entero.
    assert.isFalse(tarea(sinFecha).isOverdue)
  })

  test('una fecha que no existe se rechaza y la tarea conserva la suya', async ({
    client,
    assert,
  }) => {
    const { usuario, creada } = await tareaCon('2026-09-30', 'pending')

    for (const dueDate of ['2026-02-31', '30/09/2026']) {
      const respuesta = await client
        .put(`/api/v1/tasks/${creada.id}/due-date`)
        .json(invalido({ today: '2026-08-26', dueDate }))
        .loginAs(usuario)

      respuesta.assertStatus(422)
      assert.equal(errores(respuesta)[0].field, 'dueDate')
    }

    // `2026-02-31` encaja en cualquier patrón AAAA-MM-DD y no existe: el riesgo
    // era que se desplazara en silencio al 3 de marzo.
    const sigue = await client
      .get(`/api/v1/tasks/${creada.id}`)
      .qs({ today: '2026-08-26' })
      .loginAs(usuario)
    assert.equal(tarea(sigue).dueDate, '2026-09-30')
  })

  test('la lista no lleva el vencimiento', async ({ client, assert }) => {
    const { usuario } = await tareaCon('2026-08-12', 'pending')

    const respuesta = await client.get('/api/v1/tasks').loginAs(usuario)

    const cuerpo = JSON.stringify(respuesta.body())
    assert.notInclude(cuerpo, 'isOverdue')
    assert.notInclude(cuerpo, 'dueDate')
  })
})
