import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Las iniciales llegan por la API junto a la cuenta. La regla que las calcula
 * -dos palabras, una palabra, sin nombre- vive en `models/user.ts` y la fijan
 * las unitarias de `tests/unit/iniciales.spec.ts`; aquí solo importa que el
 * transformer las incluya.
 */
test.group('Auth | iniciales', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('la cuenta llega con sus iniciales', async ({ client, assert }) => {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })

    response.assertStatus(200)
    assert.equal(response.body().data.user.initials, 'AL')
  })
})
