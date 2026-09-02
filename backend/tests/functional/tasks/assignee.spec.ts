import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { tarea, tareas } from '#tests/helpers/api'

/**
 * Cubre el requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`, y en concreto el escenario «La tarea no
 * filtra datos de cuenta», que exige que el email no viaje junto a la tarea ni
 * suelta ni dentro de la lista.
 *
 * Existía porque la lista sí lo filtraba, con las 20 pruebas de la suite en
 * verde: `TaskTransformer` construía el responsable con `UserTransformer`, que
 * incluye email y fechas de la cuenta, mientras `TaskAssigneeTransformer` -que
 * existe justo para esto- solo lo usaba el detalle.
 *
 * Se assertan los conjuntos cerrados de claves y no la simple ausencia del
 * email: volver a colgar de ahí cualquier otro dato de la cuenta tiene que
 * romper esta prueba igual.
 */
const CAMPOS_DEL_RESPONSABLE = ['id', 'fullName', 'initials']

async function cuentaConTarea(email: string, fullName: string | null = 'Ada Lovelace') {
  const usuario = await User.create({ fullName, email, password: 'contrasena123' })
  const nueva = await Task.create({
    title: 'Revisar el contrato de la API',
    status: 'pending',
    assigneeId: usuario.id,
  })

  return { usuario, tarea: nueva }
}

test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('la lista identifica al responsable sin filtrar su cuenta', async ({ client, assert }) => {
    const { usuario } = await cuentaConTarea('ada@flowsync.test')

    const respuesta = await client.get('/api/v1/tasks').loginAs(usuario)

    respuesta.assertStatus(200)
    const [primera] = tareas(respuesta)
    assert.sameMembers(Object.keys(primera.assignee), CAMPOS_DEL_RESPONSABLE)
    assert.equal(primera.assignee.fullName, 'Ada Lovelace')
    assert.equal(primera.assignee.initials, 'AL')
  })

  test('la tarea suelta identifica al responsable sin filtrar su cuenta', async ({
    client,
    assert,
  }) => {
    const { usuario, tarea: creada } = await cuentaConTarea('ada@flowsync.test')

    const respuesta = await client
      .get(`/api/v1/tasks/${creada.id}`)
      .qs({ today: '2026-08-26' })
      .loginAs(usuario)

    respuesta.assertStatus(200)
    assert.sameMembers(Object.keys(tarea(respuesta).assignee), CAMPOS_DEL_RESPONSABLE)
  })

  test('el email no aparece en la respuesta de la lista bajo ninguna forma', async ({
    client,
    assert,
  }) => {
    const { usuario } = await cuentaConTarea('secreta@flowsync.test')

    const respuesta = await client.get('/api/v1/tasks').loginAs(usuario)

    // Sobre la respuesta entera: si algún día se cuelga el email de otro sitio
    // de la tarea, esto lo caza igual.
    assert.notInclude(JSON.stringify(respuesta.body()), 'secreta@flowsync.test')
  })

  test('un responsable sin nombre sigue siendo representable', async ({ client, assert }) => {
    const { usuario } = await cuentaConTarea('anonima@flowsync.test', null)

    const respuesta = await client.get('/api/v1/tasks').loginAs(usuario)

    const [primera] = tareas(respuesta)
    assert.isNull(primera.assignee.fullName)
    assert.isString(primera.assignee.initials)
    assert.isNotEmpty(primera.assignee.initials)
    // El escenario pide que la interfaz pueda representarlo «sin recurrir a su
    // email»: unas iniciales derivadas del correo cumplirían la letra y no el
    // propósito si reprodujeran la parte local entera.
    assert.notInclude(JSON.stringify(primera.assignee), 'anonima')
  })
})
