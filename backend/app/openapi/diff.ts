/**
 * Comparación de dos documentos OpenAPI ya parseados.
 *
 * Un diff de líneas sobre un JSON de cientos de líneas no dice qué ha cambiado
 * del contrato: dice en qué línea. Aquí la unidad es la ruta JSON, así que lo
 * que se lee es «esta operación ya no responde 422», no «la línea 318 cambió».
 */

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type DifferenceKind = 'distinto' | 'sobra' | 'falta'

export type Difference = {
  kind: DifferenceKind
  /** Ruta JSON hasta el valor, p. ej. `paths./api/v1/tasks.get.responses.200` */
  path: string
  /** Valor en el fichero versionado. Ausente cuando `kind` es `falta`. */
  versioned?: JsonValue
  /** Valor en el documento recién generado. Ausente cuando `kind` es `sobra`. */
  generated?: JsonValue
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function join(path: string, segment: string) {
  return path === '' ? segment : `${path}.${segment}`
}

/**
 * Compara `versioned` (lo que hay en `docs/api/openapi.json`) contra
 * `generated` (lo que el código produce hoy) y devuelve las diferencias en
 * orden de recorrido del documento.
 *
 * Cuando falta o sobra una rama entera se informa una sola vez de la rama, sin
 * bajar dentro: enumerar las cuarenta claves de una operación que ya no existe
 * no ayuda a nadie.
 */
export function diffDocuments(versioned: JsonValue, generated: JsonValue): Difference[] {
  const differences: Difference[] = []

  function walk(left: JsonValue, right: JsonValue, path: string) {
    if (isObject(left) && isObject(right)) {
      for (const key of Object.keys(left)) {
        if (key in right) {
          walk(left[key], right[key], join(path, key))
        } else {
          differences.push({ kind: 'sobra', path: join(path, key), versioned: left[key] })
        }
      }

      for (const key of Object.keys(right)) {
        if (!(key in left)) {
          differences.push({ kind: 'falta', path: join(path, key), generated: right[key] })
        }
      }

      return
    }

    if (Array.isArray(left) && Array.isArray(right)) {
      for (let index = 0; index < Math.max(left.length, right.length); index++) {
        const at = join(path, `[${index}]`)

        if (index >= right.length) {
          differences.push({ kind: 'sobra', path: at, versioned: left[index] })
        } else if (index >= left.length) {
          differences.push({ kind: 'falta', path: at, generated: right[index] })
        } else {
          walk(left[index], right[index], at)
        }
      }

      return
    }

    // Tipos distintos (un objeto donde había una lista, p. ej.) o valores
    // escalares que no coinciden: es el mismo hallazgo, un valor cambiado.
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      differences.push({ kind: 'distinto', path, versioned: left, generated: right })
    }
  }

  walk(versioned, generated, '')

  return differences
}

/**
 * Recorta un valor para poder imprimirlo en una línea. Un esquema entero como
 * valor «esperado» llenaría la pantalla y taparía el resto de diferencias.
 */
export function formatValue(value: JsonValue | undefined, maxLength = 80) {
  const serialized = JSON.stringify(value ?? null)

  return serialized.length > maxLength ? `${serialized.slice(0, maxLength - 1)}…` : serialized
}

/**
 * Una línea por diferencia, con la ruta JSON delante del detalle.
 */
export function describeDifference(difference: Difference) {
  switch (difference.kind) {
    case 'distinto':
      return `distinto                  ${difference.path}: ${formatValue(difference.versioned)} → ${formatValue(difference.generated)}`
    case 'sobra':
      return `sobra en el versionado    ${difference.path}: ${formatValue(difference.versioned)}`
    case 'falta':
      return `falta en el versionado    ${difference.path}: ${formatValue(difference.generated)}`
  }
}
