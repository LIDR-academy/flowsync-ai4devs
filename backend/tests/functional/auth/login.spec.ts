import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Inicio de sesión. Cubre el requisito «Inicio de sesión con email y
 * contraseña» de `openspec/specs/auth/spec.md`, incluido el scenario que exige
 * que un email desconocido y una contraseña equivocada respondan igual.
 */
test.group('Auth | login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function cuenta() {
    return User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
  }

  test('con las credenciales correctas se emite un token que autentica', async ({
    client,
    assert,
  }) => {
    await cuenta()

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })

    response.assertStatus(200)

    const { user, token } = response.body().data
    assert.equal(user.email, 'ada@example.com')

    const profile = await client
      .get('/api/v1/account/profile')
      .header('Authorization', `Bearer ${token}`)

    profile.assertStatus(200)
  })

  test('una contraseña equivocada no emite token', async ({ client, assert }) => {
    await cuenta()

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'no-es-la-suya' })

    response.assertStatus(400)
    assert.notProperty(response.body(), 'token')
  })

  test('un email desconocido responde igual que una contraseña equivocada', async ({
    client,
    assert,
  }) => {
    await cuenta()

    const desconocido = await client
      .post('/api/v1/auth/login')
      .json({ email: 'nadie@example.com', password: 'secreto123' })

    const equivocada = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'no-es-la-suya' })

    // El scenario pide que sean INDISTINGUIBLES: si un día divergen, este test
    // cae, y con él la fuga que permitiría enumerar qué emails tienen cuenta.
    desconocido.assertStatus(400)
    equivocada.assertStatus(400)
    assert.deepEqual(desconocido.body(), equivocada.body())
  })

  test('un email mal formado se rechaza antes de comprobar credenciales', async ({ client }) => {
    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada-arroba-example', password: 'secreto123' })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ field: 'email' }] })
  })
})
