import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import {
  buildOpenApiDocument,
  scratchDocumentPath,
  serializeOpenApiDocument,
  versionedDocumentPath,
} from '#openapi/document'
import { diffDocuments, formatDifference } from '#openapi/diff'

/** Cuántas diferencias se enumeran antes de resumir el resto. */
const MAX_REPORTED_DIFFERENCES = 20

/**
 * Comprueba que `docs/api/openapi.json` sigue siendo el documento que el código
 * genera hoy.
 *
 * Regenera en `backend/tmp/openapi/openapi.json` y compara. **Solo compara**:
 * no reescribe el fichero versionado ni toca las rutas. Si difieren sale con
 * código 1 y enumera las diferencias por ruta JSON; arreglarlo es ejecutar
 * `openapi:generate`, que es una decisión de quien lee el fallo.
 */
export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description = 'Comprueba que docs/api/openapi.json coincide con el documento generado'

  static options: CommandOptions = { startApp: true }

  async run() {
    const document = await buildOpenApiDocument()
    const regenerated = serializeOpenApiDocument(document)

    const scratchPath = scratchDocumentPath(this.app)
    await mkdir(dirname(scratchPath), { recursive: true })
    await writeFile(scratchPath, regenerated, 'utf-8')

    const path = versionedDocumentPath(this.app)
    const versionedPath = relative(process.cwd(), path)
    let versioned: string

    try {
      versioned = await readFile(path, 'utf-8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }

      this.#fail([
        `no existe ${versionedPath}.`,
        `El documento recién generado está en ${relative(process.cwd(), scratchPath)}.`,
        'Ejecuta `npm run openapi:generate` para versionarlo.',
      ])

      return
    }

    if (versioned === regenerated) {
      this.logger.success(`${versionedPath} coincide con el documento generado`)

      return
    }

    this.#reportDifferences(versioned, regenerated, versionedPath, scratchPath)
  }

  /**
   * Explica en qué se diferencian los dos documentos. Se comparan los dos ya
   * parseados —y no los objetos en memoria— porque lo que hay que explicar es
   * la diferencia entre los dos ficheros, incluida la que solo existe en el
   * texto.
   */
  #reportDifferences(
    versioned: string,
    regenerated: string,
    versionedPath: string,
    scratchPath: string
  ): void {
    const lines = [`${versionedPath} no coincide con el documento generado.`]
    let parsed: unknown

    try {
      parsed = JSON.parse(versioned)
    } catch (error) {
      this.#fail([
        `${versionedPath} no es JSON válido: ${(error as Error).message}.`,
        `Compáralo con ${relative(process.cwd(), scratchPath)} o regenéralo con \`npm run openapi:generate\`.`,
      ])

      return
    }

    const differences = diffDocuments(parsed, JSON.parse(regenerated))

    if (differences.length === 0) {
      // Mismo documento, distinto texto: indentación, orden de claves o el
      // salto final. El contrato no ha cambiado, pero el fichero no es el que
      // sale de `openapi:generate` y hay que dejarlo como tal.
      lines.push(
        'El contenido es el mismo, pero el fichero no está serializado como lo escribe `openapi:generate`.'
      )
    } else {
      lines.push(
        `${differences.length} ${differences.length === 1 ? 'diferencia' : 'diferencias'}:`
      )

      for (const difference of differences.slice(0, MAX_REPORTED_DIFFERENCES)) {
        lines.push(`  - ${formatDifference(difference)}`)
      }

      const remaining = differences.length - MAX_REPORTED_DIFFERENCES
      if (remaining > 0) {
        lines.push(`  … y ${remaining} más.`)
      }
    }

    lines.push(
      `Documento generado en ${relative(process.cwd(), scratchPath)}; el versionado no se ha tocado.`,
      'Si el cambio es intencionado, ejecuta `npm run openapi:generate` y commitea el resultado.'
    )

    this.#fail(lines)
  }

  /**
   * Deja el mensaje en consola y el proceso con código distinto de cero. El
   * comando no arregla nada: informar y fallar es todo lo que hace.
   */
  #fail(lines: string[]): void {
    this.logger.error(lines[0])

    for (const line of lines.slice(1)) {
      this.logger.log(line)
    }

    this.exitCode = 1
  }
}
