import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

/**
 * Una cuenta. Las columnas vienen de `UserSchema`, generado desde las
 * migraciones; aquí solo se añade la autenticación y lo derivado.
 *
 * El email se guarda en minúsculas y es único sin distinguir mayúsculas: lo
 * normaliza el validador antes de consultar y lo imponen dos migraciones (H-11).
 */
export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  /**
   * Tokens opacos guardados en `auth_access_tokens`. Se crean **sin
   * caducidad**: un token deja de valer al cerrar sesión con él, no con el tiempo.
   * Cada inicio de sesión emite uno nuevo y cerrar una sesión no cierra las demás.
   */
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  /**
   * Dos letras en mayúsculas para representar a la persona sin foto.
   *
   * Con nombre, la inicial de sus dos primeras palabras; con una sola palabra,
   * sus dos primeras letras. Sin nombre, lo mismo sobre el email partido por la
   * `@`: `ada@example.com` da `AE`. `fullName` es nulable, no opcional (H-04).
   */
  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
