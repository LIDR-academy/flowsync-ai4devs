import User from '#models/user'
import Task from '#models/task'
import { errores, invalido } from '#tests/helpers/api'
import type { ApiClient } from '@japa/api-client'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Los nombres de regla son contrato con el frontend.
 *
 * `frontend/src/lib/api.ts` traduce los errores de validación a castellano con
 * un `switch (rule)` sobre ocho identificadores que **los emite VineJS**, no
 * nosotros. Si uno cambia -al subir de versión, al reescribir un validador o al
 * renombrar una regla- el `switch` cae al caso por defecto y la persona ve un
 * mensaje genérico en lugar del suyo. Sin ruido, sin rojo, sin nada.
 *
 * Era H-05, y estuvo abierto desde el 2026-08-24 con la nota «parcialmente
 * vigilado»: las 28 pruebas del frontend cubren `api.ts` con payloads
 * fabricados a mano, así que siguen en verde aunque el backend deje de emitir
 * ese nombre. Comprobaban la traducción, no el acoplamiento.
 *
 * Esta suite ata los ocho contra la API de verdad. No comprueba el mensaje
 * -eso es del frontend- sino que el identificador siga llegando.
 *
 * Cada petición que provoca un nombre vive en `EMISORES`, y la usan tanto su
 * prueba como la del cierre. Hasta el 2026-09-12 el cierre leía un `Set` que
 * rellenaban las pruebas anteriores del grupo, así que lanzado solo con
 * `--tests` -uso documentado en AGENTS.md- decía que la API no emitía ninguno
 * de los ocho. Lo encontró el revisor de CI.
 */
test.group('Contrato | los nombres de regla que el frontend traduce', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /** Los ocho `case` de `traducirError` en `frontend/src/lib/api.ts`. */
  const TRADUCIDOS = [
    'database.unique',
    'sameAs',
    'email',
    'required',
    'minLength',
    'maxLength',
    'date',
    'enum',
  ]

  const reglas = (lista: { rule?: string }[]) =>
    lista.map(({ rule }) => rule).filter((rule): rule is string => Boolean(rule))

  async function sesion(client: ApiClient, email: string) {
    const user = await User.create({ fullName: 'Ada Lovelace', email, password: 'secreto123' })
    const respuesta = await client
      .post('/api/v1/auth/login')
      .json({ email, password: 'secreto123' })
    return { user, token: (respuesta.body() as { data: { token: string } }).data.token }
  }

  /**
   * Cada uno provoca sus nombres contra la API y devuelve los que llegaron.
   * Cada uno con su propia cuenta, para que el cierre pueda lanzarlos todos
   * seguidos sin que choquen en la unicidad del email.
   */
  const EMISORES = {
    async altaVacia(client: ApiClient) {
      return reglas(errores(await client.post('/api/v1/auth/signup').json(invalido({}))))
    },

    async altaMala(client: ApiClient) {
      return reglas(
        errores(
          await client.post('/api/v1/auth/signup').json(
            invalido({
              fullName: null,
              email: 'esto-no-es-un-email',
              password: 'corta',
              passwordConfirmation: 'otra-distinta',
            })
          )
        )
      )
    },

    async emailRepetido(client: ApiClient) {
      await User.create({ fullName: 'Ada', email: 'repetido@example.com', password: 'secreto123' })
      return reglas(
        errores(
          await client.post('/api/v1/auth/signup').json(
            invalido({
              fullName: 'Otra',
              email: 'repetido@example.com',
              password: 'secreto123',
              passwordConfirmation: 'secreto123',
            })
          )
        )
      )
    },

    async tituloLargo(client: ApiClient) {
      const { token } = await sesion(client, 'titulo@example.com')
      return reglas(
        errores(
          await client
            .post('/api/v1/tasks')
            .bearerToken(token)
            .json(invalido({ title: 'x'.repeat(201) }))
        )
      )
    },

    async estadoInventado(client: ApiClient) {
      const { token } = await sesion(client, 'estado@example.com')
      return reglas(
        errores(
          await client
            .get('/api/v1/tasks')
            .bearerToken(token)
            .qs({ status: 'inventado', today: '2026-09-09' })
        )
      )
    },

    async fechaMala(client: ApiClient) {
      const { user, token } = await sesion(client, 'fecha@example.com')
      const tarea = await Task.create({ title: 'Con fecha', assigneeId: user.id })
      return reglas(
        errores(
          await client
            .put(`/api/v1/tasks/${tarea.id}/due-date`)
            .bearerToken(token)
            .json(invalido({ dueDate: '32 de febrero', today: '2026-09-09' }))
        )
      )
    },
  }

  test('el alta emite required, email, minLength y sameAs', async ({ client, assert }) => {
    assert.includeMembers(await EMISORES.altaVacia(client), ['required'])
    assert.includeMembers(await EMISORES.altaMala(client), ['email', 'minLength', 'sameAs'])
  })

  test('un email ya registrado emite database.unique', async ({ client, assert }) => {
    assert.includeMembers(await EMISORES.emailRepetido(client), ['database.unique'])
  })

  test('un título de más de 200 caracteres emite maxLength', async ({ client, assert }) => {
    assert.includeMembers(await EMISORES.tituloLargo(client), ['maxLength'])
  })

  test('un estado que no existe emite enum', async ({ client, assert }) => {
    assert.includeMembers(await EMISORES.estadoInventado(client), ['enum'])
  })

  test('una fecha mal formada emite date', async ({ client, assert }) => {
    assert.includeMembers(await EMISORES.fechaMala(client), ['date'])
  })

  /**
   * El cierre. Las pruebas de arriba comprueban cada nombre por separado; esta
   * comprueba que **no falte ninguno** de los ocho que el frontend traduce.
   *
   * Si mañana alguien añade un `case` a `traducirError` sin una ruta que lo
   * emita, o quita del backend una regla que el frontend sigue traduciendo,
   * esta prueba lo dice con el nombre exacto.
   *
   * Lanza ella misma todos los emisores, así que no depende de que las de
   * arriba hayan corrido antes.
   */
  test('los ocho nombres que traduce el frontend los emite la API', async ({ client, assert }) => {
    const emitidos = new Set<string>()
    for (const emisor of Object.values(EMISORES)) {
      for (const regla of await emisor(client)) emitidos.add(regla)
    }

    const sinEmitir = TRADUCIDOS.filter((regla) => !emitidos.has(regla))
    assert.deepEqual(
      sinEmitir,
      [],
      `el frontend traduce reglas que la API ya no emite: ${sinEmitir.join(', ')}`
    )
  })
})
