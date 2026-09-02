import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { invalido } from '#tests/helpers/api'

/**
 * Cierra H-19 (ADR-0003), que se arrastraba desde el Módulo 3.
 *
 * Ninguna respuesta de error puede llevar el volcado de depuración -traza,
 * nombre de la excepción, rutas absolutas del disco- **ni el mensaje crudo de
 * la excepción**, que en un error de base de datos es la sentencia SQL entera,
 * con los valores insertados dentro. Bastaba alcanzar el puerto para leerlo, y
 * sin sesión.
 *
 * Las dos mitades se comprueban aquí porque se arreglaron en dos sitios
 * distintos y una sin la otra deja el defecto vivo: apagar el volcado quita las
 * trazas y deja el `{ message }` del framework, y normalizar la forma sin
 * apagar el volcado deja las trazas.
 */

/**
 * Lo que no puede aparecer en el cuerpo de ninguna respuesta de error.
 *
 * Las cinco primeras son del volcado de Youch. Las siguientes son del mensaje
 * crudo de un error de SQLite, que es la mitad que sobrevivió a apagar el
 * volcado. `$scrypt$` es el prefijo del hash de contraseña: aparecía literal
 * dentro del `insert into users …` que devolvía el 500 del alta.
 */
const RASTROS = [
  'frames',
  'fileName',
  'lineNumber',
  'node_modules',
  'stack',
  'insert into',
  'select ',
  'update ',
  'delete from',
  'UNIQUE constraint',
  'SqliteError',
  'E_ROW_NOT_FOUND',
  '$scrypt$',
  // Rutas absolutas de los dos sistemas donde esto corre. Ninguna es
  // suficiente por sí sola: en Windows sale `C:/` y en macOS `/Users/`.
  'C:/',
  'C:\\',
  '/home/',
  '/Users/',
]

/**
 * El cuerpo no filtra nada **y dice algo**.
 *
 * La segunda mitad no es adorno. `JSON.stringify` de un cuerpo vacío es `"{}"`,
 * y contra esa cadena las comprobaciones de arriba pasan todas sin mirar nada:
 * la prueba se cumpliría por vacuidad si un día la respuesta dejara de ser
 * JSON. Así que se exige además la forma cerrada que el contrato documenta.
 */
function sinRastros(
  cuerpo: unknown,
  assert: {
    notInclude: (a: string, b: string, m?: string) => void
    isObject: (a: unknown, m?: string) => void
    isNotEmpty: (a: unknown, m?: string) => void
  }
) {
  const crudo = JSON.stringify(cuerpo ?? '')

  for (const rastro of RASTROS) {
    assert.notInclude(crudo, rastro, `la respuesta filtra «${rastro}»`)
  }

  assert.isObject(cuerpo, 'la respuesta de error no trae un cuerpo JSON')
  assert.isNotEmpty(cuerpo as object, 'la respuesta de error trae un cuerpo vacío')
}

test.group('Errores | ninguna respuesta revela internals', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('una ruta que no existe', async ({ client, assert }) => {
    // Sin sesión a propósito: era el caso más expuesto, porque no hace falta
    // ninguna credencial para provocarlo.
    const respuesta = await client.get('/api/v1/inventado')

    respuesta.assertStatus(404)
    sinRastros(respuesta.body(), assert)
  })

  test('un identificador que no existe', async ({ client, assert }) => {
    const usuario = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })

    const respuesta = await client
      .patch('/api/v1/tasks/99999/status')
      .loginAs(usuario)
      .json({ status: 'done' })

    // Es el caso original de H-19: el `PATCH` sobre una tarea inexistente que
    // el `/verify` del Módulo 3 destapó devolviendo la traza entera.
    respuesta.assertStatus(404)
    sinRastros(respuesta.body(), assert)
  })

  /**
   * Las **siete** rutas protegidas, no una muestra.
   *
   * El título decía «todas» y la lista traía tres, todas de lectura: las dos
   * escrituras de tarea y el cierre de sesión no las miraba nadie. Un nombre
   * que promete más de lo que el cuerpo hace es la forma de prueba que peor
   * envejece, porque quien la lee da por cubierto lo que no está.
   *
   * La lista se contrasta contra la tabla de rutas de `CLAUDE.md`: si mañana se
   * añade una ruta protegida y no se añade aquí, el hueco vuelve.
   */
  const RUTAS_PROTEGIDAS = [
    ['get', '/api/v1/account/profile'],
    ['post', '/api/v1/account/logout'],
    ['get', '/api/v1/tasks'],
    ['post', '/api/v1/tasks'],
    ['get', '/api/v1/tasks/1'],
    ['patch', '/api/v1/tasks/1/status'],
    ['put', '/api/v1/tasks/1/due-date'],
  ] as const

  test('sin credencial, en todas las rutas protegidas', async ({ client, assert }) => {
    for (const [metodo, camino] of RUTAS_PROTEGIDAS) {
      // Sin cuerpo a propósito: la credencial se comprueba antes de llegar al
      // controlador, así que un 422 aquí significaría que el orden es otro.
      const respuesta = await client[metodo](camino)

      respuesta.assertStatus(401)
      sinRastros(respuesta.body(), assert)
    }
  })

  /**
   * El contrato afirma en su primera línea que «todo error viaja como
   * `{ errors: [ ... ] }`», y no era cierto: un JSON mal formado devolvía
   * `{ message }` bajo un `400` que el contrato **sí** documenta con
   * `schema: Errores`. Contrato roto en silencio, encontrado por la sexta
   * revisión adversarial.
   *
   * Estos son los errores que no maneja nadie más: no son de validación, no
   * son de credencial, y no vienen de resolver un identificador. Son justo los
   * que se colaban.
   */
  test('todo error viaja con la forma del contrato', async ({ client, assert }) => {
    const respuestas = [
      // El cuerpo se corta a la mitad: el parser falla antes de que exista
      // ningún validador que pueda decir nada.
      await client
        .post('/api/v1/auth/login')
        .header('content-type', 'application/json')
        .json(invalido('{"email":')),
      // JSON válido que no es un objeto.
      await client
        .post('/api/v1/auth/login')
        .header('content-type', 'application/json')
        .json(invalido('"hola"')),
      await client.get('/api/v1/inventado'),
    ]

    for (const respuesta of respuestas) {
      const cuerpo = respuesta.body() as { errors?: { message?: string }[] }

      assert.isArray(cuerpo.errors, 'la respuesta no trae `errors`: ' + JSON.stringify(cuerpo))
      assert.isNotEmpty(cuerpo.errors)
      assert.isString(cuerpo.errors?.[0]?.message)
      sinRastros(cuerpo, assert)
    }
  })

  test('un cuerpo que el validador rechaza', async ({ client, assert }) => {
    const respuesta = await client
      .post('/api/v1/auth/signup')
      .json(invalido({ email: 'no-es-un-email', password: 'corta' }))

    respuesta.assertStatus(422)
    sinRastros(respuesta.body(), assert)
  })

  /**
   * El caso que motivó ADR-0003, y el que faltaba.
   *
   * Un `5xx` es el único error cuyo mensaje lo escribe la librería que falló y
   * no el producto, así que es el único que puede decir cualquier cosa. Aquí
   * dice la sentencia SQL entera con el hash de la contraseña dentro.
   *
   * Se provoca de forma determinista y no con la carrera del alta: se guarda
   * una cuenta en mayúsculas saltándose el validador -que es lo que haría un
   * seeder o un comando de ace- y se da de alta la misma en minúsculas. La
   * regla `unique` compara la cadena tal cual y la deja pasar; el índice único
   * sobre `lower(email)`, que existe justo para eso, la detiene con un error de
   * la base. Ese error es el que no puede llegar al cliente.
   */
  test('un error inesperado de la base de datos', async ({ client, assert }) => {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ADA@EXAMPLE.COM',
      password: 'secreto123',
    })

    const respuesta = await client.post('/api/v1/auth/signup').json({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })

    respuesta.assertStatus(500)
    sinRastros(respuesta.body(), assert)

    // Y responde lo mismo que cualquier otro error del sistema: un 500 no tiene
    // nada que contarle a quien lo provoca.
    assert.deepEqual(respuesta.body(), {
      errors: [{ message: 'Error interno del servidor' }],
    })
  })
})
