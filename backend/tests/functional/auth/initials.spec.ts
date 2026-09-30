import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Iniciales de la cuenta. Cubre los tres scenarios del requisito «Iniciales de
 * la cuenta» de `openspec/specs/auth/spec.md`: dos palabras, una sola palabra,
 * y la cuenta sin nombre, que las deriva del email.
 */
test.group('Auth | iniciales', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const casos: Array<[string, string | null, string, string]> = [
    [
      'un nombre de dos palabras da la inicial de cada una',
      'Ada Lovelace',
      'ada@example.com',
      'AL',
    ],
    ['un nombre de una palabra da sus dos primeras letras', 'Ada', 'ada@example.com', 'AD'],
    ['sin nombre, las iniciales salen del email', null, 'ada@example.com', 'AE'],
  ]

  for (const [titulo, fullName, email, esperadas] of casos) {
    test(titulo, async ({ client, assert }) => {
      await User.create({ fullName, email, password: 'secreto123' })

      const response = await client
        .post('/api/v1/auth/login')
        .json({ email, password: 'secreto123' })

      response.assertStatus(200)
      assert.equal(response.body().data.user.initials, esperadas)
    })
  }
})
