import User from '#models/user'
import Task from '#models/task'
import type { TaskStatus } from '#models/task_status'
import { TITLE_MAX_LENGTH } from '#validators/task'
import { errores, invalido, tarea, tareas } from '#tests/helpers/api'
import { test } from '@japa/runner'

/**
 * Deriva de openspec/specs/tasks/spec.md. Cada caso nombra el requisito del que
 * sale, para que un fallo diga por sí solo si rompe una regla de negocio o una
 * decisión de implementación.
 */
async function cuenta(email: string, fullName: string | null = 'Ada Lovelace') {
  return User.create({ fullName, email, password: 'contrasena123' })
}

test.group('tasks · Anotar trabajo escribiendo solo el título', () => {
  test('un título basta, y la tarea nace a nombre de quien la crea y pendiente', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')

    const respuesta = await client
      .post('/api/v1/tasks')
      .loginAs(ada)
      .json({ title: 'Revisar el contrato de la API' })

    respuesta.assertStatus(200)
    const creada = tarea(respuesta)
    assert.equal(creada.title, 'Revisar el contrato de la API')
    assert.equal(creada.status, 'pending')
    assert.equal(creada.assignee.id, ada.id)
    assert.equal(creada.assignee.fullName, ada.fullName)
  })

  test('lo recién creado ya está en la lista', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')

    await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Primera' })
    const lista = await client.get('/api/v1/tasks').loginAs(ada)

    lista.assertStatus(200)
    assert.lengthOf(tareas(lista), 1)
    assert.equal(tareas(lista)[0].title, 'Primera')
  })
})

test.group('tasks · Ninguna tarea existe sin título', () => {
  test('vacío y solo espacios se rechazan igual, señalando el campo', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')

    for (const title of ['', '   ']) {
      const respuesta = await client.post('/api/v1/tasks').loginAs(ada).json({ title })

      respuesta.assertStatus(422)
      assert.equal(errores(respuesta)[0].field, 'title')
    }

    assert.lengthOf(await Task.all(), 0)
  })
})

test.group('tasks · Un título excesivo se avisa, nunca se recorta', () => {
  test('se rechaza y no queda guardada ninguna versión recortada', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    const excesivo = 'a'.repeat(TITLE_MAX_LENGTH + 1)

    const respuesta = await client.post('/api/v1/tasks').loginAs(ada).json({ title: excesivo })

    respuesta.assertStatus(422)
    assert.equal(errores(respuesta)[0].field, 'title')

    // Lo que protege el requisito no es el 422, es que no exista un recorte
    // silencioso. Se comprueba consultando la base, no la respuesta.
    assert.lengthOf(await Task.all(), 0)
  })
})

test.group('tasks · Tres estados fijos y cerrados', () => {
  test('un estado fuera del conjunto se rechaza y la tarea conserva el suyo', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')
    const creada = tarea(
      await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Con estado propio' })
    )

    const respuesta = await client
      .patch(`/api/v1/tasks/${creada.id}`)
      .loginAs(ada)
      .json(invalido({ status: 'archivada' }))

    respuesta.assertStatus(422)
    assert.includeMembers(errores(respuesta)[0].meta?.choices as string[], [
      'pending',
      'in_progress',
      'done',
    ])

    const sinCambios = await Task.findOrFail(creada.id)
    assert.equal(sinCambios.status, 'pending')
  })

  test('el rótulo en castellano no vale como identificador', async ({ client }) => {
    const ada = await cuenta('ada@flowsync.test')
    const creada = tarea(
      await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Con rótulo' })
    )

    for (const rotulo of ['Pendiente', 'En curso', 'Hecho']) {
      const respuesta = await client
        .patch(`/api/v1/tasks/${creada.id}`)
        .loginAs(ada)
        .json(invalido({ status: rotulo }))

      respuesta.assertStatus(422)
    }
  })

  test('los tres identificadores admitidos se aceptan', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    const creada = tarea(
      await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Recorrido de estados' })
    )

    const recorrido: TaskStatus[] = ['in_progress', 'done', 'pending']
    for (const status of recorrido) {
      const respuesta = await client
        .patch(`/api/v1/tasks/${creada.id}`)
        .loginAs(ada)
        .json({ status })

      respuesta.assertStatus(200)
      assert.equal(tarea(respuesta).status, status)
    }
  })
})

test.group('tasks · No se puede falsificar responsable ni estado', () => {
  test('enviar responsable y estado al crear no tiene efecto', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    const otra = await cuenta('grace@flowsync.test', 'Grace Hopper')

    const respuesta = await client
      .post('/api/v1/tasks')
      .loginAs(ada)
      .json(
        invalido({
          title: 'Intento de suplantación',
          assigneeId: otra.id,
          status: 'done',
        })
      )

    respuesta.assertStatus(200)
    assert.equal(tarea(respuesta).assignee.id, ada.id)
    assert.equal(tarea(respuesta).status, 'pending')
  })

  test('enviar título al actualizar tampoco tiene efecto', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    const creada = tarea(
      await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Título original' })
    )

    const respuesta = await client
      .patch(`/api/v1/tasks/${creada.id}`)
      .loginAs(ada)
      .json(invalido({ status: 'done', title: 'Título colado' }))

    respuesta.assertStatus(200)
    assert.equal(tarea(respuesta).title, 'Título original')
    assert.equal(tarea(respuesta).status, 'done')
  })
})

test.group('tasks · Actuar sobre una tarea que no existe', () => {
  test('se rechaza con la forma de error del proyecto y sin exponer nada', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')

    for (const id of ['999999', 'no-es-un-id']) {
      const respuesta = await client
        .patch(`/api/v1/tasks/${id}`)
        .loginAs(ada)
        .json({ status: 'done' })

      respuesta.assertStatus(404)
      assert.isArray(errores(respuesta))
      assert.isString(errores(respuesta)[0].message)

      // El defecto que destapó /verify: la respuesta traía la traza completa
      // con rutas absolutas del servidor.
      const crudo = JSON.stringify(respuesta.body())
      assert.notInclude(crudo, 'stack')
      assert.notInclude(crudo, '.ts:')
      assert.notInclude(crudo, 'node_modules')
    }
  })
})

test.group('tasks · Una sola lista, la misma para todos', () => {
  test('dos cuentas distintas obtienen el mismo conjunto', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'De Ada' })
    await client.post('/api/v1/tasks').loginAs(grace).json({ title: 'De Grace' })

    const laDeAda = await client.get('/api/v1/tasks').loginAs(ada)
    const laDeGrace = await client.get('/api/v1/tasks').loginAs(grace)

    assert.deepEqual(tareas(laDeAda), tareas(laDeGrace))
    assert.lengthOf(tareas(laDeAda), 2)
  })

  test('consultar la lista no la modifica', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Estable' })

    const primera = await client.get('/api/v1/tasks').loginAs(ada)
    const segunda = await client.get('/api/v1/tasks').loginAs(ada)

    assert.deepEqual(tareas(primera), tareas(segunda))
  })

  test('cambiar el estado de una tarea ajena se aplica igual', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    const grace = await cuenta('grace@flowsync.test', 'Grace Hopper')

    const deAda = tarea(await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'De Ada' }))

    const respuesta = await client
      .patch(`/api/v1/tasks/${deAda.id}`)
      .loginAs(grace)
      .json({ status: 'in_progress' })

    respuesta.assertStatus(200)
    assert.equal(tarea(respuesta).status, 'in_progress')
    // El responsable no cambia por tocarla: no hay reasignación.
    assert.equal(tarea(respuesta).assignee.id, ada.id)
  })

  test('un responsable sin nombre no expone su correo ni su identificador', async ({
    client,
    assert,
  }) => {
    const anonima = await cuenta('anonima@flowsync.test', null)

    const creada = tarea(
      await client.post('/api/v1/tasks').loginAs(anonima).json({ title: 'Sin nombre' })
    )

    assert.isNull(creada.assignee.fullName)
    // El valor concreto: `isString` pasaba con la cadena vacía, y con la parte
    // local del correo también.
    assert.equal(creada.assignee.initials, 'AF')
    assert.notInclude(JSON.stringify(creada.assignee), anonima.email)
    assert.notInclude(JSON.stringify(creada.assignee), 'anonima')
  })
})

/**
 * Comparar escritura contra lectura no basta: los dos lados salen del mismo
 * transformer, así que borrar un campo los deja iguales y las pruebas pasan.
 * Este conjunto es lo que hace que borrarlo se note.
 */
const CAMPOS_DE_TAREA = ['id', 'title', 'status', 'createdAt', 'updatedAt', 'assignee']

test.group('tasks · Escribir y leer devuelven el mismo dato', () => {
  test('cada tarea expone exactamente los campos acordados', async ({ client, assert }) => {
    const ada = await cuenta('ada@flowsync.test')
    const creada = await client
      .post('/api/v1/tasks')
      .loginAs(ada)
      .json({ title: 'Conjunto cerrado' })

    assert.sameMembers(Object.keys(tarea(creada)), CAMPOS_DE_TAREA)
    assert.sameMembers(Object.keys(tarea(creada).assignee), ['id', 'fullName', 'initials'])
  })

  test('lo que devuelve crear coincide campo por campo con la lista', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')

    const creada = tarea(
      await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Recién creada' })
    )
    const enLista = tareas(await client.get('/api/v1/tasks').loginAs(ada))[0]

    // Campo por campo: el desajuste que esto protege estaba solo en las marcas
    // de tiempo, y comparar el objeto entero es lo que lo destapa.
    assert.deepEqual(creada, enLista)
  })

  test('lo que devuelve actualizar coincide campo por campo con la lista', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta('ada@flowsync.test')
    const creada = tarea(
      await client.post('/api/v1/tasks').loginAs(ada).json({ title: 'Para cambiar' })
    )

    const actualizada = tarea(
      await client.patch(`/api/v1/tasks/${creada.id}`).loginAs(ada).json({ status: 'in_progress' })
    )
    const enLista = tareas(await client.get('/api/v1/tasks').loginAs(ada))[0]

    assert.deepEqual(actualizada, enLista)
  })
})

test.group('tasks · La lista exige haber entrado', () => {
  test('las tres rutas deniegan el acceso sin sesión', async ({ client }) => {
    const lista = await client.get('/api/v1/tasks')
    lista.assertStatus(401)

    const creacion = await client.post('/api/v1/tasks').json({ title: 'Sin sesión' })
    creacion.assertStatus(401)

    const actualizacion = await client.patch('/api/v1/tasks/1').json({ status: 'done' })
    actualizacion.assertStatus(401)
  })
})
