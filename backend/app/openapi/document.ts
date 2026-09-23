import type { ApplicationService } from '@adonisjs/core/types'

/**
 * El documento OpenAPI como fichero.
 *
 * `@foadonis/openapi` construye el documento en cada petición y lo sirve por
 * HTTP (`/api.json`), así que sin servidor levantado no existe en ninguna
 * parte. Este módulo es la pieza que lo pasa a fichero: lo serializa siempre
 * igual y dice dónde vive la copia versionada, para que `openapi:generate` la
 * escriba y `openapi:check` la compare sin que ninguno de los dos repita el
 * criterio del otro.
 */

/**
 * Serializa el documento tal y como se versiona: dos espacios de sangría, un
 * salto de línea final y el orden que da el generador.
 *
 * La sangría no es cosmética. El documento se commitea, así que un cambio de
 * una operación tiene que salir en el diff como unas pocas líneas y no como
 * una única línea de 30 KB reescrita entera.
 */
export async function buildDocumentJson(app: ApplicationService): Promise<string> {
  /**
   * El documento se arma recorriendo `router.toJSON()`, que solo devuelve algo
   * una vez las rutas están commiteadas en el store. Al servir por HTTP lo hace
   * el servidor al arrancar; en un comando de consola nadie lo ha hecho, y sin
   * esto el documento saldría con `paths: {}`. `commit()` es idempotente, igual
   * que en `list:routes`.
   */
  const router = await app.container.make('router')
  router.commit()

  const openapi = await app.container.make('openapi')
  const document = await openapi.buildDocument()

  return `${JSON.stringify(document, null, 2)}\n`
}

/**
 * Ruta absoluta del documento versionado, `docs/api/openapi.json`.
 *
 * Vive en `docs/` —fuera de `backend/`— porque documenta la API del proyecto,
 * no el paquete del backend: de ahí el `../` sobre la raíz de la aplicación.
 */
export function versionedDocumentPath(app: ApplicationService): string {
  return app.makePath('../docs/api/openapi.json')
}

/**
 * Ruta absoluta donde `openapi:check` deja el documento que acaba de
 * regenerar. Cuelga de `tmp/`, que está en el `.gitignore`, para que la
 * comprobación no ensucie el árbol de trabajo con su propio artefacto.
 */
export function temporaryDocumentPath(app: ApplicationService): string {
  return app.tmpPath('openapi/openapi.json')
}

/**
 * Explica en qué se diferencian dos documentos, en lenguaje de rutas JSON.
 *
 * Devuelve una línea por diferencia. Compara los objetos ya parseados en vez
 * de las cadenas porque lo útil de un fallo de `openapi:check` es saber **qué**
 * operación o qué esquema se ha movido, no en qué byte empiezan a divergir dos
 * ficheros de miles de líneas. Si alguno de los dos no es JSON válido —el
 * versionado editado a mano, típicamente— cae a una comparación por líneas.
 */
export function describeDifferences(versioned: string, regenerated: string): string[] {
  let versionedDocument: unknown
  let regeneratedDocument: unknown

  try {
    versionedDocument = JSON.parse(versioned)
    regeneratedDocument = JSON.parse(regenerated)
  } catch {
    return [describeFirstDifferentLine(versioned, regenerated)]
  }

  const differences: string[] = []
  collectDifferences(versionedDocument, regeneratedDocument, '', differences)

  return differences
}

/**
 * Recorre los dos documentos en paralelo y acumula una línea por diferencia.
 */
function collectDifferences(
  versioned: unknown,
  regenerated: unknown,
  path: string,
  differences: string[]
): void {
  if (isPlainObject(versioned) && isPlainObject(regenerated)) {
    const keys = [...new Set([...Object.keys(versioned), ...Object.keys(regenerated)])].sort()

    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key

      if (!(key in regenerated)) {
        differences.push(`sobra en el versionado    ${childPath}`)
        continue
      }

      if (!(key in versioned)) {
        differences.push(`falta en el versionado    ${childPath}`)
        continue
      }

      collectDifferences(versioned[key], regenerated[key], childPath, differences)
    }

    return
  }

  if (Array.isArray(versioned) && Array.isArray(regenerated)) {
    const length = Math.max(versioned.length, regenerated.length)

    for (let index = 0; index < length; index++) {
      const childPath = `${path}[${index}]`

      if (index >= regenerated.length) {
        differences.push(`sobra en el versionado    ${childPath}`)
        continue
      }

      if (index >= versioned.length) {
        differences.push(`falta en el versionado    ${childPath}`)
        continue
      }

      collectDifferences(versioned[index], regenerated[index], childPath, differences)
    }

    return
  }

  if (JSON.stringify(versioned) === JSON.stringify(regenerated)) {
    return
  }

  differences.push(
    `distinto                  ${path || '(raíz)'}: ` +
      `${summarize(versioned)} → ${summarize(regenerated)}`
  )
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Un valor en una línea. Se recorta porque en la salida solo hace falta
 * reconocerlo, no leerlo entero.
 */
function summarize(value: unknown): string {
  const serialized = JSON.stringify(value) ?? 'undefined'

  return serialized.length > 60 ? `${serialized.slice(0, 57)}...` : serialized
}

/**
 * Salida de emergencia cuando alguno de los dos ficheros no es JSON válido.
 */
function describeFirstDifferentLine(versioned: string, regenerated: string): string {
  const versionedLines = versioned.split('\n')
  const regeneratedLines = regenerated.split('\n')
  const length = Math.max(versionedLines.length, regeneratedLines.length)

  for (let index = 0; index < length; index++) {
    if (versionedLines[index] !== regeneratedLines[index]) {
      return (
        `primera línea distinta (${index + 1}): ` +
        `${JSON.stringify(versionedLines[index])} → ${JSON.stringify(regeneratedLines[index])}`
      )
    }
  }

  return 'los ficheros difieren en bytes que no se ven por líneas'
}
