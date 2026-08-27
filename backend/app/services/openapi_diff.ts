/**
 * Compara el documento versionado con el recién regenerado y explica en qué se
 * diferencian.
 *
 * Se compara la estructura, no las líneas: el documento es JSON generado, y
 * saber que «cambió la línea 148» no dice nada, mientras que
 * `paths["/api/v1/tasks"].get.responses` sí señala qué parte del contrato se ha
 * movido.
 */

/** Cuántas diferencias se enumeran antes de resumir el resto en una cifra. */
const MAX_DIFERENCIAS_POR_GRUPO = 15

/** A partir de aquí, un valor se recorta al imprimirlo. */
const MAX_LONGITUD_VALOR = 100

function esClaveSimple(clave: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(clave)
}

function rutaHija(padre: string, clave: string, esIndice: boolean) {
  if (esIndice) {
    return `${padre}[${clave}]`
  }

  const segmento = esClaveSimple(clave) ? clave : `[${JSON.stringify(clave)}]`

  if (!padre) {
    return segmento
  }

  return segmento.startsWith('[') ? `${padre}${segmento}` : `${padre}.${segmento}`
}

/**
 * Aplana un valor a un mapa `ruta -> valor serializado`, donde cada entrada es
 * una hoja. Los objetos y arrays vacíos cuentan como hoja: si uno aparece o
 * desaparece, eso también es una diferencia del contrato.
 */
function aplanar(valor: unknown, ruta: string, destino: Map<string, string>) {
  if (valor !== null && typeof valor === 'object') {
    const entradas: [string, unknown, boolean][] = Array.isArray(valor)
      ? valor.map((item, indice) => [String(indice), item, true])
      : Object.entries(valor as Record<string, unknown>).map(([clave, item]) => [
          clave,
          item,
          false,
        ])

    if (entradas.length > 0) {
      for (const [clave, hijo, esIndice] of entradas) {
        aplanar(hijo, rutaHija(ruta, clave, esIndice), destino)
      }
      return
    }
  }

  destino.set(ruta, JSON.stringify(valor) ?? 'undefined')
}

function recortar(valor: string) {
  return valor.length > MAX_LONGITUD_VALOR ? `${valor.slice(0, MAX_LONGITUD_VALOR)}…` : valor
}

function grupo(titulo: string, rutas: string[], describir: (ruta: string) => string) {
  if (rutas.length === 0) {
    return []
  }

  const lineas = [`${titulo} (${rutas.length}):`]

  for (const ruta of rutas.slice(0, MAX_DIFERENCIAS_POR_GRUPO)) {
    lineas.push(`  ${describir(ruta)}`)
  }

  if (rutas.length > MAX_DIFERENCIAS_POR_GRUPO) {
    lineas.push(`  … y ${rutas.length - MAX_DIFERENCIAS_POR_GRUPO} más`)
  }

  return lineas
}

/**
 * Devuelve las líneas que explican la diferencia, o un array vacío si los dos
 * documentos son el mismo.
 */
export function describirDiferencias(versionado: string, regenerado: string): string[] {
  if (versionado === regenerado) {
    return []
  }

  let documentoVersionado: unknown
  let documentoRegenerado: unknown

  try {
    documentoVersionado = JSON.parse(versionado)
  } catch {
    return ['El fichero versionado no es JSON válido; regenéralo con `npm run openapi:generate`.']
  }

  try {
    documentoRegenerado = JSON.parse(regenerado)
  } catch {
    return [
      'El documento regenerado no es JSON válido: esto es un fallo del generador, no del fichero versionado.',
    ]
  }

  const antes = new Map<string, string>()
  const despues = new Map<string, string>()
  aplanar(documentoVersionado, '', antes)
  aplanar(documentoRegenerado, '', despues)

  const eliminados = [...antes.keys()].filter((ruta) => !despues.has(ruta)).sort()
  const añadidos = [...despues.keys()].filter((ruta) => !antes.has(ruta)).sort()
  const cambiados = [...antes.keys()]
    .filter((ruta) => despues.has(ruta) && antes.get(ruta) !== despues.get(ruta))
    .sort()

  const lineas = [
    ...grupo(
      'Están en el fichero versionado y ya no se generan',
      eliminados,
      (ruta) => `${ruta} = ${recortar(antes.get(ruta)!)}`
    ),
    ...grupo(
      'Se generan y no están en el fichero versionado',
      añadidos,
      (ruta) => `${ruta} = ${recortar(despues.get(ruta)!)}`
    ),
    ...grupo(
      'Han cambiado de valor',
      cambiados,
      (ruta) =>
        `${ruta}: versionado ${recortar(antes.get(ruta)!)} · regenerado ${recortar(despues.get(ruta)!)}`
    ),
  ]

  // Mismo árbol pero distintos bytes: indentación, orden de las claves o el
  // salto de línea final. No cambia el contrato, pero sí el fichero.
  if (lineas.length === 0) {
    return [
      'Los dos documentos describen lo mismo, pero el fichero no coincide byte a byte',
      '(orden de las claves, indentación o salto de línea final).',
    ]
  }

  return lineas
}
