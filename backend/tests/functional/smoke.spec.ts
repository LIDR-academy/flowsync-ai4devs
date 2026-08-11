import { test } from '@japa/runner'
import { bodyOf, createUser } from '#tests/helpers/index'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Base de pruebas', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('una petición autenticada llega al perfil de quien la hace', async ({ client, assert }) => {
    const user = await createUser()

    const response = await client.get('/api/v1/account/profile').loginAs(user)

    response.assertStatus(200)
    assert.equal(bodyOf(response).data.email, user.email)
  })

  test('sin credencial el perfil responde 401', async ({ client }) => {
    const response = await client.get('/api/v1/account/profile')

    response.assertStatus(401)
  })
})
