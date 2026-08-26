import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Registro de cuenta. Cubre los requisitos «Registro de una cuenta nueva»,
 * «Validación de los datos de registro» y «Un email, una sola cuenta» de
 * `openspec/specs/auth/spec.md`.
 *
 * El aislamiento es una transacción global y no un truncate: aísla un caso de
 * otro dentro de la misma ejecución, que es para lo que sirve bien.
 *
 * Ya no es la única línea de defensa. Desde ADR-0001, `config/database.ts`
 * elige el fichero según el entorno, así que la suite escribe sobre
 * `tmp/db-test.sqlite3` y no puede tocar la base de desarrollo.
 */
test.group('Auth | registro', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('registrarse devuelve la cuenta y un token que ya sirve', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })

    response.assertStatus(200)

    const { user, token } = response.body().data
    assert.equal(user.email, 'ada@example.com')
    assert.equal(user.fullName, 'Ada Lovelace')
    assert.equal(user.initials, 'AL')
    assert.isString(token)

    // El scenario dice «utilizable en la misma respuesta»: se comprueba usándolo.
    const profile = await client
      .get('/api/v1/account/profile')
      .header('Authorization', `Bearer ${token}`)

    profile.assertStatus(200)
    assert.equal(profile.body().data.email, 'ada@example.com')
  })

  test('una cuenta puede quedarse sin nombre', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: null,
      email: 'sin-nombre@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })

    response.assertStatus(200)
    assert.isNull(response.body().data.user.fullName)
  })

  test('la contraseña nunca sale en la respuesta', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })

    const serialized = JSON.stringify(response.body().data.user)
    assert.notInclude(serialized, 'secreto123')
    assert.notInclude(serialized, 'password')
  })

  test('una contraseña corta se rechaza y no crea cuenta', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'corta',
      passwordConfirmation: 'corta',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'password', rule: 'minLength' }] })
    assert.isNull(await User.findBy('email', 'ada@example.com'))
  })

  test('la confirmación tiene que coincidir', async ({ client, assert }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto456',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'passwordConfirmation' }] })
    assert.isNull(await User.findBy('email', 'ada@example.com'))
  })

  test('un email mal formado se rechaza', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Ada Lovelace',
      email: 'ada-arroba-example',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'email' }] })
  })

  test('un email ya registrado no crea una segunda cuenta', async ({ client, assert }) => {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })

    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Otra Persona',
      email: 'ada@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'email' }] })

    const cuentas = await User.query().where('email', 'ada@example.com')
    assert.lengthOf(cuentas, 1)
    assert.equal(cuentas[0].fullName, 'Ada Lovelace')
  })
})
