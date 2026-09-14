import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import { AccountResponse, ErrorResponse } from '#openapi/schemas'

export default class ProfileController {
  // Sin esto, el contrato salía con `security: []`, que en OpenAPI no significa
  // «no se ha dicho nada» sino **«esta ruta es pública»**. La ruta la protege
  // `middleware.auth()` desde siempre; lo que mentía era el documento, y en la
  // dirección peor: quien integrara leyéndolo esperaría un 200 sin cabecera.
  @ApiBearerAuth()
  @ApiOperation({ summary: 'La cuenta de quien pregunta' })
  @ApiResponse({ status: 200, type: AccountResponse })
  @ApiResponse({
    status: 401,
    type: ErrorResponse,
    description: 'Sin sesión o con un token inválido',
  })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no lleva traza, ni rutas del disco, ni la sentencia SQL (ADR-0005).',
    type: () => ErrorResponse,
  })
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }
}
