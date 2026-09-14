/*
|--------------------------------------------------------------------------
| Entrypoint del contrato versionado
|--------------------------------------------------------------------------
|
| Dos modos, `generate` y `check`, sobre `docs/api/openapi.json`.
|
| Esto vivía como dos comandos de ace en `commands/`, que es donde el
| framework los espera, y **rompía la build entera en Linux**: el escáner de
| `commands/` fallaba con `Invalid command exported from "openapi_check.js".
| Invalid URL`, y como cualquier `node ace` escanea ese directorio, se llevaba
| por delante también `node ace test`. En Windows no ocurre.
|
| Se descubrió en CI, no en local, y esa es la única razón por la que se
| descubrió: en local los dos comandos y las 75 pruebas estaban en verde.
|
| Así que el contrato se construye desde su propio entrypoint, con el mismo
| arranque que `bin/console.ts`, y `commands/` vuelve a no existir.
|
*/

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

await import('reflect-metadata')
const { Ignitor, prettyPrintError } = await import('@adonisjs/core')

const APP_ROOT = new URL('../', import.meta.url)
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

const modo = process.argv[2]
if (modo !== 'generate' && modo !== 'check') {
  console.error('Uso: node openapi.js generate|check')
  process.exit(2)
}

const DESTINO = join(fileURLToPath(APP_ROOT), '..', 'docs', 'api', 'openapi.json')

const app = new Ignitor(APP_ROOT, { importer: IMPORTER }).createApp('console')

try {
  await app.init()
  await app.boot()

  // Sin la fase de arranque, el proveedor de OpenAPI no registra los esquemas
  // y el documento sale con `paths` completos y `components.schemas` vacío.
  // Es el mismo modo de fallo que `router.commit()`: bien formado y a medias.
  await app.start(async () => {})

  const { comparar } = await import('#openapi/diff')
  const { construirDocumento, serializar } = await import('#openapi/document')

  const generado = await construirDocumento()
  const contenido = serializar(generado)

  if (modo === 'generate') {
    await mkdir(dirname(DESTINO), { recursive: true })
    await writeFile(DESTINO, contenido, 'utf-8')
    console.log(`docs/api/openapi.json escrito (${contenido.length} bytes)`)
    await app.terminate()
    process.exit(0)
  }

  let versionado: string
  try {
    versionado = await readFile(DESTINO, 'utf-8')
  } catch {
    console.error('docs/api/openapi.json no existe. Ejecuta `npm run openapi:generate`.')
    await app.terminate()
    process.exit(1)
  }

  if (versionado === contenido) {
    console.log('docs/api/openapi.json coincide con el documento generado')
    await app.terminate()
    process.exit(0)
  }

  // Compara el JSON ya parseado y no el texto: si solo cambiara el formato, la
  // lista saldría vacía y el mensaje lo dice en vez de fingir una deriva.
  const diferencias = comparar(JSON.parse(versionado), JSON.parse(JSON.stringify(generado)))

  console.error('docs/api/openapi.json ya no es el contrato que genera el código.')
  if (diferencias.length === 0) {
    console.error('El contenido coincide y el formato no. Ejecuta `npm run openapi:generate`.')
  } else {
    for (const { ruta, motivo } of diferencias.slice(0, 20)) {
      console.error(`  ${ruta} · ${motivo}`)
    }
    if (diferencias.length > 20) {
      console.error(`  ... y ${diferencias.length - 20} más`)
    }
  }
  console.error('Arréglalo con `npm run openapi:generate`. Este comando no arregla nada.')

  await app.terminate()
  process.exit(1)
} catch (error) {
  prettyPrintError(error)
  process.exit(1)
}
