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
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
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
 * Las rutas que el framework tiene registradas de verdad.
 *
 * Se preguntan a `node ace list:routes --json` en vez de leer `start/routes.ts`
 * con expresiones regulares. El parseo a mano fallo tres veces seguidas y
 * siempre de la misma forma: cada revision adversarial encontro una sintaxis
 * valida que el parser no veia. `router.any()` registraba seis rutas invisibles,
 * un `.prefix()` encadenado a una ruta suelta la atribuia mal, y las comillas
 * dobles la hacian desaparecer.
 *
 * El framework sabe que rutas tiene. Preguntarselo cuesta unos segundos y
 * elimina de golpe toda esa clase de fallo.
 */
function rutasDelCodigo() {
  if (!existsSync(join(RAIZ, 'backend/node_modules'))) {
    throw new Error('falta backend/node_modules: ejecuta `npm ci` dentro de backend/')
  }

  let salida
  try {
    salida = execFileSync('node', ['ace', 'list:routes', '--json'], {
      cwd: join(RAIZ, 'backend'),
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
      timeout: 60_000,
      env: { ...process.env, NODE_ENV: 'test' },
    })
  } catch (error) {
    // `ace` escribe sus errores en stdout, no en stderr, y `error.message` se
    // queda en «Command failed». Sin esto el diagnostico se descartaba entero.
    const detalle = [error.stdout, error.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`no se pudieron leer las rutas: ${detalle || error.message}`)
  }

  const rutas = new Set()
  const recorrer = (nodo) => {
    if (Array.isArray(nodo)) return nodo.forEach(recorrer)
    if (!nodo || typeof nodo !== 'object') return

    if (nodo.pattern) {
      const metodos = nodo.methods ?? (nodo.method ? [nodo.method] : [])
      // Antes se excluia `/` por patron, y eso hacia invisible **cualquier**
      // ruta montada en la raiz: la sexta revision añadio un `router.post('/')`
      // sin documentar y el verificador siguio en verde. Se excluye solo el
      // saludo de cortesia, y por metodo.
      if (!(nodo.pattern === '/' && metodos.length === 1 && metodos[0] === 'GET')) {
        if (!metodos.length) {
          throw new Error(`la ruta ${nodo.pattern} no declara ningun metodo`)
        }
        // No se filtra HEAD ni OPTIONS: este framework no los anade solo, asi
        // que descartarlos solo hacia invisible una ruta declarada con ellos.
        for (const metodo of metodos) rutas.add(`${metodo} ${nodo.pattern}`)
      }
    }
    Object.values(nodo).forEach(recorrer)
  }
  recorrer(JSON.parse(salida))

  return rutas
}

/**
 * Las operaciones del contrato, con qué códigos de respuesta documenta cada
 * una. Se recorre por indentación en vez de contar cadenas sueltas: contar
 * `"404":` en todo el fichero daba por buena una operación que no lo tenía
 * mientras otra cualquiera sí.
 */
function operacionesDelContrato() {
  const operaciones = []
  let dentroDePaths = false
  let ruta = null
  let actual = null
  let enRespuestas = false

  for (const linea of leer('docs/api/openapi.yaml').split('\n')) {
    // Al salir de `paths:` se deja de mirar: si no, cualquier `"404":` de
    // `components` se atribuia a la ultima operacion leida.
    if (/^\w/.test(linea)) {
      dentroDePaths = linea.startsWith('paths:')
      ruta = actual = null
      enRespuestas = false
      continue
    }
    if (!dentroDePaths) continue

    const caminoNuevo = linea.match(/^ {2}(\/[^:]*):\s*$/)
    if (caminoNuevo) {
      ruta = caminoNuevo[1]
      actual = null
      enRespuestas = false
      continue
    }
    const metodo = linea.match(/^ {4}(get|post|patch|put|delete):\s*$/)
    if (metodo && ruta) {
      actual = { ruta, metodo: metodo[1].toUpperCase(), codigos: new Set() }
      operaciones.push(actual)
      enRespuestas = false
      continue
    }
    // El codigo solo cuenta dentro del bloque `responses:` de su operacion.
    // Escrito en la prosa de un `description: |`, que va indentada a los
    // mismos ocho espacios, contaba como declarado.
    if (/^ {6}\w+:/.test(linea)) enRespuestas = /^ {6}responses:/.test(linea)

    const codigo = linea.match(/^ {8}"?(\d{3})"?:/)
    if (codigo && actual && enRespuestas) actual.codigos.add(codigo[1])
  }

  return operaciones
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
      return `${metodo} ${camino.replace(/:(\w+)/g, '{$1}')}`
    })
  )

  const faltan = [...esperadas].filter((r) => !contrato.has(r))
  const sobran = [...contrato].filter((r) => !esperadas.has(r))

  if (faltan.length) throw new Error(`sin documentar: ${faltan.join(', ')}`)
  if (sobran.length) throw new Error(`documentadas pero inexistentes: ${sobran.join(', ')}`)

  return `${esperadas.size} operaciones`
})

comprobar('Los estados del contrato son los del dominio', () => {
  const modelo = leerCodigo('backend/app/models/task.ts')
  const declarados = [...modelo.matchAll(/TASK_STATUSES = \[([^\]]+)\]/g)]
  if (!declarados.length) throw new Error('no se encuentra TASK_STATUSES en el modelo')

  const estados = [...declarados[0][1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  // Sin comentarios y anclado al esquema que declara los estados: coger el
  // primer `enum:` del fichero lo satisfacia un comentario con el enum viejo.
  const contrato = leer('docs/api/openapi.yaml').replace(/^\s*#.*$/gm, '')
  const bloque = contrato.match(/EstadoDeTarea:[\s\S]{0,400}?enum: \[([^\]]+)\]/)
  if (!bloque) throw new Error('el contrato no declara el enum en EstadoDeTarea')
  const enum_ = bloque

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
    ['tiene fecha', /if\s*\([^)]*dueDate === null[^)]*\)\s*\{?\s*return\s+false/],
    ['no esta hecha', /if\s*\([^)]*status === 'done'[^)]*\)\s*\{?\s*return\s+false/],
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

  const esperadas = new Set(rutasDelCodigo())

  const faltan = [...esperadas].filter((r) => !documentadas.has(r))
  const sobran = [...documentadas].filter((r) => !esperadas.has(r))
  if (faltan.length) throw new Error(`sin documentar en CLAUDE.md: ${faltan.join(', ')}`)
  if (sobran.length) throw new Error(`en CLAUDE.md pero inexistentes: ${sobran.join(', ')}`)

  return `${esperadas.size} rutas`
})

comprobar('Toda operación que resuelve un id documenta su 404', () => {
  // La spec exige 404 en tres escenarios y el contrato no documentaba ninguno,
  // asi que quien integre contra el no sabria que existe.
  //
  // Se comprueba OPERACION A OPERACION. Contar `"404":` en todo el fichero
  // daba por buena una operacion sin el suyo mientras otra cualquiera lo
  // tuviera, y lo satisfacia incluso un 404 dejado en un comentario del YAML.
  const conId = operacionesDelContrato().filter((o) => /\{\w+\}/.test(o.ruta))
  if (!conId.length) throw new Error('el contrato no declara ninguna ruta con {id}')

  const sinRechazo = conId.filter((o) => !o.codigos.has('404'))
  if (sinRechazo.length) {
    throw new Error(
      `sin 404 documentado: ${sinRechazo.map((o) => `${o.metodo} ${o.ruta}`).join(', ')}`
    )
  }

  // Y que ninguna ruta del codigo que resuelva un id se quede fuera del
  // contrato. La lista de controladores se lee del directorio, no a mano.
  const controladores = readdirSync(join(RAIZ, 'backend/app/controllers'))
    .filter((f) => f.endsWith('.ts'))
    .filter((f) => /findOrFail/.test(leerCodigo(`backend/app/controllers/${f}`)))

  const rutasConId = [...rutasDelCodigo()].filter((r) => /:\w+/.test(r))
  if (controladores.length && rutasConId.length !== conId.length) {
    throw new Error(
      `${rutasConId.length} rutas con id en el codigo y ${conId.length} documentadas`
    )
  }

  return `${conId.length} operaciones con 404`
})

comprobar('Toda operación documenta el error que no estaba previsto', () => {
  // ADR-0003 decidió que **cualquier** 5xx responde una forma cerrada, y eso es
  // contrato: quien integre tiene que saber que un fallo inesperado llega como
  // `{ errors: [...] }` y no como el `{ message }` del framework con el SQL
  // dentro.
  //
  // El contrato no lo documentaba en ninguna de las nueve operaciones, y ninguna
  // comprobación lo vio porque ninguna miraba ahí: la del 404 solo mira rutas
  // con `{id}`, y la del volcado solo mira el handler. Un cambio de forma de
  // respuesta se coló entero entre las dos.
  //
  // Se comprueba operación a operación, por el mismo motivo que el 404: contar
  // apariciones en el fichero da por buena una operación sin el suyo.
  const operaciones = operacionesDelContrato()
  if (!operaciones.length) throw new Error('el contrato no declara ninguna operación')

  const sinInterno = operaciones.filter((o) => !o.codigos.has('500'))
  if (sinInterno.length) {
    throw new Error(
      `sin 500 documentado: ${sinInterno.map((o) => `${o.metodo} ${o.ruta}`).join(', ')}`
    )
  }

  // Y que lo que documenta sea la forma del proyecto, no una descripción suelta.
  //
  // Se acota el bloque por indentación en vez de mirar una ventana de N
  // caracteres. La primera versión de esta comprobación usaba 600 y falló al
  // escribirse, porque la descripción ocupa 631: una ventana fija no comprueba
  // la estructura, comprueba cuánto se escribió, y se rompe en cuanto alguien
  // alarga un párrafo.
  const lineas = leer('docs/api/openapi.yaml').split('\n')
  const inicio = lineas.findIndex((l) => /^ {4}ErrorInterno:\s*$/.test(l))
  if (inicio === -1) throw new Error('el contrato no declara la respuesta `ErrorInterno`')

  const bloque = []
  for (const linea of lineas.slice(inicio + 1)) {
    if (/^ {0,4}\S/.test(linea)) break
    bloque.push(linea)
  }
  if (!bloque.some((l) => /schema:\s*\{\s*\$ref:\s*"#\/components\/schemas\/Errores"/.test(l))) {
    throw new Error('la respuesta de error interno no usa el esquema `Errores` del proyecto')
  }

  return `${operaciones.length} operaciones con 500`
})

comprobar('Ningún change se archiva con casillas mudas', () => {
  // H-18. Un change se archivó con la casilla «verificar que ninguna respuesta
  // incluye el email del responsable» sin marcar, y ocurrió exactamente eso:
  // es H-17. Otro la marcó `[x]` sobre código que nunca lo hizo: es H-16.
  //
  // Nada automático puede saber si una verificación a mano se hizo de verdad.
  // Lo que sí se puede exigir es que una casilla sin marcar **no sea muda**:
  // si el change se archiva con trabajo sin hacer, el propio fichero tiene que
  // decir cuál y qué costó. Una casilla vacía en un archivo es indistinguible
  // de una que nadie tuvo que hacer, y esa ambigüedad es el defecto.
  const raiz = 'openspec/changes/archive'
  if (!existsSync(join(RAIZ, raiz))) return 'no hay changes archivados'

  const archivados = readdirSync(join(RAIZ, raiz), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)

  const mudos = []
  let conPendientes = 0

  for (const change of archivados) {
    const ruta = `${raiz}/${change}/tasks.md`
    if (!existsSync(join(RAIZ, ruta))) continue

    const tareas = leer(ruta)
    if (!/^- \[ \]/m.test(tareas)) continue

    conPendientes += 1
    if (!/^#{2,3} .*Lo que no se ejecutó/m.test(tareas)) mudos.push(change)
  }

  if (mudos.length) {
    throw new Error(
      `archivados con casillas sin marcar y sin declararlas: ${mudos.join(', ')} (H-18)`
    )
  }

  return `${archivados.length} archivados, ${conPendientes} declaran lo que no ejecutaron`
})

comprobar('La petición se valida antes de resolver el identificador', () => {
  // ADR-0004. Antes dependía de la ruta: `show` validaba primero y las dos
  // escrituras resolvían primero, así que la misma clase de petición daba
  // `422` o `404` según a cuál llegaras. Ninguna de las dos órdenes estaba
  // mal; tener las dos, sí.
  //
  // Se mira el orden dentro de cada acción, no que las dos llamadas existan:
  // exigir solo que coexistan es lo que dejaba pasar el defecto.
  const controladores = readdirSync(join(RAIZ, 'backend/app/controllers')).filter((f) =>
    f.endsWith('.ts')
  )

  const invertidos = []
  let revisadas = 0

  for (const fichero of controladores) {
    const codigo = leerCodigo(`backend/app/controllers/${fichero}`)

    // Cada acción por separado: un controlador con dos acciones podía tener
    // una bien y otra mal, y mirar el fichero entero las mezclaba.
    for (const accion of codigo.split(/\n {2}async /).slice(1)) {
      const resolver = accion.indexOf('findOrFail')
      if (resolver === -1) continue

      revisadas += 1
      const validar = accion.indexOf('validateUsing')
      if (validar === -1 || validar > resolver) {
        invertidos.push(`${fichero}:${accion.split('(')[0]}`)
      }
    }
  }

  if (!revisadas) throw new Error('ningún controlador resuelve un identificador')
  if (invertidos.length) {
    throw new Error(`resuelven antes de validar: ${invertidos.join(', ')} (ADR-0004)`)
  }

  return `${revisadas} acciones resuelven un id, todas validan antes`
})

comprobar('El rechazo por recurso inexistente sale con la forma del proyecto', () => {
  // El contrato documenta `{ errors: [...] }` en los tres 404, y quien lo hace
  // cierto es el handler. Sin esto, quitarlo devolvería el volcado de
  // depuración y el contrato volvería a mentir sin que nada avisara.
  const handler = leerCodigo('backend/app/exceptions/handler.ts')
  // Con el operador dentro del patrón. Invertirlo a `!==` rompe los tres 404 y
  // convierte todo lo demás en un 404 falso, y la version anterior de esta
  // comprobacion lo dejaba pasar: solo exigia que las dos cadenas coexistieran.
  if (!/error\.code === 'E_ROW_NOT_FOUND'/.test(handler)) {
    throw new Error('el handler no compara `error.code === E_ROW_NOT_FOUND` (ADR-0002)')
  }
  if (/error\.code !== 'E_ROW_NOT_FOUND'/.test(handler)) {
    throw new Error('la comparacion esta invertida: normalizaria todo menos el 404')
  }
  if (!/status\(404\)[\s\S]{0,120}errors:/.test(handler)) {
    throw new Error('el handler no responde 404 con la forma `{ errors: [...] }`')
  }
  return '404 normalizado'
})

comprobar('El volcado de depuración va apagado salvo que se encienda', () => {
  // ADR-0003. Fue H-19, abierto tres módulos. Encenderlo devuelve traza, rutas
  // absolutas y el SQL ejecutado a cualquiera que alcance el puerto, sin sesión.
  //
  // La versión anterior era una lista negra -ni `true`, ni `inProduction`- y
  // con eso `env.get(…) || !app.inTest` la pasaba entera dejando el volcado
  // encendido en desarrollo. Ahora el valor tiene que ser **exactamente** la
  // expresión que decide el ADR: cualquier cosa añadida es un entorno colándose
  // por detrás, que es la forma que tenía este defecto de volver.
  const handler = leerCodigo('backend/app/exceptions/handler.ts')
  const debug = handler.match(/protected debug = (.+)/)
  if (!debug) throw new Error('el handler no declara `debug`')

  const valor = debug[1].trim().replace(/;$/, '')
  if (valor !== "env.get('DEBUG_HTTP_ERRORS', false)") {
    throw new Error(
      `\`debug\` vale \`${valor}\`, y debe ser exactamente env.get('DEBUG_HTTP_ERRORS', false)`
    )
  }

  // `isDebuggingEnabled(ctx)` es el gancho que el framework documenta para
  // decidir esto por petición. Sobreescribirlo devuelve el volcado sin tocar
  // `debug`, así que la comprobación de `debug` no lo vería.
  //
  // Se busca el nombre en CUALQUIER forma de declaración, no solo como método.
  // La versión anterior exigía el paréntesis pegado -`isDebuggingEnabled(`- y
  // la sexta revisión la pasó por encima con
  // `protected isDebuggingEnabled = (_ctx) => true`, que es una propiedad y
  // lleva ` = ` en medio: verificador en verde con el volcado de Youch
  // devuelto en todo error. Ahora se quitan las llamadas y se mira si el
  // nombre sigue apareciendo, sea cual sea la sintaxis.
  const sinLlamadas = handler.replace(/this\.isDebuggingEnabled\s*\(/g, '')
  if (/isDebuggingEnabled/.test(sinLlamadas)) {
    throw new Error('el handler declara isDebuggingEnabled: el volcado deja de depender de `debug`')
  }

  // El interruptor tiene que existir en el esquema, **con su tipo**, y venir
  // apagado en la plantilla, que es el fichero que copia todo el que llega.
  //
  // El tipo no es un detalle. Con `Env.schema.string` la variable llega como
  // la cadena `'false'`, que en JavaScript es **truthy**: el volcado quedaría
  // encendido en todos los entornos, producción incluida, con el
  // `.env.example` diciendo `false` y el verificador en verde. La versión
  // anterior solo miraba que la cadena `DEBUG_HTTP_ERRORS` apareciera.
  const esquema = leerCodigo('backend/start/env.ts')
  if (!/DEBUG_HTTP_ERRORS:\s*Env\.schema\.boolean/.test(esquema)) {
    throw new Error(
      'start/env.ts no declara DEBUG_HTTP_ERRORS como boolean: una cadena `false` sería truthy'
    )
  }
  const plantilla = leer('backend/.env.example').match(/^DEBUG_HTTP_ERRORS=(.*)$/m)
  if (!plantilla || plantilla[1].trim() !== 'false') {
    throw new Error('.env.example no trae DEBUG_HTTP_ERRORS=false')
  }
  // Y la suite no puede heredar el `.env` de quien la ejecuta: el propio ADR
  // invita a encender el volcado, y quien lo haga se encontraría las pruebas de
  // H-19 en rojo por su configuración local.
  const entornoDePruebas = leer('backend/.env.test').match(/^DEBUG_HTTP_ERRORS=(.*)$/m)
  if (!entornoDePruebas || entornoDePruebas[1].trim() !== 'false') {
    throw new Error('.env.test no fija DEBUG_HTTP_ERRORS=false: la suite dependería del .env local')
  }

  return 'apagado, con DEBUG_HTTP_ERRORS para encenderlo'
})

comprobar('Un error inesperado no devuelve su mensaje', () => {
  // La otra mitad de H-19, y la que sobrevivió a apagar el volcado: la rama sin
  // depuración del framework responde `{ message: error.message }`, y el
  // `message` de un SqliteError es la sentencia SQL entera, con los valores
  // insertados dentro. Se reprodujo devolviendo el `insert into users …`
  // completo, con el hash de la contraseña, en el alta y sin sesión.
  const handler = leerCodigo('backend/app/exceptions/handler.ts')
  if (!/status >= 500/.test(handler)) {
    throw new Error('el handler no intercepta los 5xx: devolvería el mensaje crudo de la excepción')
  }
  if (!/status >= 500[\s\S]{0,200}errors:/.test(handler)) {
    throw new Error('el 5xx no responde con la forma cerrada `{ errors: [...] }`')
  }
  // Con el operador dentro del patrón, igual que en la del 404. Invertir la
  // negación -`&& this.isDebuggingEnabled(ctx)`- deja la intercepción activa
  // solo con el volcado encendido, que es exactamente al revés, y la versión
  // anterior lo dejaba pasar porque solo exigía que las cadenas coexistieran.
  if (!/status >= 500 && !this\.isDebuggingEnabled\(/.test(handler)) {
    throw new Error('la condición del 5xx no es `status >= 500 && !this.isDebuggingEnabled(ctx)`')
  }
  // Esto es aviso temprano, no la garantía. La garantía es la prueba, que
  // provoca un 500 real y mira el cuerpo entero.
  const prueba = leer('backend/tests/functional/errores.spec.ts')
  for (const rastro of ['insert into', '$scrypt$', 'assertStatus(500)']) {
    if (!prueba.includes(rastro)) {
      throw new Error(`errores.spec.ts ya no comprueba «${rastro}»`)
    }
  }
  return '5xx cerrado, y con prueba que lo provoca'
})

comprobar('El reporte del módulo declara lo que se arrastra', () => {
  // La regla de proceso solo sirve si algo la hace cumplir.
  //
  // La versión anterior buscaba la cadena en cualquier parte del fichero, así
  // que sustituir la tabla entera por «esta vez no hace falta la tabla de Lo
  // que se arrastra» la dejaba en verde. Ahora se exige el encabezado, y bajo
  // él una tabla con filas de verdad: una sección vacía es la misma mentira
  // que no tenerla.
  const reportes = readdirSync(join(RAIZ, 'docs')).filter((f) => /^reporte-.*\.md$/.test(f))
  if (!reportes.length) throw new Error('no hay ningún reporte de módulo en docs/')

  for (const fichero of reportes) {
    const texto = leer(`docs/${fichero}`)
    const seccion = texto.match(/^#{2,4} .*Lo que se arrastra.*$([\s\S]*?)(?=^#{2,4} |\Z)/m)
    if (!seccion) {
      throw new Error(`sin encabezado «Lo que se arrastra»: ${fichero}`)
    }

    const filas = seccion[1]
      .split('\n')
      .filter((linea) => /^\|/.test(linea.trim()))
      // La cabecera y su separador de guiones no son datos.
      .filter((linea) => !/^\|[\s|:-]+\|$/.test(linea.trim()))
      .slice(1)

    if (!filas.length) {
      throw new Error(`la sección «Lo que se arrastra» de ${fichero} no tiene ninguna fila`)
    }
    // Cinco columnas: qué, desde dónde, en qué rama, en qué estado y qué falta.
    // Menos que eso ya no es el registro que la regla pide.
    const cortas = filas.filter((linea) => linea.trim().split('|').length - 2 < 5)
    if (cortas.length) {
      throw new Error(`filas incompletas en «Lo que se arrastra» de ${fichero}: ${cortas.length}`)
    }
  }
  return `${reportes.length} reportes`
})

comprobar('La versión navegable dice lo mismo que el reporte', () => {
  // `docs/artefactos/*.html` es lo que se publica y lo que la gente abre, y
  // hasta ahora no lo miraba nada: el filtro de la comprobación de arrastre es
  // `^reporte-.*\.md$` sobre `docs/`, así que el HTML podía decir cualquier
  // cosa. La sexta revisión lo encontró afirmando 35 pruebas y 12
  // comprobaciones, y sin la tabla «Lo que se arrastra» que la regla exige.
  const artefactos = readdirSync(join(RAIZ, 'docs/artefactos')).filter((f) => f.endsWith('.html'))
  if (!artefactos.length) throw new Error('no hay ningún artefacto en docs/artefactos/')

  for (const fichero of artefactos) {
    const html = leer(`docs/artefactos/${fichero}`)

    if (!/Lo que se arrastra/.test(html)) {
      throw new Error(`${fichero} no trae la sección «Lo que se arrastra»`)
    }
    // El número de comprobaciones es el que más se ha quedado atrás: cambió
    // cinco veces en dos días y el HTML se olvidó las dos últimas.
    //
    // Solo se exige a quien lo declara. Un reporte de un módulo anterior no
    // tiene por qué hablar del verificador, y obligarle sería pedirle que
    // afirme algo que en su momento no era cierto. Esta condición se escribió
    // primero sin acotar y falló contra el reporte del Módulo 3.
    const total = (leer('scripts/verificar-docs.mjs').match(/^comprobar\(/gm) ?? []).length
    const declarado = html.match(/>(\d+)<\/span><span class="rotulo">Comprobaciones/)
    if (declarado && Number(declarado[1]) !== total) {
      throw new Error(`${fichero} dice ${declarado[1]} comprobaciones y hay ${total}`)
    }
  }
  return `${artefactos.length} artefactos`
})

comprobar('El filtro de la lista solo admite estados del dominio', () => {
  const validador = leerCodigo('backend/app/validators/task.ts')
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

  // El requisito dice «ni en la lista ni en la tarea suelta», así que las dos
  // salidas se comprueban igual. Mirar solo la lista dejaba la otra abierta.
  const detalle = leerCodigo('backend/app/transformers/task_detail_transformer.ts')
  if (!/assignee:\s*TaskAssigneeTransformer\.transform\(/.test(detalle)) {
    throw new Error('la tarea suelta no construye el responsable con TaskAssigneeTransformer')
  }
  if (/UserTransformer/.test(detalle)) {
    throw new Error('la tarea suelta vuelve a usar UserTransformer, que expone la cuenta')
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
  // Intercambiar las dos ramas del ternario es la mutación de un token más
  // natural, y cumplía las otras condiciones dejando la suite escribiendo
  // sobre la base de desarrollo.
  //
  // El nombre esperado no se escribe aquí: se lee de la prueba que lo asserta,
  // para que los dos no puedan discrepar. `/test/` como subcadena admitía
  // nombres como `latest.sqlite3`.
  const prueba = leerCodigo('backend/tests/functional/aislamiento.spec.ts')
  const asertado = prueba.match(/app\.tmpPath\('([^']+)'\)\)\s*$/m)
  if (!asertado) {
    throw new Error('aislamiento.spec.ts no asserta ningún fichero de base de datos')
  }
  if (enTest !== asertado[1]) {
    throw new Error(`en test se usa '${enTest}' y la prueba asserta '${asertado[1]}'`)
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
