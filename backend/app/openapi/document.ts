/**
 * Ruta, relativa a la raíz del backend, del documento OpenAPI versionado.
 * Vive en `docs/` (raíz del monorepo), junto al resto de documentación de
 * capabilities, no dentro de `backend/`.
 */
export const OPENAPI_DOCUMENT_PATH_SEGMENTS = ['..', 'docs', 'api', 'openapi.json'] as const

/**
 * Serialización canónica del documento OpenAPI. La usan tanto
 * `openapi:generate` para escribir el fichero versionado como
 * `openapi:check` para regenerarlo en una ubicación temporal y compararlo:
 * si difirieran en el formato, el check reportaría diferencias que no son
 * el contrato sino cómo se imprime.
 */
export function serializeOpenapiDocument(document: unknown): string {
  return `${JSON.stringify(document, null, 2)}\n`
}
