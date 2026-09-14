/**
 * R-14: una comprobación cuenta cuando se la ha visto fallar.
 *
 * Hasta el 2026-09-12 esto se hacía a mano: mutar, mirar el rojo, revertir, y
 * escribir en un hallazgo que se había hecho. Siete revisiones adversariales
 * encontraron comprobaciones en verde sobre mutaciones reales, y el mismo día
 * que se escribió este fichero una mutación a mano **no llegó a aplicarse** por
 * el escapado del shell y dio un verde que no probaba nada.
 *
 * Cada entrada del catálogo es un defecto que ya existió, reintroducido tal
 * cual, y las comprobaciones que dicen cubrirlo. Para cada una:
 *
 * 1. Las comprobaciones tienen que estar en **verde sin mutar**. Un rojo que ya
 *    estaba no demuestra nada.
 * 2. El texto a mutar tiene que aparecer **exactamente una vez**. Si el código
 *    cambió y ya no aparece, el catálogo está desfasado y eso es un fallo: una
 *    mutación que no se aplica es un verde falso.
 * 3. Con la mutación puesta, **todas** tienen que salir distinto de cero **y
 *    nombrar lo que se espera**: rojo por el motivo correcto, no por otro.
 * 4. El fichero vuelve a su contenido exacto, también si se interrumpe.
 *
 * Fuera del catálogo a propósito: mutar el aislamiento de la base de pruebas
 * (H-01). Con esa mutación puesta, la suite escribiría sobre la base de
 * desarrollo de quien lo ejecute. La vigila el verificador, que no ejecuta la
 * suite, y está en el catálogo solo con él.
 *
 * Uso: node scripts/mutaciones.mjs [id ...]     # todas, o las nombradas
 *      node scripts/mutaciones.mjs --listar
 */
import { spawnSync } from 'node:child_process'
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Cada comprobación dice cómo marca **una línea de fallo**. No basta con que la
 * salida contenga el motivo: el verificador imprime el nombre de todas sus
 * comprobaciones, también las que pasan, así que un rojo de otra cualquiera
 * habría dado por buena la entrada. El motivo tiene que estar en una línea que
 * diga que eso falló.
 */
const pruebas = (fichero) => ({
  nombre: `backend: ${fichero}`,
  cwd: 'backend',
  args: ['ace', 'test', `--files=${fichero}`],
  // Japa marca la prueba fallida con `❯` donde el terminal admite Unicode y
  // con `>` donde no, que es Windows. Solo con `>`, las doce entradas de Japa
  // salieron en Linux como «rojo por otro motivo».
  fallo: /^\s*[>❯]\s/,
})
const VERIFICADOR = {
  nombre: 'verificar-docs',
  cwd: '.',
  args: ['scripts/verificar-docs.mjs'],
  fallo: /^FALLA\b/,
}
const CONTRATO = {
  nombre: 'openapi:check',
  cwd: 'backend',
  args: ['openapi.js', 'check'],
  fallo: /(falta|sobra) en el fichero|valor distinto/,
}
const VITEST = {
  nombre: 'frontend: vitest',
  cwd: 'frontend',
  args: ['node_modules/vitest/vitest.mjs', 'run'],
  fallo: /^\s*(×|FAIL\s)/,
}
const HOOK = {
  nombre: 'probar-hook-rama',
  cwd: '.',
  args: ['scripts/probar-hook-rama.mjs'],
  fallo: /^FALLA\b/,
}
const MENSAJE = {
  nombre: 'probar-hook-mensaje',
  cwd: '.',
  args: ['scripts/probar-hook-mensaje.mjs'],
  fallo: /^FALLA\b/,
}
const FIX = {
  nombre: 'probar-fix-con-prueba',
  cwd: '.',
  args: ['scripts/probar-fix-con-prueba.mjs'],
  fallo: /^FALLA\b/,
}
// `--end-of-line auto`, igual que el script `format:check`: en Windows el árbol
// de trabajo tiene CRLF y sin eso todo fichero sale como mal formateado.
const formato = (lado) => ({
  nombre: `${lado}: format:check`,
  cwd: lado,
  args: ['node_modules/prettier/bin/prettier.cjs', '--check', '--end-of-line', 'auto', '.'],
  fallo: /^\[warn\]\s/,
})
const PLAYWRIGHT = {
  nombre: 'frontend: playwright',
  cwd: 'frontend',
  args: ['node_modules/@playwright/test/cli.js', 'test'],
  // La línea resumen de una prueba fallida empieza por `x` en Windows y por
  // `✘` en Linux; la cabecera del detalle, `1) [chromium] › …`, es igual en
  // los dos y solo sale cuando algo falla.
  fallo: /^\s*\d+\) \[chromium\]/,
}

const CATALOGO = [
  {
    id: 'H-15-estado',
    que: 'una tarea hecha con la fecha pasada vuelve a salir vencida',
    fichero: 'backend/app/models/task.ts',
    cambios: [["    if (this.status === 'done') return false\n", '']],
    muerden: [
      [pruebas('vencimiento'), 'las tres condiciones tienen que darse a la vez'],
      [pruebas('regla_de_vencida'), 'una tarea hecha nunca está vencida'],
      [VERIFICADOR, 'La regla de vencimiento comprueba sus tres condiciones'],
    ],
  },
  {
    id: 'H-15-borde',
    que: 'vencer hoy pasa a contar como vencida',
    fichero: 'backend/app/models/task.ts',
    cambios: [['return this.dueDate < referenceDay', 'return this.dueDate <= referenceDay']],
    muerden: [
      [pruebas('vencimiento'), 'vencer hoy todavía no es estar vencida'],
      [pruebas('regla_de_vencida'), 'vencer hoy todavía no es estar vencida'],
    ],
  },
  {
    id: 'H-16',
    que: 'el filtro vuelve a aceptar cualquier cadena',
    fichero: 'backend/app/validators/task.ts',
    cambios: [
      ['status: vine.enum(TASK_STATUSES).optional(),', 'status: vine.string().optional(),'],
    ],
    muerden: [
      [pruebas('filtro'), 'un estado que no existe se rechaza y no se responde vacío'],
      [VERIFICADOR, 'El filtro de la lista solo admite estados del dominio'],
    ],
  },
  {
    id: 'H-17',
    que: 'el responsable de una tarea vuelve a exponer su email',
    fichero: 'backend/app/transformers/task_assignee_transformer.ts',
    cambios: [["['id', 'fullName', 'initials']", "['id', 'fullName', 'initials', 'email']"]],
    muerden: [[pruebas('assignee'), 'la tarea no filtra datos de la cuenta de su responsable']],
  },
  {
    id: 'H-19',
    que: 'un 500 vuelve a devolver el mensaje de la excepción, con el SQL dentro',
    fichero: 'backend/app/exceptions/handler.ts',
    cambios: [['if (httpError.status >= 500 &&', 'if (httpError.status >= 599 &&']],
    muerden: [
      [pruebas('errores'), 'un error inesperado de la base de datos'],
      [VERIFICADOR, 'Un error inesperado no devuelve su mensaje'],
    ],
  },
  {
    id: 'ADR-0005',
    que: 'el volcado de depuración vuelve a ir encendido por defecto',
    fichero: 'backend/app/exceptions/handler.ts',
    cambios: [["env.get('DEBUG_HTTP_ERRORS', false)", "env.get('DEBUG_HTTP_ERRORS', true)"]],
    muerden: [[VERIFICADOR, 'El volcado de depuración va apagado salvo que se encienda']],
  },
  {
    id: 'H-01',
    que: 'la suite vuelve a apuntar a la base de desarrollo',
    fichero: 'backend/config/database.ts',
    cambios: [["app.inTest ? 'db-test.sqlite3' : 'db.sqlite3'", "'db.sqlite3'"]],
    muerden: [[VERIFICADOR, 'Las pruebas no pueden escribir sobre la base de desarrollo']],
  },
  {
    id: 'H-11',
    que: 'el email vuelve a distinguir mayúsculas',
    fichero: 'backend/app/validators/user.ts',
    cambios: [
      ['.email().normalizeEmail(SOLO_MINUSCULAS).maxLength(254)', '.email().maxLength(254)'],
    ],
    muerden: [
      [
        pruebas('email_mayusculas'),
        'un alta repetida con otras mayúsculas se rechaza como duplicada',
      ],
    ],
  },
  {
    id: 'H-14',
    que: 'cambiar el estado vuelve a devolver la tarea en memoria, no la persistida',
    fichero: 'backend/app/controllers/task_statuses_controller.ts',
    cambios: [
      [
        'serialize(TaskTransformer.transform(await Task.releerConResponsable(task.id)))',
        "serialize(TaskTransformer.transform((await task.load('assignee'), task)))",
      ],
    ],
    muerden: [
      [pruebas('escritura_lectura'), 'cambiar el estado devuelve lo mismo que la lista siguiente'],
    ],
  },
  {
    id: 'ADR-0006',
    que: 'cambiar el estado vuelve a buscar la tarea antes de validar',
    fichero: 'backend/app/controllers/task_statuses_controller.ts',
    cambios: [
      [
        '    const { status } = await request.validateUsing(updateTaskStatusValidator)\n    const task = await Task.findOrFail(params.id)\n',
        '    const task = await Task.findOrFail(params.id)\n    const { status } = await request.validateUsing(updateTaskStatusValidator)\n',
      ],
    ],
    muerden: [
      [pruebas('orden_de_validacion'), 'un estado inventado sobre una tarea que no existe da 422'],
      [VERIFICADOR, 'La petición se valida antes de resolver el identificador'],
    ],
  },
  {
    id: 'PA-7',
    que: 'una tarea marcada como hecha deja de poder volver atrás',
    fichero: 'backend/app/controllers/task_statuses_controller.ts',
    cambios: [
      ['    task.status = status\n', "    if (task.status !== 'done') task.status = status\n"],
    ],
    muerden: [
      [pruebas('filtro'), 'una tarea marcada como hecha por error se recupera desde el filtro'],
    ],
  },
  {
    id: 'CA-13-fechas',
    que: 'la API empieza a rechazar una fecha de vencimiento ya pasada',
    fichero: 'backend/app/controllers/task_due_dates_controller.ts',
    cambios: [
      [
        'async update({ params, request, serialize }',
        'async update({ params, request, response, serialize }',
      ],
      [
        '    const task = await Task.findOrFail(params.id)\n',
        "    const task = await Task.findOrFail(params.id)\n    if (dueDate !== null && toCalendarDay(dueDate) < toCalendarDay(today)) return response.unprocessableEntity({ errors: [{ field: 'dueDate', rule: 'afterOrEqual', message: 'pasada' }] })\n",
      ],
    ],
    muerden: [
      [
        pruebas('vencimiento'),
        'una fecha ya pasada se acepta y la tarea vence en la misma respuesta',
      ],
    ],
  },
  {
    id: 'PA-3-orden',
    que: 'la lista vuelve a mezclar en curso y pendientes por recencia',
    fichero: 'backend/app/controllers/tasks_controller.ts',
    cambios: [
      [
        "      .orderByRaw(\"CASE status WHEN 'in_progress' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END\")\n",
        '',
      ],
    ],
    muerden: [
      [
        pruebas('lista_compartida'),
        'sin acotar, lo que está en curso va primero aunque sea más antiguo',
      ],
    ],
  },
  {
    // Nadie lo plantó: es la vertical del PRD, y ninguna comprobación la
    // recorría entera hasta el 2026-09-13. La funcional ve que otra cuenta no
    // recibe la tarea; el flujo de navegador, que otra persona no la ve.
    id: 'flujo-principal',
    que: 'la lista deja de ser compartida y cada cuenta ve solo la suya',
    fichero: 'backend/app/controllers/tasks_controller.ts',
    cambios: [
      [
        "    const query = Task.query().preload('assignee')\n",
        "    const query = Task.query().preload('assignee').where('assigneeId', 0)\n",
      ],
    ],
    muerden: [
      [pruebas('lista_compartida'), 'cada una ve la tarea de la otra'],
      [PLAYWRIGHT, 'registrarse, apuntar una tarea, ponerla en curso y que otra persona la vea'],
    ],
  },
  {
    id: 'PA-3-colocar',
    que: 'la tarea recién creada vuelve a pintarse delante de todo',
    fichero: 'frontend/src/lib/lista.ts',
    cambios: [
      [
        '  const posicion = primeraNoEnCurso === -1 ? tareas.length : primeraNoEnCurso',
        '  const posicion = 0',
      ],
    ],
    muerden: [
      [VITEST, 'entra debajo de las en curso y encima de las pendientes'],
      [
        PLAYWRIGHT,
        'la tarea creada entra debajo de lo que está en curso y la fila no salta al cambiar su estado',
      ],
    ],
  },
  {
    id: 'H-37',
    que: 'el suscriptor de onUnauthorized deja de cerrar la sesión y el arranque se queda cargando',
    fichero: 'frontend/src/auth/auth-provider.tsx',
    cambios: [['      clearSession()', '      void 0']],
    muerden: [[PLAYWRIGHT, 'con un token revocado se llega al acceso explicando por qué']],
  },
  {
    id: 'H-38',
    que: 'un fallo de red al arrancar borra el token guardado',
    fichero: 'frontend/src/auth/auth-provider.tsx',
    cambios: [['        setToken(null)', '        clearSession()']],
    muerden: [
      [PLAYWRIGHT, 'con el servidor caído se conserva el token y la sesión vuelve al recargar'],
    ],
  },
  {
    id: 'H-03',
    que: 'el cierre de sesión vuelve a responder sin envoltorio',
    fichero: 'backend/app/controllers/access_tokens_controller.ts',
    cambios: [
      [
        "return serialize({ message: 'Logged out successfully' })",
        "return { message: 'Logged out successfully' }",
      ],
    ],
    muerden: [
      [pruebas('session'), 'toda respuesta de éxito de auth va envuelta en data y solo en data'],
    ],
  },
  {
    id: 'H-35',
    que: 'la caché del contrato servido vuelve a guardar el texto después del await',
    fichero: 'backend/app/openapi/document.ts',
    cambios: [
      ['let contrato: Promise<string> | null = null', 'let contrato: string | null = null'],
      [
        'export function contratoServido(): Promise<string> {\n  contrato ??= openapi.buildDocument().then((documento) => JSON.stringify(documento))\n  return contrato\n}',
        'export async function contratoServido(): Promise<string> {\n  contrato ??= JSON.stringify(await openapi.buildDocument())\n  return contrato\n}',
      ],
    ],
    muerden: [
      [
        pruebas('contrato_servido'),
        'peticiones simultáneas al arrancar reciben un documento sin repetidos',
      ],
    ],
  },
  {
    id: 'validacion-acumulada',
    que: 'la respuesta de validación vuelve a traer solo el primer error',
    fichero: 'backend/start/validator.ts',
    cambios: [
      [
        "import { VineDate } from '@vinejs/vine'",
        "import vine, { VineDate, SimpleErrorReporter } from '@vinejs/vine'",
      ],
      [
        'VineDate.transform((value) => DateTime.fromJSDate(value))',
        'VineDate.transform((value) => DateTime.fromJSDate(value))\nvine.errorReporter = () => {\n  const r = new SimpleErrorReporter()\n  const original = r.report.bind(r)\n  r.report = (...args) => {\n    if (!r.hasErrors) original(...args)\n  }\n  return r\n}',
      ],
    ],
    muerden: [
      [pruebas('signup'), 'varios campos inválidos a la vez devuelven un error por cada uno'],
    ],
  },
  {
    id: 'H-05',
    que: 'el backend deja de emitir una regla que el frontend traduce',
    fichero: 'backend/app/validators/task.ts',
    cambios: [['.minLength(1).maxLength(200)', '.minLength(1)']],
    muerden: [
      [pruebas('nombres_de_regla'), 'los ocho nombres que traduce el frontend los emite la API'],
    ],
  },
  {
    id: 'ADR-0007',
    que: 'se renombra un endpoint sin regenerar el contrato',
    fichero: 'backend/start/routes.ts',
    cambios: [
      [
        "router.get('profile', [controllers.Profile, 'show'])",
        "router.get('perfil', [controllers.Profile, 'show'])",
      ],
    ],
    muerden: [
      [CONTRATO, 'paths./api/v1/account/perfil'],
      [VERIFICADOR, 'La tabla de rutas de AGENTS.md corresponde con el código'],
    ],
  },
  {
    id: 'H-13',
    que: 'un error que no es de credencial vuelve a cerrar la sesión',
    fichero: 'frontend/src/lib/api.ts',
    cambios: [
      [
        'if (error.status === 401 && !silenciarRechazo) {',
        'if (error.status >= 400 && !silenciarRechazo) {',
      ],
    ],
    muerden: [[VITEST, 'no avisa por un error que no es de credencial']],
  },
  {
    id: 'R-06',
    que: 'una tubería de CI vuelve a tapar el código de salida de la suite',
    fichero: '.github/workflows/verificacion.yml',
    cambios: [
      [
        '          set -o pipefail\n          npm test 2>&1 | tee ../salida-pruebas.txt\n          node ../scripts/recuento-pruebas.mjs backend',
        '          npm test 2>&1 | tee ../salida-pruebas.txt\n          node ../scripts/recuento-pruebas.mjs backend',
      ],
    ],
    muerden: [[VERIFICADOR, 'Toda tubería de un workflow declara pipefail']],
  },
  {
    id: 'R-01',
    que: 'el hook de rama deja de rechazar main',
    fichero: '.githooks/pre-commit',
    cambios: [['  main | s[0-9]*/*)', '  s[0-9]*/*)']],
    muerden: [[HOOK, 'main · aceptado']],
  },
  {
    id: 'agents-import',
    que: 'CLAUDE.md deja de importar AGENTS.md',
    fichero: 'CLAUDE.md',
    cambios: [['@AGENTS.md', 'AGENTS.md']],
    muerden: [[VERIFICADOR, 'ya no importa AGENTS.md']],
  },
  {
    id: 'agents-tope',
    que: 'AGENTS.md crece por encima de las 200 líneas',
    fichero: 'AGENTS.md',
    cambios: [['# AGENTS.md\n', '# AGENTS.md\n' + '\n'.repeat(200)]],
    muerden: [[VERIFICADOR, 'el tope es 200']],
  },
  {
    id: 'R-08',
    que: 'la comprobación de R-08 deja de reconocer un fix con ruptura',
    fichero: 'scripts/fix-con-prueba.mjs',
    cambios: [['/^fix(\\([^)]*\\))?!?:/', '/^fix(\\([^)]*\\))?:/']],
    muerden: [[FIX, 'fix(tasks)!: sin prueba y rompiendo']],
  },
  {
    id: 'commit-msg',
    que: 'el hook de mensaje deja de rechazar',
    fichero: '.githooks/commit-msg',
    cambios: [['  exit 1', '  exit 0']],
    muerden: [[MENSAJE, 'arreglo el bug']],
  },
  {
    // Pasó: `api.test.ts` y dos README llegaron sin formatear el 2026-09-13, el
    // día que se añadió `format:check` a CI. Nada lo comprobaba.
    id: 'formato-backend',
    que: 'un fichero del backend deja de seguir el formato del proyecto',
    fichero: 'backend/app/models/task.ts',
    cambios: [
      [
        'export type TaskStatus = (typeof TASK_STATUSES)[number]',
        'export type TaskStatus = (typeof TASK_STATUSES)[number];',
      ],
    ],
    muerden: [[formato('backend'), 'app/models/task.ts']],
  },
  {
    id: 'formato-frontend',
    que: 'un fichero del frontend deja de seguir el formato del proyecto',
    fichero: 'frontend/src/lib/lista.ts',
    cambios: [["import type { Task } from '@/lib/types'", 'import type { Task } from "@/lib/types";']],
    muerden: [[formato('frontend'), 'src/lib/lista.ts']],
  },
]

const sinColor = (texto) => texto.replace(/\x1b\[[0-9;]*m/g, '')
const lineas = (texto) => texto.split(/\r?\n/)

/**
 * Cuando algo no casa, la salida entera de lo que se ejecutó. Sin ella, un
 * «rojo por otro motivo» en CI solo se puede adivinar, y la primera ejecución
 * en Linux fue exactamente eso.
 */
function volcar(salida) {
  const resto = lineas(salida).filter((l) => l.trim())
  for (const l of resto.slice(-60)) console.log(`    | ${l}`)
}

function ejecutar({ cwd, args }) {
  const r = spawnSync(process.execPath, args, {
    cwd: join(RAIZ, cwd),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    // Sin el resumen del job: el verificador escribe en él, y aquí se ejecuta
    // una vez por mutación.
    env: { ...process.env, FORCE_COLOR: '0', GITHUB_STEP_SUMMARY: '' },
  })
  return { status: r.status, salida: sinColor(`${r.stdout ?? ''}${r.stderr ?? ''}`) }
}

if (process.argv.includes('--listar')) {
  for (const m of CATALOGO) {
    console.log(`${m.id.padEnd(22)} ${m.que} · ${m.muerden.map(([c]) => c.nombre).join(', ')}`)
  }
  process.exit(0)
}

const pedidos = process.argv.slice(2)
const elegidas = pedidos.length ? CATALOGO.filter((m) => pedidos.includes(m.id)) : CATALOGO
const desconocidos = pedidos.filter((id) => !CATALOGO.some((m) => m.id === id))
if (desconocidos.length) {
  console.error(`No están en el catálogo: ${desconocidos.join(', ')}`)
  process.exit(2)
}

const originales = new Map()
function restaurarTodo() {
  for (const [ruta, contenido] of originales) writeFileSync(ruta, contenido)
}
process.on('SIGINT', () => {
  restaurarTodo()
  process.exit(130)
})

const fallos = []

// 1. Verde sin mutar, una vez por comprobación distinta.
const base = new Map()
for (const [comprobacion] of elegidas.flatMap((m) => m.muerden)) {
  if (base.has(comprobacion.nombre)) continue
  const { status, salida } = ejecutar(comprobacion)
  base.set(comprobacion.nombre, status === 0)
  console.log(`${status === 0 ? 'verde' : 'ROJO '} sin mutar · ${comprobacion.nombre}`)
  if (status !== 0) {
    fallos.push(`${comprobacion.nombre} ya está en rojo sin mutar nada`)
    volcar(salida)
  }
}
if (fallos.length) {
  console.error(`\n${fallos.join('\n')}\nSin un verde de partida, ningún rojo demuestra nada.`)
  process.exit(1)
}

// 2 y 3. Cada mutación, aplicada exactamente, y cada comprobación en rojo por su motivo.
for (const m of elegidas) {
  const ruta = join(RAIZ, m.fichero)
  const original = readFileSync(ruta, 'utf8')
  const eol = original.includes('\r\n') ? '\r\n' : '\n'
  const conEol = (texto) => texto.replace(/\r?\n/g, eol)

  let mutado = original
  const noAplica = []
  for (const [de, a] of m.cambios) {
    const buscado = conEol(de)
    const veces = mutado.split(buscado).length - 1
    if (veces !== 1) noAplica.push(`aparece ${veces} veces: ${de.split('\n')[0].trim()}`)
    else mutado = mutado.replace(buscado, () => conEol(a))
  }
  if (noAplica.length) {
    fallos.push(`${m.id}: el catálogo ya no corresponde con ${m.fichero} (${noAplica.join('; ')})`)
    console.log(`\nNO APLICA ${m.id} · ${noAplica.join('; ')}`)
    continue
  }

  console.log(`\n${m.id} · ${m.que}`)
  originales.set(ruta, original)
  writeFileSync(ruta, mutado)
  try {
    for (const [comprobacion, motivo] of m.muerden) {
      const { status, salida } = ejecutar(comprobacion)
      if (status === 0) {
        fallos.push(`${m.id}: ${comprobacion.nombre} sigue en verde con la mutación puesta`)
        console.log(`  SOBREVIVE ${comprobacion.nombre}`)
      } else if (!lineas(salida).some((l) => comprobacion.fallo.test(l) && l.includes(motivo))) {
        fallos.push(
          `${m.id}: ${comprobacion.nombre} sale en rojo, pero ninguna línea de fallo nombra «${motivo}»`
        )
        console.log(`  ROJO POR OTRO MOTIVO ${comprobacion.nombre}`)
        volcar(salida)
      } else {
        console.log(`  muerde ${comprobacion.nombre} · ${motivo}`)
      }
    }
  } finally {
    writeFileSync(ruta, original)
    originales.delete(ruta)
    if (readFileSync(ruta, 'utf8') !== original) {
      console.error(`NO SE PUDO RESTAURAR ${m.fichero}`)
      process.exit(3)
    }
  }
}

const total = elegidas.reduce((n, m) => n + m.muerden.length, 0)
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    fallos.length
      ? `### Mutaciones: ${fallos.length} problemas\n\n${fallos.map((f) => `- ${f}`).join('\n')}\n`
      : `### Mutaciones: ${elegidas.length} mutaciones, ${total} comprobaciones en rojo por su motivo\n`
  )
}

if (fallos.length) {
  console.error(`\n${fallos.length} problemas:\n- ${fallos.join('\n- ')}`)
  process.exit(1)
}
console.log(
  `\n${elegidas.length} mutaciones, ${total} comprobaciones en rojo por su motivo, todo restaurado.`
)
