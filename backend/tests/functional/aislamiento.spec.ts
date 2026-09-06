import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

/**
 * Fija la decisión de ADR-0003 preguntándole a la conexión viva por su fichero.
 *
 * `scripts/verificar-docs.mjs` lo comprueba leyendo `config/database.ts`, pero
 * eso es análisis de texto: la revisión adversarial del PR #21 demostró que un
 * comentario bastaba para satisfacerlo, y que apuntar la suite a cualquier otro
 * fichero la dejaba en verde. Esto pregunta al sistema, no al fuente.
 */
test.group('Aislamiento de la base de pruebas', () => {
  test('la suite escribe sobre su propio fichero, nunca sobre el de desarrollo', ({ assert }) => {
    const { filename } = db.connection().getReadClient().client.config.connection

    assert.equal(filename, app.tmpPath('db-test.sqlite3'))
    assert.notEqual(filename, app.tmpPath('db.sqlite3'))
  })

  test('el entorno es test pase lo que pase en la shell', ({ assert }) => {
    // `bin/test.ts` lo fuerza de forma incondicional. Es lo que hace que la
    // elección por entorno no dependa de cómo se lance la suite.
    assert.isTrue(app.inTest)
  })
})
