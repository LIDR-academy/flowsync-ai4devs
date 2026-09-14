/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import openapi from '@foadonis/openapi/services/main'
import { contratoServido } from '#openapi/document'
import YAML from 'yaml'

router.get('/', () => {
  return { hello: 'world' }
})

/**
 * Documentación OpenAPI: la interfaz en `/api`, y el documento en `/api.json` y
 * `/api.yaml`. La interfaz lee el documento del `/api.json`, así que las dos
 * cosas viven en sitios distintos.
 *
 * Va fuera del grupo `/api/v1` a propósito: dentro heredaría ese prefijo y la
 * documentación pasaría a colgar de la propia versión que documenta.
 *
 * **No se usa `openapi.registerRoutes()`**, que es lo que trae la librería, y
 * el motivo es H-26: su controlador llama a `buildDocument()` en cada petición,
 * y esa construcción **acumula sobre la metadata de los decoradores** en vez de
 * partir de cero. La librería lo tapa cacheando, pero solo en producción:
 *
 *     if (this.#document && this.#isProduction) return this.#document
 *
 * Fuera de producción el documento crecía una entrada por llamada. Medido: tres
 * peticiones seguidas devolvieron el parámetro `id` cinco, seis y siete veces.
 * A partir de la segunda, el documento servido **no es OpenAPI válido**: la
 * especificación exige que `name` + `in` sea única dentro de una operación.
 *
 * Aquí se construye **una sola vez** y se reutiliza: es `contratoServido()`,
 * en `app/openapi/document.ts`. La caché no distingue entornos porque el
 * problema tampoco: en producción el documento no cambia mientras el proceso
 * vive, y en desarrollo el servidor se reinicia con cada cambio que lo
 * afectaría.
 */
router.get('/api', async ({ response }) => {
  return response.header('Content-Type', 'text/html').send(openapi.generateUi('/api.json'))
})

router.get('/api.json', async ({ response }) => {
  return response.header('Content-Type', 'application/json').send(await contratoServido())
})

router.get('/api.yaml', async ({ response }) => {
  // Se parte del mismo JSON cacheado y no de una segunda construcción: dos
  // documentos que deberían ser el mismo y se construyen por separado es
  // justamente lo que hace falta evitar.
  const yaml = YAML.stringify(JSON.parse(await contratoServido()))
  return response.header('Content-Type', 'application/yaml').send(yaml)
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('/', [controllers.Tasks, 'index'])
        router.post('/', [controllers.Tasks, 'store'])
        router.get(':id', [controllers.Tasks, 'show'])
        router.patch(':id/status', [controllers.TaskStatuses, 'update'])
        router.put(':id/due-date', [controllers.TaskDueDates, 'update'])
      })
      .prefix('tasks')
      .as('tasks')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
