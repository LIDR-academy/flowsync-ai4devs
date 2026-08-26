#!/usr/bin/env node
/**
 * Contrasta la documentación viva contra el código.
 *
 * No genera nada: comprueba. La diferencia importa, porque un generador
 * produce documentos que nadie lee y que quedan bien aunque el código haga
 * otra cosa; esto falla cuando el documento y el código dejan de coincidir,
 * que es el único momento en que el documento importa.
 *
 * Se ejecuta con `node scripts/verificar-docs.mjs` y en CI. Sale con código 1
 * si encuentra una discrepancia, para que rompa la build en vez de avisar en un
 * log que nadie mira.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const problemas = []
const comprobaciones = []

const leer = (ruta) => readFileSync(join(RAIZ, ruta), 'utf8')

function comprobar(nombre, fn) {
  try {
    const detalle = fn()
    comprobaciones.push({ nombre, ok: true, detalle })
  } catch (error) {
    comprobaciones.push({ nombre, ok: false, detalle: error.message })
    problemas.push(`${nombre}: ${error.message}`)
  }
}

/**
 * Las rutas declaradas en el código, reconstruidas desde `start/routes.ts`.
 *
 * Se leen los grupos con su prefijo en lugar de buscar cadenas sueltas: una
 * ruta vive en el prefijo de su grupo tanto como en su propia línea, y
 * ignorarlo daría por buena una ruta que en realidad cuelga de otro sitio.
 */
function rutasDelCodigo() {
  const fuente = leer('backend/start/routes.ts')
  const rutas = new Set()

  // `.prefix()` aparece DESPUES del cuerpo de su grupo, asi que las rutas se
  // acumulan en un buffer y se vuelcan cuando aparece el prefijo al que
  // pertenecen. Leerlo linea a linea asignando el ultimo prefijo visto colgaria
  // cada grupo del prefijo del grupo anterior.
  let pendientes = []

  for (const linea of fuente.split('\n')) {
    const ruta = linea.match(/router\.(get|post|patch|put|delete)\('([^']*)'/)
    if (ruta) {
      const [, metodo, camino] = ruta
      // La raiz de cortesia no es parte de la API.
      if (!(camino === '/' && !/controllers\./.test(linea))) {
        pendientes.push({ metodo: metodo.toUpperCase(), camino })
      }
      continue
    }

    const prefijo = linea.match(/\.prefix\('([^']+)'\)/)
    if (prefijo && !prefijo[1].startsWith('/api') && pendientes.length) {
      for (const { metodo, camino } of pendientes) {
        rutas.add(`${metodo} ${prefijo[1]}${camino === '/' ? '' : `/${camino}`}`)
      }
      pendientes = []
    }
  }

  return rutas
}

/**
 * Las rutas declaradas en el contrato. Se leen del YAML con expresiones
 * regulares y no con un parser: no se quiere añadir una dependencia solo para
 * esto, y la forma del documento la controlamos nosotros.
 */
function rutasDelContrato() {
  const fuente = leer('docs/api/openapi.yaml')
  const rutas = new Set()
  let rutaActual = null

  for (const linea of fuente.split('\n')) {
    const ruta = linea.match(/^ {2}(\/[^:]*):\s*$/)
    if (ruta) {
      rutaActual = ruta[1]
      continue
    }
    const metodo = linea.match(/^ {4}(get|post|patch|put|delete):\s*$/)
    if (metodo && rutaActual) rutas.add(`${metodo[1].toUpperCase()} ${rutaActual}`)
  }

  return rutas
}

comprobar('El contrato cubre exactamente las rutas del código', () => {
  const codigo = rutasDelCodigo()
  const contrato = rutasDelContrato()

  const esperadas = new Set(
    [...codigo].map((entrada) => {
      const [metodo, camino] = entrada.split(' ')
      const final = `/api/v1/${camino}`.replace(/:(\w+)/g, '{$1}').replace(/\/+/g, '/')
      return `${metodo} ${final}`
    })
  )

  const faltan = [...esperadas].filter((r) => !contrato.has(r))
  const sobran = [...contrato].filter((r) => !esperadas.has(r))

  if (faltan.length) throw new Error(`sin documentar: ${faltan.join(', ')}`)
  if (sobran.length) throw new Error(`documentadas pero inexistentes: ${sobran.join(', ')}`)

  return `${esperadas.size} operaciones`
})

comprobar('Los estados del contrato son los del dominio', () => {
  const modelo = leer('backend/app/models/task.ts')
  const declarados = [...modelo.matchAll(/TASK_STATUSES = \[([^\]]+)\]/g)]
  if (!declarados.length) throw new Error('no se encuentra TASK_STATUSES en el modelo')

  const estados = [...declarados[0][1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  const contrato = leer('docs/api/openapi.yaml')
  const enum_ = contrato.match(/enum: \[([^\]]+)\]/)
  if (!enum_) throw new Error('el contrato no declara el enum de estados')

  const documentados = enum_[1].split(',').map((s) => s.trim())
  const iguales =
    estados.length === documentados.length && estados.every((e) => documentados.includes(e))

  if (!iguales) {
    throw new Error(`código [${estados}] frente a contrato [${documentados}]`)
  }
  return estados.join(', ')
})

comprobar('El responsable no expone la cuenta', () => {
  const transformer = leer('backend/app/transformers/task_assignee_transformer.ts')
  const campos = transformer.match(/this\.pick\(this\.resource, \[([^\]]+)\]\)/)
  if (!campos) throw new Error('no se encuentra la lista de campos del responsable')

  if (/'email'/.test(campos[1])) {
    throw new Error('el transformer del responsable incluye el email')
  }

  // Y que la lista lo use a él, que es donde estuvo el fallo.
  const lista = leer('backend/app/transformers/task_transformer.ts')
  if (!/TaskAssigneeTransformer/.test(lista)) {
    throw new Error('la lista no construye el responsable con TaskAssigneeTransformer')
  }
  return campos[1].replace(/['\s]/g, '')
})

comprobar('Las pruebas no pueden escribir sobre la base de desarrollo', () => {
  const config = leer('backend/config/database.ts')
  if (!/app\.inTest/.test(config)) {
    throw new Error('config/database.ts no elige el fichero según el entorno (ADR-0001)')
  }
  const entrypoint = leer('backend/bin/test.ts')
  if (!/process\.env\.NODE_ENV = 'test'/.test(entrypoint)) {
    throw new Error('bin/test.ts no fuerza NODE_ENV=test')
  }
  return 'db-test.sqlite3 en test, db.sqlite3 fuera'
})

comprobar('Los documentos vivos existen', () => {
  const obligatorios = [
    'docs/arquitectura.md',
    'docs/trazabilidad.md',
    'docs/api/openapi.yaml',
    'docs/adr/0001-aislamiento-de-la-base-de-datos-en-pruebas.md',
    'openspec/specs/auth/spec.md',
    'openspec/specs/tasks/spec.md',
  ]
  const ausentes = obligatorios.filter((r) => !existsSync(join(RAIZ, r)))
  if (ausentes.length) throw new Error(`faltan: ${ausentes.join(', ')}`)
  return `${obligatorios.length} documentos`
})

for (const { nombre, ok, detalle } of comprobaciones) {
  console.log(`${ok ? 'OK  ' : 'FALLA'}  ${nombre}${detalle ? ` · ${detalle}` : ''}`)
}

if (problemas.length) {
  console.error(`\n${problemas.length} discrepancia(s) entre la documentación y el código.`)
  process.exit(1)
}

console.log('\nLa documentación corresponde con el código.')
