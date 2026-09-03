/**
 * Diferencias entre el documento versionado y el recién regenerado.
 *
 * `openapi:check` las usa para decir *qué* ha cambiado. Un diff de líneas sobre
 * 700 líneas de JSON no distingue entre una respuesta nueva y una coma que se
 * movió; una lista de rutas JSON sí.
 */
export type DocumentDifference =
  /** El mismo sitio existe en los dos, con distinto valor. */
  | { path: string; kind: 'changed'; versioned: unknown; regenerated: unknown }
  /** Está en el versionado y ya no se genera: el documento va por detrás. */
  | { path: string; kind: 'extra'; versioned: unknown }
  /** Se genera y no está en el versionado: el documento va por detrás. */
  | { path: string; kind: 'missing'; regenerated: unknown }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Ruta legible hasta una clave. Las que son identificadores se encadenan con
 * punto y el resto van entre corchetes, que es como se leen las rutas de
 * OpenAPI: `paths["/api/v1/tasks"].get.responses["200"]`.
 */
function childPath(path: string, key: string): string {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return path === '' ? key : `${path}.${key}`
  }

  return `${path}[${JSON.stringify(key)}]`
}

function collect(
  versioned: unknown,
  regenerated: unknown,
  path: string,
  differences: DocumentDifference[]
): void {
  if (isRecord(versioned) && isRecord(regenerated)) {
    for (const key of Object.keys(versioned)) {
      if (key in regenerated) {
        collect(versioned[key], regenerated[key], childPath(path, key), differences)
      } else {
        // Una rama que sobra se reporta entera y no se desciende: si falta un
        // `responses` completo, interesa esa línea y no sus cuarenta claves.
        differences.push({ path: childPath(path, key), kind: 'extra', versioned: versioned[key] })
      }
    }

    for (const key of Object.keys(regenerated)) {
      if (!(key in versioned)) {
        differences.push({
          path: childPath(path, key),
          kind: 'missing',
          regenerated: regenerated[key],
        })
      }
    }

    return
  }

  if (Array.isArray(versioned) && Array.isArray(regenerated)) {
    for (let index = 0; index < Math.max(versioned.length, regenerated.length); index += 1) {
      const at = `${path}[${index}]`

      if (index >= regenerated.length) {
        differences.push({ path: at, kind: 'extra', versioned: versioned[index] })
      } else if (index >= versioned.length) {
        differences.push({ path: at, kind: 'missing', regenerated: regenerated[index] })
      } else {
        collect(versioned[index], regenerated[index], at, differences)
      }
    }

    return
  }

  // Aquí ya no hay nada que recorrer: o son primitivas, o uno es objeto y el
  // otro no, que también es un cambio de valor en ese punto.
  if (!Object.is(versioned, regenerated)) {
    differences.push({ path, kind: 'changed', versioned, regenerated })
  }
}

/**
 * Compara los dos documentos ya parseados y devuelve las diferencias en el
 * orden en que aparecen en el versionado. Lista vacía significa que son el
 * mismo documento, aunque el texto de los ficheros no coincida byte a byte.
 */
export function diffDocuments(versioned: unknown, regenerated: unknown): DocumentDifference[] {
  const differences: DocumentDifference[] = []
  collect(versioned, regenerated, '', differences)

  return differences
}

/**
 * Un valor recortado a una línea, para que una diferencia quepa en la consola
 * aunque el valor sea un objeto entero.
 */
function preview(value: unknown, maxLength = 80): string {
  const serialized = value === undefined ? 'undefined' : JSON.stringify(value)

  if (serialized.length <= maxLength) {
    return serialized
  }

  return `${serialized.slice(0, maxLength - 1)}…`
}

/**
 * Una diferencia en una línea, con la raíz del documento nombrada en vez de
 * como cadena vacía.
 */
export function formatDifference(difference: DocumentDifference): string {
  const path = difference.path === '' ? '(documento)' : difference.path

  switch (difference.kind) {
    case 'changed':
      return `${path}: versionado ${preview(difference.versioned)} · regenerado ${preview(difference.regenerated)}`
    case 'extra':
      return `${path}: solo en el versionado ${preview(difference.versioned)}`
    case 'missing':
      return `${path}: solo en el regenerado ${preview(difference.regenerated)}`
  }
}
