import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import router from '@adonisjs/core/services/router'
import openapi from '@foadonis/openapi/services/main'
import type { ApplicationService } from '@adonisjs/core/types'

/**
 * Dónde vive el documento versionado: `docs/api/openapi.json`, en la raíz del
 * repositorio y no dentro de `backend/`, porque `docs/` es del monorepo entero
 * —ahí ya están los ADR y los README de capability— y el contrato de la API se
 * lee desde fuera del backend.
 */
export function openApiDocumentPath(app: ApplicationService) {
  return app.makePath('..', 'docs', 'api', 'openapi.json')
}

/**
 * Construye el documento igual que lo serviría `/api.json`, y lo devuelve ya
 * serializado para escribirlo tal cual.
 *
 * El commit del router es necesario: `buildDocument()` descubre los
 * controladores con `router.toJSON()`, que no devuelve nada hasta que las rutas
 * están comprometidas. En el servidor lo hace el arranque del HTTP server; aquí
 * no hay servidor, así que lo hacemos a mano.
 */
export async function buildOpenApiDocument(): Promise<string> {
  if (!router.commited) {
    router.commit()
  }

  // Una sola construcción por proceso, y no es un detalle de estilo: el loader
  // de @foadonis/openapi acumula los parámetros de ruta sobre el prototipo del
  // controlador (`mergeMetadata`), así que construir el documento dos veces en
  // el mismo proceso duplica cada parámetro de path. Por eso lo que sirve
  // `/api.json` crece con cada petición, y por eso este comando arranca,
  // construye una vez y termina.
  const document = await openapi.buildDocument()

  // Indentado y con salto de línea final: es un fichero versionado y lo que
  // importa de él es que su diff se pueda leer.
  return `${JSON.stringify(document, null, 2)}\n`
}

export async function writeOpenApiDocument(path: string, contents: string) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, contents, 'utf-8')
}
