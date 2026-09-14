/**
 * Prueba de `.githooks/commit-msg`: el asunto sigue Conventional Commits.
 *
 * Misma mecánica que `probar-hook-rama.mjs`: un repositorio desechable con
 * `core.hooksPath` apuntando al directorio del proyecto, y un commit por caso
 * esperando el código de salida. Se prueba en Linux, donde Git sí ignora un
 * hook sin bit de ejecución.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HOOKS = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.githooks')

const CASOS = [
  { asunto: 'feat: una cosa nueva', permitido: true },
  { asunto: 'fix(tasks)!: rompe el contrato', permitido: true },
  { asunto: 'docs: un documento', permitido: true },
  { asunto: 'Merge branch feat/otra', permitido: true },
  { asunto: 'Revert "feat: una cosa"', permitido: true },
  { asunto: 'arreglo el bug', permitido: false },
  { asunto: 'Fix: mayúscula en el tipo', permitido: false },
  { asunto: 'feat:sin espacio', permitido: false },
  { asunto: 'wip', permitido: false },
  { asunto: 'update(tasks): tipo que no existe', permitido: false },
]

const repo = mkdtempSync(join(tmpdir(), 'hook-mensaje-'))
const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim()

let fallos = 0
try {
  git('init', '-q')
  git('config', 'user.name', 'prueba')
  git('config', 'user.email', 'prueba@example.com')
  git('config', 'core.hooksPath', HOOKS)
  git('update-ref', 'refs/heads/base', git('commit-tree', git('write-tree'), '-m', 'base'))
  git('checkout', '-q', '-B', 'feat/prueba', 'base')

  for (const { asunto, permitido } of CASOS) {
    const { status } = spawnSync('git', ['commit', '--allow-empty', '-q', '-m', asunto], {
      cwd: repo,
      encoding: 'utf8',
    })
    const aceptado = status === 0
    const bien = aceptado === permitido
    if (!bien) fallos++
    console.log(
      `${bien ? 'OK   ' : 'FALLA'} «${asunto}» · ${aceptado ? 'aceptado' : 'rechazado'}, se esperaba ${permitido ? 'aceptado' : 'rechazado'}`
    )
  }
} finally {
  rmSync(repo, { recursive: true, force: true })
}

if (fallos) {
  console.error(`\n${fallos} de ${CASOS.length} asuntos no se deciden como exige el formato.`)
  process.exit(1)
}
console.log(`\nEl hook de mensaje decide bien en los ${CASOS.length} casos.`)
