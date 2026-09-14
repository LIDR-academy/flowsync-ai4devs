/**
 * El número de pruebas que dice CLAUDE.md, contra el que da el runner.
 *
 * El recuento estuvo copiado en seis documentos y cada prueba nueva obligaba a
 * tocarlos todos a mano; ninguna comprobación lo miraba. Ahora vive solo en
 * CLAUDE.md, y esto lo contrasta con la salida real de Japa o de Vitest.
 *
 * No se cuenta leyendo los ficheros: un `test(` con el título en la línea
 * siguiente, o uno generado en un bucle, no casa con ninguna expresión
 * regular razonable. Contado así daba 82 cuando Japa ejecuta 84.
 *
 * Uso: node scripts/recuento-pruebas.mjs backend|frontend <salida del runner>
 */
import { appendFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const [lado, fichero] = process.argv.slice(2)
if (!['backend', 'frontend'].includes(lado) || !fichero) {
  console.error('Uso: node scripts/recuento-pruebas.mjs backend|frontend <salida del runner>')
  process.exit(2)
}

const sinColor = (texto) => texto.replace(/\x1b\[[0-9;]*m/g, '')
const salida = sinColor(readFileSync(fichero, 'utf8'))
const claude = readFileSync(join(RAIZ, 'CLAUDE.md'), 'utf8')

/**
 * En CI, el resultado va también al resumen del job: un número que solo está
 * en el log no lo lee nadie que mire el PR.
 */
function resumir(linea) {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${linea}\n`)
}

function fallar(mensaje) {
  console.error(`recuento de pruebas (${lado}): ${mensaje}`)
  resumir(`**Pruebas de ${lado}: en rojo.** ${mensaje}`)
  process.exit(1)
}

// Japa y Vitest cierran igual: «Tests  84 passed (84)», con el total entre
// paréntesis aunque haya fallos u omitidas.
const resumen = salida.match(/Tests\s+[^\n(]*\((\d+)\)/)
if (!resumen) fallar('la salida del runner no trae la línea de resumen «Tests ... (N)»')
const ejecutadas = Number(resumen[1])

// Los números de un desglose, sin los identificadores de hallazgo (H-05).
const partes = (texto) => (texto.replace(/H-\d+/g, '').match(/\b\d+\b/g) ?? []).map(Number)
function cuadra(n, texto, que) {
  const sumandos = partes(texto)
  const suma = sumandos.reduce((a, b) => a + b, 0)
  if (suma !== n) {
    fallar(`CLAUDE.md dice ${n} ${que} pero su desglose suma ${suma} (${sumandos.join(' + ')})`)
  }
}

let citadas
if (lado === 'backend') {
  // Dos niveles: el total se parte en suites, y cada suite en su desglose.
  // Los tres cuadran, o una prueba añadida sin tocar el desglose pasaría.
  const total = claude.match(/Hoy hay \*\*(\d+) pruebas\*\*: ([^.]*)\./)
  if (!total) fallar('CLAUDE.md ya no dice «Hoy hay **N pruebas**: <suites>.»')
  citadas = Number(total[1])
  cuadra(citadas, total[2], 'pruebas')

  for (const suite of ['functional', 'unit']) {
    const frase = claude.match(new RegExp(String.raw`Las (\d+) ${suite}[^:]*: ([^.]*)\.`))
    if (!frase) fallar(`CLAUDE.md ya no dice «Las N ${suite}: <desglose>.»`)
    cuadra(Number(frase[1]), frase[2], suite)
  }
} else {
  const frase = claude.match(/\*\*Vitest\*\* \(`npm test`\): (\d+) pruebas/)
  if (!frase) fallar('CLAUDE.md ya no dice «**Vitest** (`npm test`): N pruebas»')
  citadas = Number(frase[1])
}

if (citadas !== ejecutadas) {
  fallar(`CLAUDE.md dice ${citadas} y el runner ejecutó ${ejecutadas}. Actualiza CLAUDE.md.`)
}
console.log(
  `recuento de pruebas (${lado}): CLAUDE.md dice ${citadas}, el runner ejecutó ${ejecutadas}`
)
resumir(`**Pruebas de ${lado}: ${ejecutadas} ejecutadas**, y CLAUDE.md dice las mismas.`)
