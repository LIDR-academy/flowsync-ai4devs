import { defineConfig } from '@foadonis/openapi'

export default defineConfig({
  ui: 'scalar',
  document: {
    info: {
      title: 'FlowSync API',
      // La versión del documento, no la del paquete: acompaña al prefijo
      // `/api/v1` de `start/routes.ts`, que es la única versión de la API que
      // el código expone hoy.
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        // El nombre `bearer` no es libre: es el que usa el decorador
        // `@ApiBearerAuth()` con el que se anotan los controladores, y sin este
        // esquema declarado esas referencias quedarían colgando.
        bearer: {
          type: 'http',
          scheme: 'bearer',
          description:
            'Access token opaco emitido por `POST /api/v1/auth/login`, en la cabecera `Authorization: Bearer <token>`.',
        },
      },
    },
  },
})
