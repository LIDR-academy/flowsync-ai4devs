import { test } from '@japa/runner'
import { invalido } from '#tests/helpers/api'

/**
 * Cierra H-19, que se arrastraba desde el Módulo 3 (ADR-0003).
 *
 * Ninguna respuesta de error puede llevar el volcado de depuración: traza,
 * nombre de la excepción, rutas absolutas del disco, ni la sentencia SQL
 * ejecutada. Bastaba alcanzar el puerto para leerlo, y sin sesión.
 *
 * Se comprueba sobre el cuerpo entero y no sobre campos concretos: lo que se
 * protege es que no se filtre nada, no que no se filtre una clave conocida.
 */
const RASTROS = ['frames', 'fileName', 'lineNumber', 'node_modules', 'stack', 'C:/', '/home/']

function sinRastros(
  cuerpo: unknown,
  assert: { notInclude: (a: string, b: string, m?: string) => void }
) {
  const crudo = JSON.stringify(cuerpo ?? '')
  for (const rastro of RASTROS) {
    assert.notInclude(crudo, rastro, `la respuesta filtra «${rastro}»`)
  }
}

test.group('Errores | ninguna respuesta revela internals', () => {
  test('una ruta que no existe', async ({ client, assert }) => {
    // Sin sesión a propósito: era el caso más expuesto, porque no hace falta
    // ninguna credencial para provocarlo.
    const respuesta = await client.get('/api/v1/inventado')

    respuesta.assertStatus(404)
    sinRastros(respuesta.body(), assert)
  })

  test('un método que la ruta no admite', async ({ client, assert }) => {
    const respuesta = await client.delete('/api/v1/tasks')

    sinRastros(respuesta.body(), assert)
  })

  test('sin credencial, en todas las rutas protegidas', async ({ client, assert }) => {
    for (const camino of ['/api/v1/tasks', '/api/v1/tasks/1', '/api/v1/account/profile']) {
      const respuesta = await client.get(camino)

      respuesta.assertStatus(401)
      sinRastros(respuesta.body(), assert)
    }
  })

  test('un cuerpo que el validador rechaza', async ({ client, assert }) => {
    const respuesta = await client
      .post('/api/v1/auth/signup')
      .json(invalido({ email: 'no-es-un-email', password: 'corta' }))

    respuesta.assertStatus(422)
    sinRastros(respuesta.body(), assert)
  })
})
