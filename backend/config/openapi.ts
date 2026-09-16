import { defineConfig } from '@foadonis/openapi'

export default defineConfig({
  ui: 'scalar',
  document: {
    info: {
      title: 'FlowSync API',
      // Copiada a mano de la de package.json (no hay lectura automática):
      // si esa versión cambia, esta hay que actualizarla aparte.
      version: '0.0.0',
    },
    components: {
      // Le da forma al `bearer` que declaran @ApiBearerAuth() en los
      // controladores: sin esto, `security` referenciaría un scheme que no
      // existe en ningún sitio del documento.
      securitySchemes: {
        bearer: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
  },
})
