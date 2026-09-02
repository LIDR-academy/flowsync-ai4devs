import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { cuerpo, errores } from '#tests/helpers/api'

/**
 * Cubre los tres escenarios «Tarea inexistente» de
 * `openspec/specs/tasks/spec.md`, uno por cada ruta que resuelve un id.
 *
 * La spec solo exige el `404`, y el código ya lo devolvía. Lo que no había era
 * ninguna prueba sobre el **cuerpo**, y por eso pasó desapercibido que
 * `E_ROW_NOT_FOUND` caía al renderizador de depuración: devolvía el nombre de
 * la excepción, la traza, la línea del ORM y rutas absolutas del disco. El
 * contrato documentaba `{ errors: [...] }`, como el resto de errores, y por
 * tanto mentía.
 */
const RUTAS = [
  { nombre: 'consultar', metodo: 'get', camino: (id: string) => `/api/v1/tasks/${id}` },
  {
    nombre: 'cambiar el estado',
    metodo: 'patch',
    camino: (id: string) => `/api/v1/tasks/${id}/status`,
  },
  {
    nombre: 'fijar la fecha',
    metodo: 'put',
    camino: (id: string) => `/api/v1/tasks/${id}/due-date`,
  },
] as const

const CUERPOS: Record<string, Record<string, unknown>> = {
  'consultar': {},
  'cambiar el estado': { status: 'done' },
  'fijar la fecha': { today: '2026-08-26', dueDate: '2026-09-30' },
}

test.group('Tasks | tarea inexistente', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('las tres rutas rechazan con la forma de error del proyecto', async ({ client, assert }) => {
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@flowsync.test',
      password: 'contrasena123',
    })

    for (const ruta of RUTAS) {
      for (const id of ['999999', 'no-es-un-id']) {
        const peticion = client[ruta.metodo](ruta.camino(id)).loginAs(ada)
        if (ruta.metodo === 'get') peticion.qs({ today: '2026-08-26' })
        else peticion.json(cuerpo(CUERPOS[ruta.nombre]))

        const respuesta = await peticion

        respuesta.assertStatus(404)
        assert.isArray(errores(respuesta), `${ruta.nombre} con id ${id}`)
        assert.isString(errores(respuesta)[0].message)
      }
    }
  })

  test('el rechazo de una tarea inexistente no revela internals', async ({ client, assert }) => {
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@flowsync.test',
      password: 'contrasena123',
    })

    const respuesta = await client
      .get('/api/v1/tasks/999999')
      .qs({ today: '2026-08-26' })
      .loginAs(ada)

    // El cuerpo entero. Es lo que devolvía el renderizador de depuración y lo
    // que ninguna prueba miraba, porque todas se conformaban con el código.
    //
    // Cubre las rutas de tareas. Que ninguna respuesta del sistema revele
    // internals lo cubre `tests/functional/errores.spec.ts`, desde ADR-0003.
    const crudo = JSON.stringify(respuesta.body())
    for (const rastro of ['frames', 'fileName', 'lineNumber', 'node_modules', 'E_ROW_NOT_FOUND']) {
      assert.notInclude(crudo, rastro, `la respuesta filtra «${rastro}»`)
    }
  })
})
