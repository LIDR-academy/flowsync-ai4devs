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
  },
})
