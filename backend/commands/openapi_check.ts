import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BaseCommand } from '@adonisjs/core/ace'
import router from '@adonisjs/core/services/router'
import type { CommandOptions } from '@adonisjs/core/types/ace'

import openapi from '@foadonis/openapi/services/main'

/**
 * Compara el documento OpenAPI construido ahora mismo contra el que está
 * versionado en `docs/api/openapi.json`. No escribe ese fichero en ningún
 * caso: si el contrato se movió y el documento no se regeneró, falla y dice
 * en qué se diferencian, para que sea `openapi:generate` quien lo corrija.
 */
export default class OpenapiCheck extends BaseCommand {
  static commandName = 'openapi:check'
  static description = 'Comprueba que docs/api/openapi.json coincide con el documento actual'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const versionedPath = fileURLToPath(new URL('../docs/api/openapi.json', this.app.appRoot))

    let versionedContent: string
    try {
      versionedContent = await readFile(versionedPath, 'utf-8')
    } catch {
      this.logger.error(`No existe ${versionedPath}.`)
      this.logger.error('Corre `node ace openapi:generate` para crearlo.')
      this.exitCode = 1
      return
    }

    router.commit()

    const document = await openapi.buildDocument()
    const freshContent = `${JSON.stringify(document, null, 2)}\n`

    const tmpDir = await mkdtemp(join(tmpdir(), 'flowsync-openapi-'))
    const tmpPath = join(tmpDir, 'openapi.json')

    try {
      await writeFile(tmpPath, freshContent, 'utf-8')

      if (freshContent === versionedContent) {
        this.logger.success('docs/api/openapi.json coincide con el documento actual.')
        return
      }

      this.logger.error('docs/api/openapi.json está desactualizado respecto al documento actual.')
      this.logger.error(`Documento regenerado en ${tmpPath} para contraste.`)
      this.logger.error('')

      const diffs = diffJson(JSON.parse(versionedContent), JSON.parse(freshContent), '$')
      for (const line of diffs) {
        this.logger.error(`  ${line}`)
      }

      this.logger.error('')
      this.logger.error('Corre `node ace openapi:generate` y commitea el diff.')
      this.exitCode = 1
    } finally {
      await rm(tmpDir, { recursive: true, force: true })
    }
  }
}

/**
 * Diff recursivo entre dos valores JSON. Devuelve una línea por cada
 * propiedad añadida, eliminada o cambiada, identificada por su ruta.
 */
function diffJson(versioned: unknown, fresh: unknown, path: string): string[] {
  const versionedIsObject = versioned !== null && typeof versioned === 'object'
  const freshIsObject = fresh !== null && typeof fresh === 'object'

  if (!versionedIsObject || !freshIsObject) {
    if (versioned === fresh) return []
    return [`${path}: ${JSON.stringify(versioned)} → ${JSON.stringify(fresh)}`]
  }

  if (Array.isArray(versioned) !== Array.isArray(fresh)) {
    return [`${path}: ${JSON.stringify(versioned)} → ${JSON.stringify(fresh)}`]
  }

  const versionedRecord = versioned as Record<string, unknown>
  const freshRecord = fresh as Record<string, unknown>

  const keys = Array.isArray(versioned)
    ? Array.from({ length: Math.max(versioned.length, (fresh as unknown[]).length) }, (_, index) =>
        String(index)
      )
    : [...new Set([...Object.keys(versionedRecord), ...Object.keys(freshRecord)])].sort()

  const diffs: string[] = []
  for (const key of keys) {
    const hasVersioned = key in versionedRecord
    const hasFresh = key in freshRecord

    if (!hasVersioned) {
      diffs.push(`${path}.${key}: (no existía) → ${JSON.stringify(freshRecord[key])}`)
    } else if (!hasFresh) {
      diffs.push(`${path}.${key}: ${JSON.stringify(versionedRecord[key])} → (ya no existe)`)
    } else {
      diffs.push(...diffJson(versionedRecord[key], freshRecord[key], `${path}.${key}`))
    }
  }
  return diffs
}
