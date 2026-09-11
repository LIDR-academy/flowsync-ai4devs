const MAX_DIFF_LINES = 40

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

/**
 * Diferencia estructural entre dos documentos OpenAPI ya parseados, en vez de
 * un diff de texto sobre el JSON impreso: una clave que cambia de sitio no
 * debería leerse como "todo el fichero cambió".
 */
export function diffJson(before: Json, after: Json): string[] {
  const lines: string[] = []
  collect(before, after, '$', lines)

  if (lines.length <= MAX_DIFF_LINES) {
    return lines
  }

  const shown = lines.slice(0, MAX_DIFF_LINES)
  shown.push(`… y ${lines.length - MAX_DIFF_LINES} diferencia(s) más`)
  return shown
}

function collect(before: Json, after: Json, path: string, lines: string[]): void {
  if (before === after) return

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const key of [...keys].sort()) {
      const childPath = `${path}.${key}`
      if (!(key in before)) {
        lines.push(`+ ${childPath} = ${preview(after[key])}`)
      } else if (!(key in after)) {
        lines.push(`- ${childPath} (era ${preview(before[key])})`)
      } else {
        collect(before[key], after[key], childPath, lines)
      }
    }
    return
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length)
    for (let index = 0; index < length; index++) {
      const childPath = `${path}[${index}]`
      if (index >= before.length) {
        lines.push(`+ ${childPath} = ${preview(after[index])}`)
      } else if (index >= after.length) {
        lines.push(`- ${childPath} (era ${preview(before[index])})`)
      } else {
        collect(before[index], after[index], childPath, lines)
      }
    }
    return
  }

  lines.push(`~ ${path}: ${preview(before)} -> ${preview(after)}`)
}

function isPlainObject(value: Json): value is { [key: string]: Json } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function preview(value: Json): string {
  const text = JSON.stringify(value)
  return text.length > 80 ? `${text.slice(0, 77)}...` : text
}
