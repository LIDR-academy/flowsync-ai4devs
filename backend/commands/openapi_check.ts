import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { buildDocument, serializeDocument, versionedDocumentPath } from '#openapi/document'
import { describeDifference, diffDocuments, type JsonValue } from '#openapi/diff'

/**
 * Comprueba que `docs/api/openapi.json` sigue siendo lo que el código produce.
 *
 * Regenera el documento en `tmp/openapi/openapi.json` —ignorado por git— y lo
 * compara con el versionado. **Solo compara**: no reescribe el fichero
 * versionado ni toca las rutas. Si difieren, sale con código 1 enumerando las
 * diferencias por ruta JSON.
 */
export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description =
    'Comprueba que docs/api/openapi.json coincide con el documento que genera el código'

  static options: CommandOptions = {
    startApp: true,
  }

  /**
   * Tope de diferencias impresas. Si el documento versionado está muy atrasado
   * la lista entera no cabe en pantalla y las primeras ya cuentan la historia.
   */
  static maxDifferencesShown = 40

  #fail(message: string) {
    this.exitCode = 1
    this.logger.error(message)
  }

  async run() {
    const versionedPath = versionedDocumentPath(this.app)
    const shown = relative(this.app.makePath('..'), versionedPath)

    /**
     * El documento recién generado se escribe aparte, en tmp, por dos motivos:
     * queda a mano para inspeccionarlo o diffearlo cuando la comprobación
     * falla, y deja claro que este comando nunca escribe en el versionado.
     */
    const generatedContents = serializeDocument(await buildDocument(this.app))
    const regeneratedPath = this.app.tmpPath('openapi', 'openapi.json')

    await mkdir(dirname(regeneratedPath), { recursive: true })
    await writeFile(regeneratedPath, generatedContents, 'utf-8')

    const versionedContents = await readFile(versionedPath, 'utf-8').catch(() => null)

    if (versionedContents === null) {
      this.#fail(
        `No existe ${shown}. El contrato de la API tiene que estar versionado: ejecuta "npm run openapi:generate" y commitea el fichero.`
      )
      return
    }

    if (versionedContents === generatedContents) {
      this.logger.success(`${shown} coincide con el documento que genera el código`)
      return
    }

    let versionedDocument: JsonValue

    try {
      versionedDocument = JSON.parse(versionedContents)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)

      this.#fail(
        `${shown} no es JSON válido (${reason}). Regenéralo con "npm run openapi:generate".`
      )
      return
    }

    const differences = diffDocuments(versionedDocument, JSON.parse(generatedContents))

    if (differences.length === 0) {
      /**
       * Mismo contenido, distintos bytes: alguien editó el fichero a mano o lo
       * pasó por otro formateador. Se reporta igual, porque el próximo
       * `openapi:generate` movería el fichero sin que cambie el contrato.
       */
      this.#fail(
        `${shown} tiene el mismo contenido pero no está serializado como lo escribe "npm run openapi:generate" (dos espacios de sangrado y salto de línea final). Regenéralo.`
      )
      return
    }

    this.#fail(
      `${shown} no coincide con el documento que genera el código: ${differences.length} ${
        differences.length === 1 ? 'diferencia' : 'diferencias'
      }.`
    )

    for (const difference of differences.slice(0, OpenapiCheck.maxDifferencesShown)) {
      this.logger.log(`  ${describeDifference(difference)}`)
    }

    const hidden = differences.length - OpenapiCheck.maxDifferencesShown

    if (hidden > 0) {
      this.logger.log(`  … y ${hidden} más`)
    }

    this.logger.log('')
    this.logger.log(
      `  Versionado: ${shown}    Recién generado: ${relative(this.app.makePath('..'), regeneratedPath)}`
    )
    this.logger.log('  Si el cambio del contrato es intencionado: "npm run openapi:generate".')
  }
}
