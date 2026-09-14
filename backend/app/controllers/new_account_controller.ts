import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import { ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import {
  AccessTokenResponse,
  ErrorResponse,
  SignupBody,
  ValidationErrorResponse,
} from '#openapi/schemas'

export default class NewAccountController {
  @ApiOperation({ summary: 'Dar de alta una cuenta y abrir sesión' })
  @ApiBody({ type: SignupBody })
  @ApiResponse({ status: 200, type: AccessTokenResponse })
  @ApiResponse({
    status: 422,
    type: ValidationErrorResponse,
    description: 'Falta un campo, el email ya existe, o las contraseñas no coinciden',
  })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no lleva traza, ni rutas del disco, ni la sentencia SQL (ADR-0005).',
    type: () => ErrorResponse,
  })
  async store({ request, serialize }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(signupValidator)

    const user = await User.create({ fullName, email, password })
    const token = await User.accessTokens.create(user)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}
