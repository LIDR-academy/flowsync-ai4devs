/**
 * Hook PostToolUse: formatea con Prettier el fichero de `frontend/` que Claude
 * acaba de escribir o editar.
 *
 * Se resuelve con Node en vez de `jq` + shell a propósito: Node ya es
 * dependencia obligatoria del proyecto, así que el hook funciona en cualquier
 * máquina capaz de arrancar FlowSync, Windows incluido, sin instalar nada más.
 *
 * Nunca falla hacia fuera: cualquier error se traga y se sale con 0, para que
 * un problema de formateo no bloquee el trabajo.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const frontendDir = path.join(projectDir, 'frontend')
const prettierBin = path.join(frontendDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs')

function readStdin() {
  return new Promise((resolve) => {
    let raw = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (raw += chunk))
    process.stdin.on('end', () => resolve(raw))
    process.stdin.on('error', () => resolve(''))
  })
}

function isInsideFrontend(filePath) {
  const relative = path.relative(frontendDir, filePath)
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
}

const payload = await readStdin()

let filePath = ''
try {
  const event = JSON.parse(payload)
  filePath = event?.tool_response?.filePath ?? event?.tool_input?.file_path ?? ''
} catch {
  // Payload vacío o no-JSON: no hay nada que formatear.
}

if (filePath && existsSync(prettierBin)) {
  const resolved = path.resolve(filePath)
  if (isInsideFrontend(resolved) && existsSync(resolved)) {
    spawnSync(process.execPath, [prettierBin, '--write', '--ignore-unknown', resolved], {
      cwd: frontendDir,
      stdio: 'ignore',
    })
  }
}

process.exit(0)
