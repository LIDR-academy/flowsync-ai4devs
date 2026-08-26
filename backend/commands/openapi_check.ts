import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import {
  buildOpenApiDocument,
  OPENAPI_DOCUMENT_PATH,
  openApiDocumentPath,
} from '#services/openapi_document'

/**
 * Cuántas diferencias se enumeran antes de resumir el resto. Un documento que
 * se ha quedado muy atrás genera cientos: las primeras ya dicen dónde mirar, y
 * el fichero temporal queda ahí para el `diff` completo.
 */
const MAX_DIFFERENCES_SHOWN = 20

type Difference =
  | { kind: 'missing'; path: string; value: unknown }
  | { kind: 'extra'; path: string; value: unknown }
  | { kind: 'changed'; path: string; from: unknown; to: unknown }

/**
 * Comprueba que el documento versionado sigue siendo el que genera el código.
 *
 * Solo compara. No reescribe `docs/api/openapi.json` ni toca las rutas: si algo
 * no cuadra, termina con código distinto de cero y cuenta qué no cuadra, y es
 * quien lea el fallo quien decide si lo que hay que actualizar es el documento
 * o lo que se acaba de cambiar en el código.
 */
export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description = `Comprueba que ${OPENAPI_DOCUMENT_PATH} coincide con el documento que genera el código`

  /**
   * Igual que `openapi:generate`: sin arrancar la aplicación no hay rutas
   * registradas y el documento saldría vacío.
   */
  static options: CommandOptions = { startApp: true }

  async run() {
    const generated = await buildOpenApiDocument(this.app)

    /**
     * El documento recién construido se escribe en una ubicación temporal
     * —`tmp/`, que está en el `.gitignore`— y nunca sobre el versionado. Así la
     * comprobación deja algo con lo que hacer un `diff` de verdad sin haber
     * modificado el árbol de trabajo.
     */
    const temporaryPath = this.app.tmpPath('openapi', 'openapi.json')
    await mkdir(dirname(temporaryPath), { recursive: true })
    await writeFile(temporaryPath, generated, 'utf-8')

    const versioned = await this.#readVersionedDocument()
    if (versioned === null) {
      this.logger.error(`no existe ${OPENAPI_DOCUMENT_PATH}`)
      this.logger.log(`  el documento recién generado está en ${this.#relative(temporaryPath)}`)
      this.logger.log('  ejecuta `npm run openapi:generate` para versionarlo')
      this.exitCode = 1
      return
    }

    if (versioned === generated) {
      this.logger.success(`${OPENAPI_DOCUMENT_PATH} está al día`)
      return
    }

    this.logger.error(`${OPENAPI_DOCUMENT_PATH} no coincide con el documento que genera el código`)
    this.#reportDifferences(versioned, generated)
    this.logger.log(`  documento generado: ${this.#relative(temporaryPath)}`)
    this.logger.log(`  documento versionado: ${OPENAPI_DOCUMENT_PATH}`)
    this.logger.log('  si el cambio es intencionado, ejecuta `npm run openapi:generate` y commitea')
    this.exitCode = 1
  }

  /**
   * Devuelve `null` cuando el fichero todavía no existe, que es un caso
   * esperable —nadie ha corrido el generador aún— y no un error del comando.
   */
  async #readVersionedDocument() {
    try {
      return await readFile(openApiDocumentPath(this.app), 'utf-8')
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null
      }
      throw error
    }
  }

  #relative(path: string) {
    return `backend/${this.app.relativePath(path)}`
  }

  /**
   * Explica en qué se diferencian los dos documentos. Compara el JSON ya
   * parseado y no el texto, para que el mensaje hable de rutas y de campos del
   * contrato en vez de números de línea.
   */
  #reportDifferences(versioned: string, generated: string) {
    let parsedVersioned: unknown
    try {
      parsedVersioned = JSON.parse(versioned)
    } catch {
      this.logger.log(`  ${OPENAPI_DOCUMENT_PATH} no es un JSON válido`)
      return
    }

    const differences = describeDifferences(parsedVersioned, JSON.parse(generated))
    if (differences.length === 0) {
      this.logger.log('  el contenido es el mismo, pero el formato del fichero no')
      return
    }

    for (const difference of differences.slice(0, MAX_DIFFERENCES_SHOWN)) {
      this.logger.log(`  ${formatDifference(difference)}`)
    }

    const hidden = differences.length - MAX_DIFFERENCES_SHOWN
    if (hidden > 0) {
      this.logger.log(`  … y ${hidden} diferencia(s) más`)
    }
  }
}

/**
 * Recorre los dos documentos en paralelo y devuelve las diferencias como rutas
 * dentro del JSON (`paths./api/v1/tasks.get.responses`), en el orden en que
 * aparecen. Nombra las cosas desde el punto de vista del fichero versionado:
 * a un campo que el código genera y el fichero no tiene le falta, y a uno que
 * el fichero tiene y el código ya no genera le sobra.
 */
function describeDifferences(versioned: unknown, generated: unknown, path = ''): Difference[] {
  if (Array.isArray(versioned) && Array.isArray(generated)) {
    const differences: Difference[] = []

    for (let index = 0; index < Math.max(versioned.length, generated.length); index++) {
      const childPath = `${path}[${index}]`

      if (index >= versioned.length) {
        differences.push({ kind: 'missing', path: childPath, value: generated[index] })
      } else if (index >= generated.length) {
        differences.push({ kind: 'extra', path: childPath, value: versioned[index] })
      } else {
        differences.push(...describeDifferences(versioned[index], generated[index], childPath))
      }
    }

    return differences
  }

  if (isPlainObject(versioned) && isPlainObject(generated)) {
    const keys = [...new Set([...Object.keys(versioned), ...Object.keys(generated)])]

    return keys.flatMap((key) => {
      const childPath = path === '' ? key : `${path}.${key}`

      if (!(key in versioned)) {
        return [{ kind: 'missing', path: childPath, value: generated[key] } as Difference]
      }
      if (!(key in generated)) {
        return [{ kind: 'extra', path: childPath, value: versioned[key] } as Difference]
      }

      return describeDifferences(versioned[key], generated[key], childPath)
    })
  }

  if (versioned === generated) {
    return []
  }

  return [
    { kind: 'changed', path: path === '' ? '(documento)' : path, from: versioned, to: generated },
  ]
}

function formatDifference(difference: Difference) {
  switch (difference.kind) {
    case 'missing':
      return `falta   ${difference.path}: ${summarize(difference.value)}`
    case 'extra':
      return `sobra   ${difference.path}: ${summarize(difference.value)}`
    case 'changed':
      return `cambia  ${difference.path}: ${summarize(difference.from)} → ${summarize(difference.to)}`
  }
}

/**
 * Un valor cabe en una línea o no se enseña entero: lo que interesa del
 * mensaje es la ruta donde está la diferencia, no volcar medio documento.
 */
function summarize(value: unknown) {
  const serialized = JSON.stringify(value) ?? 'undefined'

  return serialized.length > 60 ? `${serialized.slice(0, 60)}…` : serialized
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
