import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  DOCUMENT_REPO_PATH,
  buildDocument,
  describeDifferences,
  documentPath,
  serializeDocument,
} from '#services/openapi_document'

/**
 * Número de diferencias que se enumeran antes de resumir el resto. Un cambio
 * en un sitio muy alto del documento puede generar cientos y la salida dejaría
 * de decir nada.
 */
const MAX_LISTED_DIFFERENCES = 40

export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description = `Regenera el documento OpenAPI en una ubicación temporal y lo compara con ${DOCUMENT_REPO_PATH}`

  /**
   * Igual que `openapi:generate`: el documento sale del router.
   */
  static options: CommandOptions = { startApp: true }

  /**
   * Esta comprobación no arregla nada. Solo escribe en el directorio temporal
   * que crea aquí; nunca en `DOCUMENT_REPO_PATH`.
   */
  async run() {
    const regenerated = serializeDocument(await buildDocument())

    const scratchDir = await mkdtemp(join(tmpdir(), 'flowsync-openapi-'))
    const scratchFile = join(scratchDir, 'openapi.json')
    await writeFile(scratchFile, regenerated, 'utf-8')

    let versioned: string
    try {
      versioned = await readFile(documentPath(), 'utf-8')
    } catch {
      this.fail([
        `No existe ${DOCUMENT_REPO_PATH}. El documento regenerado está en ${scratchFile}.`,
        'Ejecuta `npm run openapi:generate` y commitea el fichero.',
      ])
      return
    }

    if (versioned === regenerated) {
      await rm(scratchDir, { recursive: true, force: true })
      this.logger.success(`${DOCUMENT_REPO_PATH} coincide con el documento regenerado`)
      return
    }

    this.fail([
      `${DOCUMENT_REPO_PATH} no coincide con el documento regenerado.`,
      ...this.explain(versioned, regenerated),
      '',
      `Documento regenerado: ${scratchFile}`,
      'Para actualizar el versionado: `npm run openapi:generate`.',
    ])
  }

  /**
   * Explica la diferencia. Si los dos documentos son equivalentes como JSON,
   * lo que ha cambiado es cómo está escrito el fichero, no el contrato.
   */
  private explain(versioned: string, regenerated: string): string[] {
    let differences: string[]
    try {
      differences = describeDifferences(JSON.parse(versioned), JSON.parse(regenerated))
    } catch {
      return [
        '',
        `${DOCUMENT_REPO_PATH} no es JSON válido, así que no se puede comparar campo a campo.`,
      ]
    }

    if (differences.length === 0) {
      return [
        '',
        'El contenido es equivalente: lo que no coincide es el formato o el orden de las claves.',
      ]
    }

    const listed = differences.slice(0, MAX_LISTED_DIFFERENCES).map((line) => `  · ${line}`)
    const rest = differences.length - listed.length

    return [
      '',
      `${differences.length} ${differences.length === 1 ? 'diferencia' : 'diferencias'}:`,
      ...listed,
      ...(rest > 0 ? [`  · … y ${rest} más`] : []),
    ]
  }

  private fail(lines: string[]) {
    this.exitCode = 1
    this.logger.error(lines.join('\n'))
  }
}
