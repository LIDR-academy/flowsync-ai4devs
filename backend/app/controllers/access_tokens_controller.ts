import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import {
  AccessTokenResponse,
  ErrorResponse,
  LoginBody,
  LogoutResponse,
  ValidationErrorResponse,
} from '#openapi/schemas'

export default class AccessTokensController {
  @ApiOperation({ summary: 'Abrir sesión y obtener un access token' })
  @ApiBody({ type: LoginBody })
  @ApiResponse({ status: 200, type: AccessTokenResponse })
  @ApiResponse({ status: 400, type: ErrorResponse, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 422, type: ValidationErrorResponse })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no lleva traza, ni rutas del disco, ni la sentencia SQL (ADR-0005).',
    type: () => ErrorResponse,
  })
  async store({ request, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }

  // `store` es pública a propósito -es el acceso-; `destroy` no. Ver el
  // comentario de `ProfileController`: el contrato las declaraba iguales.
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar la sesión actual' })
  @ApiResponse({ status: 200, type: LogoutResponse })
  @ApiResponse({ status: 401, type: ErrorResponse })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no lleva traza, ni rutas del disco, ni la sentencia SQL (ADR-0005).',
    type: () => ErrorResponse,
  })
  async destroy({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return serialize({ message: 'Logged out successfully' })
  }
}
