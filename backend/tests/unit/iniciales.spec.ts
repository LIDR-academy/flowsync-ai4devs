import User from '#models/user'
import { test } from '@japa/runner'

/**
 * El getter `initials` de `User`, sin base de datos. Los tres escenarios del
 * requisito «Iniciales de la cuenta» de `openspec/specs/auth/spec.md`: dos
 * palabras, una sola palabra, y sin nombre, que las deriva del email. Que las
 * iniciales lleguen por la API lo fija `tests/functional/auth/initials.spec.ts`.
 */
test.group('Auth | iniciales', () => {
  const cuenta = (fullName: string | null, email: string) => {
    const u = new User()
    u.fullName = fullName
    u.email = email
    return u
  }

  test('un nombre de dos palabras da la inicial de cada una', ({ assert }) => {
    assert.equal(cuenta('Ada Lovelace', 'ada@example.com').initials, 'AL')
  })

  test('un nombre de una palabra da sus dos primeras letras', ({ assert }) => {
    assert.equal(cuenta('Ada', 'ada@example.com').initials, 'AD')
  })

  test('sin nombre, las iniciales salen del email', ({ assert }) => {
    assert.equal(cuenta(null, 'ada@example.com').initials, 'AE')
  })
})
