/**
 * R-08: un bug no se cierra sin dejar una prueba detrás.
 *
 * La mitad de la regla que es computable: un commit `fix:` que no toca ningún
 * fichero de prueba se detecta leyendo el propio commit. La otra mitad
 * -reproducirlo en E2E antes de arreglarlo- no deja rastro y sigue siendo
 * criterio.
 *
 * Hay arreglos cuya prueba no es un fichero: el de una comprobación del
 * verificador se prueba mutando el código y viendo el rojo. Para esos, el
 * mensaje lleva una línea `Sin-prueba: <motivo>`. Con motivo: una línea vacía
 * no excusa, porque «sin prueba» a secas es exactamente lo que la regla
 * persigue.
 *
 * Uso: node scripts/fix-con-prueba.mjs <argumentos de git rev-list>
 *      node scripts/fix-con-prueba.mjs antes..despues
 */
import { execFileSync } from 'node:child_process'

const ES_FIX = /^fix(\([^)]*\))?!?:/
const SIN_PRUEBA = /^Sin-prueba:[ \t]*\S/m
// El verificador cuenta: sus comprobaciones son pruebas de que la
// documentación y el contrato siguen al código, y un arreglo que le añade una
// deja algo que vuelve a fallar si el defecto regresa.
const ES_PRUEBA = [
  /^backend\/tests\/.+\.spec\.ts$/,
  /^frontend\/src\/.+\.test\.tsx?$/,
  /^scripts\/probar-.+\.mjs$/,
  /^scripts\/verificar-docs\.mjs$/,
]

const rango = process.argv.slice(2)
if (!rango.length) {
  console.error('Uso: node scripts/fix-con-prueba.mjs <argumentos de git rev-list>')
  process.exit(2)
}

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

const shas = git('rev-list', '--no-merges', ...rango)
  .split('\n')
  .filter(Boolean)

let arreglos = 0
const sinPrueba = []
for (const sha of shas) {
  const mensaje = git('log', '-1', '--format=%B', sha)
  const asunto = mensaje.split('\n')[0]
  if (!ES_FIX.test(asunto)) continue
  arreglos++

  const ficheros = git('diff-tree', '--root', '--no-commit-id', '--name-only', '-r', sha)
    .split('\n')
    .filter(Boolean)
  const pruebas = ficheros.filter((f) => ES_PRUEBA.some((patron) => patron.test(f)))

  if (pruebas.length) {
    console.log(`OK    ${sha.slice(0, 7)} ${asunto} · ${pruebas.join(', ')}`)
  } else if (SIN_PRUEBA.test(mensaje)) {
    console.log(`OK    ${sha.slice(0, 7)} ${asunto} · ${mensaje.match(SIN_PRUEBA)[0]}`)
  } else {
    console.log(`FALLA ${sha.slice(0, 7)} ${asunto} · no toca ninguna prueba`)
    sinPrueba.push(sha)
  }
}

if (sinPrueba.length) {
  console.error(
    `\n${sinPrueba.length} de ${arreglos} commits fix: no dejan prueba ni dicen por qué (R-08).` +
      '\nSi la prueba no es un fichero, añade al mensaje una línea «Sin-prueba: <motivo>».'
  )
  process.exit(1)
}
console.log(
  `\n${arreglos} commits fix: en ${shas.length} revisados, todos con prueba o con motivo.`
)
