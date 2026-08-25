import app from '@adonisjs/core/services/app'

/**
 * El documento OpenAPI de FlowSync, en las dos formas en las que hace falta:
 * construido en memoria desde el router y serializado tal y como se versiona.
 *
 * Vive aquí, y no dentro de `commands/`, porque ace carga como comando todo
 * fichero de ese directorio y esto no lo es: lo comparten `openapi:generate`,
 * que escribe el documento, y `openapi:check`, que solo lo compara.
 */

/**
 * Ruta del documento versionado, relativa a la raíz del repositorio. Se usa
 * también en los mensajes, que es la ruta que reconoce quien lee la salida.
 */
export const DOCUMENT_REPO_PATH = 'docs/api/openapi.json'

/**
 * Ruta absoluta del documento versionado.
 *
 * `app.makePath()` cuelga de `backend/`, que es la raíz de la aplicación
 * AdonisJS; `docs/` está un nivel por encima, en la raíz del monorepo.
 */
export function documentPath(): string {
  return app.makePath('..', DOCUMENT_REPO_PATH)
}

/**
 * Construye el documento a partir del router ya cargado. Es exactamente la
 * misma llamada que sirve `GET /api.json`, así que el fichero versionado y lo
 * que responde el servidor salen de la misma fuente.
 */
export async function buildDocument(): Promise<unknown> {
  // El documento se arma recorriendo `router.toJSON()`, que solo devuelve algo
  // con el router ya consolidado. Al servir por HTTP lo consolida el servidor
  // al arrancar; en un comando de ace nadie lo hace, y sin esto el documento
  // saldría con `paths` vacío. Es lo mismo que hace `node ace list:routes`.
  const router = await app.container.make('router')
  router.commit()

  const openapi = await app.container.make('openapi')
  return openapi.buildDocument()
}

/**
 * Serializa el documento tal y como se escribe en disco: sangría de dos
 * espacios y salto de línea final, para que el fichero versionado dé diffs
 * legibles en vez de una única línea enorme.
 */
export function serializeDocument(document: unknown): string {
  return `${JSON.stringify(document, null, 2)}\n`
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function formatPath(path: string[]): string {
  return path.length === 0 ? 'el documento entero' : path.join(' → ')
}

function preview(value: unknown): string {
  const serialized = JSON.stringify(value) ?? 'undefined'
  return serialized.length > 60 ? `${serialized.slice(0, 57)}…` : serialized
}

function collect(path: string[], versioned: unknown, regenerated: unknown, lines: string[]): void {
  if (isPlainObject(versioned) && isPlainObject(regenerated)) {
    const keys = [...new Set([...Object.keys(versioned), ...Object.keys(regenerated)])]
    for (const key of keys) {
      if (!(key in regenerated)) {
        lines.push(`sobra en el versionado: ${formatPath([...path, key])}`)
      } else if (!(key in versioned)) {
        lines.push(`falta en el versionado: ${formatPath([...path, key])}`)
      } else {
        collect([...path, key], versioned[key], regenerated[key], lines)
      }
    }
    return
  }

  if (Array.isArray(versioned) && Array.isArray(regenerated)) {
    for (let index = 0; index < Math.max(versioned.length, regenerated.length); index++) {
      const at = [...path, `[${index}]`]
      if (index >= regenerated.length) {
        lines.push(`sobra en el versionado: ${formatPath(at)}`)
      } else if (index >= versioned.length) {
        lines.push(`falta en el versionado: ${formatPath(at)}`)
      } else {
        collect(at, versioned[index], regenerated[index], lines)
      }
    }
    return
  }

  if (JSON.stringify(versioned) !== JSON.stringify(regenerated)) {
    lines.push(
      `cambia: ${formatPath(path)} — versionado ${preview(versioned)}, regenerado ${preview(regenerated)}`
    )
  }
}

/**
 * Describe en qué se diferencian el documento versionado y el regenerado, una
 * línea por diferencia y con la ruta dentro del documento.
 *
 * Devuelve una lista vacía cuando los dos son equivalentes como JSON: en ese
 * caso, si los ficheros no coinciden byte a byte, lo que cambia es el formato
 * o el orden de las claves, no el contrato.
 */
export function describeDifferences(versioned: unknown, regenerated: unknown): string[] {
  const lines: string[] = []
  collect([], versioned, regenerated, lines)
  return lines
}
