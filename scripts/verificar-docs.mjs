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

/**
 * Lee un fichero con los comentarios fuera.
 *
 * No es cosmética. La revisión adversarial del PR #21 demostró que cuatro de
 * estas comprobaciones se satisfacían con un comentario: bastaba dejar la
 * palabra `TaskAssigneeTransformer` en un JSDoc, o `app.inTest` en una nota,
 * para que el verificador diera luz verde sobre código que hacía lo contrario.
 *
 * Una comprobación que un comentario puede satisfacer no comprueba nada.
 */
const leerCodigo = (ruta) =>
  leer(ruta)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')

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
  const fuente = leerCodigo('backend/start/routes.ts')
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

  // Lo que quede sin volcar cuelga directamente del grupo externo. Descartarlo
  // -que es lo que hacia antes- dejaba pasar sin documentar cualquier ruta que
  // no estuviera dentro de un subgrupo con prefijo propio.
  for (const { metodo, camino } of pendientes) {
    rutas.add(`${metodo} ${camino === '/' ? '' : camino}`)
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

comprobar('La regla de vencimiento comprueba sus tres condiciones', () => {
  const modelo = leerCodigo('backend/app/models/task.ts')
  const metodo = modelo.match(/isOverdueOn\(referenceDay: string\): boolean \{([\s\S]*?)\n {2}\}/)
  if (!metodo) throw new Error('no se encuentra isOverdueOn en el modelo')

  const cuerpo = metodo[1]
  // Cada condición tiene que estar en una guarda que devuelva o en el retorno,
  // no meramente presente: una constante muerta con la comparación dentro
  // satisfacía la versión anterior de esta comprobación.
  const condiciones = [
    ['tiene fecha', /if\s*\([^)]*dueDate === null[^)]*\)\s*return/],
    ['no esta hecha', /if\s*\([^)]*status === 'done'[^)]*\)\s*return/],
    ['la fecha ha pasado', /return[^\n]*dueDate\s*<\s*referenceDay/],
  ]

  const ausentes = condiciones.filter(([, patron]) => !patron.test(cuerpo)).map(([n]) => n)
  if (ausentes.length) throw new Error(`condicion(es) que faltan: ${ausentes.join(', ')}`)

  // El `<` estricto: vencer hoy todavia no es estar vencida. Un `<=` no rompe
  // nada ruidosamente y no lo ve ni el lint ni el tipo.
  if (/dueDate\s*<=\s*referenceDay/.test(cuerpo)) {
    throw new Error('la comparacion es <=, y debe ser estricta')
  }
  return 'tres condiciones y comparacion estricta'
})

comprobar('La tabla de rutas de CLAUDE.md corresponde con el código', () => {
  // CLAUDE.md promete literalmente que este script comprueba esa tabla, y no la
  // comprobaba. Es el fichero que lee primero quien llega al repositorio.
  const documentadas = new Set(
    [...leer('CLAUDE.md').matchAll(/^\|\s*(GET|POST|PATCH|PUT|DELETE)\s*\|\s*`([^`]+)`/gm)].map(
      (m) => `${m[1]} ${m[2]}`
    )
  )
  if (!documentadas.size) throw new Error('no se encuentra la tabla de rutas en CLAUDE.md')

  const esperadas = new Set(
    [...rutasDelCodigo()].map((entrada) => {
      const [metodo, camino] = entrada.split(' ')
      return `${metodo} ${`/api/v1/${camino}`.replace(/\/+/g, '/')}`
    })
  )

  const faltan = [...esperadas].filter((r) => !documentadas.has(r))
  const sobran = [...documentadas].filter((r) => !esperadas.has(r))
  if (faltan.length) throw new Error(`sin documentar en CLAUDE.md: ${faltan.join(', ')}`)
  if (sobran.length) throw new Error(`en CLAUDE.md pero inexistentes: ${sobran.join(', ')}`)

  return `${esperadas.size} rutas`
})

comprobar('Toda operación que resuelve un id documenta su 404', () => {
  // La spec exige 404 en tres escenarios y el contrato no documentaba ninguno,
  // así que quien integre contra él no sabría que existe.
  const contrato = leer('docs/api/openapi.yaml')
  const conFindOrFail = ['tasks_controller.ts', 'task_statuses_controller.ts', 'task_due_dates_controller.ts']
    .filter((f) => /findOrFail/.test(leerCodigo(`backend/app/controllers/${f}`)))

  if (!conFindOrFail.length) return 'ningún controlador resuelve un id'

  const operacionesConId = (contrato.match(/^ {2}\/api\/v1\/tasks\/\{id\}/gm) || []).length
  const cuatrocientosCuatro = (contrato.match(/"404":/g) || []).length

  if (!cuatrocientosCuatro) {
    throw new Error(
      `${conFindOrFail.length} controladores usan findOrFail y el contrato no documenta ningún 404`
    )
  }
  if (cuatrocientosCuatro < operacionesConId) {
    throw new Error(
      `${operacionesConId} rutas con id y solo ${cuatrocientosCuatro} documentan el 404`
    )
  }
  return `${cuatrocientosCuatro} operaciones con 404`
})

comprobar('El filtro de la lista solo admite estados del dominio', () => {
  const validador = leer('backend/app/validators/task.ts')
  const lista = validador.match(/listTasksValidator = vine\.create\(\{([\s\S]*?)\}\)/)
  if (!lista) throw new Error('no se encuentra listTasksValidator')

  if (!/vine\.enum\(TASK_STATUSES\)/.test(lista[1])) {
    throw new Error(
      'status no esta acotado al enum: un estado inventado saldria como lista vacia con 200'
    )
  }
  return 'vine.enum(TASK_STATUSES)'
})

comprobar('El responsable no expone la cuenta', () => {
  const transformer = leerCodigo('backend/app/transformers/task_assignee_transformer.ts')
  const campos = transformer.match(/this\.pick\(this\.resource, \[([^\]]+)\]\)/)
  if (!campos) throw new Error('no se encuentra la lista de campos del responsable')

  if (/'email'|'password'/.test(campos[1])) {
    throw new Error('el transformer del responsable incluye datos de la cuenta')
  }

  // Y que la lista lo CONSTRUYA con él, no que lo mencione. Antes bastaba con
  // que la palabra apareciera en un comentario para dar luz verde.
  const lista = leerCodigo('backend/app/transformers/task_transformer.ts')
  if (!/assignee:\s*TaskAssigneeTransformer\.transform\(/.test(lista)) {
    throw new Error('la lista no construye el responsable con TaskAssigneeTransformer')
  }
  if (/UserTransformer/.test(lista)) {
    throw new Error('la lista vuelve a usar UserTransformer, que expone la cuenta')
  }
  return campos[1].replace(/['\s]/g, '')
})

comprobar('Las pruebas no pueden escribir sobre la base de desarrollo', () => {
  const config = leerCodigo('backend/config/database.ts')

  // El fichero tiene que salir de una expresión que dependa del entorno, y ese
  // valor tiene que ser el que recibe `tmpPath`. Comprobar solo que la cadena
  // `app.inTest` aparece en el fichero lo satisfacía un comentario, y comprobar
  // solo que existe `db-test.sqlite3` lo satisfacía una constante muerta.
  const eleccion = config.match(/const\s+(\w+)\s*=\s*app\.inTest\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/)
  if (!eleccion) {
    throw new Error('config/database.ts no elige el fichero según el entorno (ADR-0001)')
  }
  const [, variable, enTest, fuera] = eleccion
  if (enTest === fuera) {
    throw new Error('el fichero de test y el de desarrollo son el mismo')
  }
  if (!new RegExp(`filename:\\s*app\\.tmpPath\\(${variable}\\)`).test(config)) {
    throw new Error(`la conexión no usa \`${variable}\`, así que la elección no llega a aplicarse`)
  }

  const entrypoint = leerCodigo('backend/bin/test.ts')
  if (!/process\.env\.NODE_ENV = 'test'/.test(entrypoint)) {
    throw new Error('bin/test.ts no fuerza NODE_ENV=test')
  }

  // La garantía de verdad es `tests/functional/aislamiento.spec.ts`, que
  // pregunta a la conexión viva por su fichero. Esto es el aviso temprano.
  return `${enTest} en test, ${fuera} fuera`
})

comprobar('Los documentos que el README enlaza existen', () => {
  // Se derivan de los enlaces del README y no de una lista escrita a mano:
  // una lista a mano no falla cuando el README enlaza algo que no esta.
  const readme = leer('README.md')
  // Se aceptan los enlaces con ancla y los que empiezan por `./`. Descartarlos
  // -que es lo que hacía antes- dejaba pasar enlaces rotos de esas dos formas.
  const enlaces = [...readme.matchAll(/\]\((?!https?:|#|mailto:)([^)]+)\)/g)]
    .map((m) => m[1].split('#')[0].trim())
    .filter(Boolean)
    .map((ruta) => ruta.replace(/^\.\//, ''))

  const ausentes = [...new Set(enlaces)].filter((ruta) => !existsSync(join(RAIZ, ruta)))
  if (ausentes.length) throw new Error(`enlaces rotos: ${ausentes.join(', ')}`)

  const imprescindibles = [
    'docs/arquitectura.md',
    'docs/trazabilidad.md',
    'docs/api/openapi.yaml',
    'openspec/specs/auth/spec.md',
    'openspec/specs/tasks/spec.md',
  ]
  const faltan = imprescindibles.filter((ruta) => !existsSync(join(RAIZ, ruta)))
  if (faltan.length) throw new Error(`faltan: ${faltan.join(', ')}`)

  return `${new Set(enlaces).size} enlaces del README`
})

for (const { nombre, ok, detalle } of comprobaciones) {
  console.log(`${ok ? 'OK  ' : 'FALLA'}  ${nombre}${detalle ? ` · ${detalle}` : ''}`)
}

if (problemas.length) {
  console.error(`\n${problemas.length} discrepancia(s) entre la documentación y el código.`)
  process.exit(1)
}

console.log('\nLa documentación corresponde con el código.')
