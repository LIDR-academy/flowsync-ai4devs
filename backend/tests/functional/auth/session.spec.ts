import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Perfil, cierre de sesión y protección de las rutas de cuenta. Cubre los
 * requisitos «Consulta del perfil de la sesión activa», «Cierre de sesión» y
 * «Protección de los recursos de cuenta» de `openspec/specs/auth/spec.md`.
 */
test.group('Auth | sesión', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any, email = 'ada@example.com') {
    await User.create({ fullName: 'Ada Lovelace', email, password: 'secreto123' })

    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  test('el perfil devuelve la cuenta del token presentado', async ({ client, assert }) => {
    const token = await sesion(client)

    const response = await client
      .get('/api/v1/account/profile')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const perfil = response.body().data
    assert.properties(perfil, ['id', 'fullName', 'email', 'initials', 'createdAt', 'updatedAt'])
    assert.equal(perfil.email, 'ada@example.com')
  })

  test('sin cabecera de autorización no se devuelve nada de la cuenta', async ({ client }) => {
    await sesion(client)

    const response = await client.get('/api/v1/account/profile')

    response.assertStatus(401)
  })

  test('un token inventado no abre las rutas de cuenta', async ({ client }) => {
    await sesion(client)

    const response = await client
      .get('/api/v1/account/profile')
      .header('Authorization', 'Bearer oat_1.esto-no-es-un-token')

    response.assertStatus(401)
  })

  test('cerrar sesión invalida el token usado', async ({ client, assert }) => {
    const token = await sesion(client)

    const logout = await client
      .post('/api/v1/account/logout')
      .header('Authorization', `Bearer ${token}`)

    logout.assertStatus(200)
    assert.equal(logout.body().message, 'Logged out successfully')

    const despues = await client
      .get('/api/v1/account/profile')
      .header('Authorization', `Bearer ${token}`)

    despues.assertStatus(401)
  })

  test('cerrar una sesión no cierra las demás de la misma cuenta', async ({ client }) => {
    const primera = await sesion(client)

    const otroLogin = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })
    const segunda = otroLogin.body().data.token

    await client.post('/api/v1/account/logout').header('Authorization', `Bearer ${primera}`)

    const response = await client
      .get('/api/v1/account/profile')
      .header('Authorization', `Bearer ${segunda}`)

    response.assertStatus(200)
  })

  test('el registro y el login siguen siendo públicos', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      fullName: 'Alan Turing',
      email: 'alan@example.com',
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    })

    response.assertStatus(200)
  })
})
