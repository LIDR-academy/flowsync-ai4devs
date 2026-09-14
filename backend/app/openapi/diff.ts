type Json = unknown

export type Diferencia = {
  ruta: string
  motivo: 'valor distinto' | 'sobra en el fichero' | 'falta en el fichero'
}

function esObjeto(valor: Json): valor is Record<string, Json> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}

/**
 * Compara el contrato versionado contra el que genera el código y devuelve las
 * rutas JSON donde difieren.
 *
 * Devuelve rutas y no un diff de texto a propósito: el documento pasa de las
 * setecientas líneas, y un diff línea a línea de un JSON reindentado no dice
 * qué parte del contrato cambió. `paths./api/v1/tasks.get.responses.200` sí.
 */
export function comparar(fichero: Json, generado: Json, ruta = ''): Diferencia[] {
  if (esObjeto(fichero) && esObjeto(generado)) {
    const claves = new Set([...Object.keys(fichero), ...Object.keys(generado)])
    const diferencias: Diferencia[] = []

    for (const clave of claves) {
      const hija = ruta ? `${ruta}.${clave}` : clave

      if (!(clave in generado)) {
        diferencias.push({ ruta: hija, motivo: 'sobra en el fichero' })
        continue
      }
      if (!(clave in fichero)) {
        diferencias.push({ ruta: hija, motivo: 'falta en el fichero' })
        continue
      }
      diferencias.push(...comparar(fichero[clave], generado[clave], hija))
    }

    return diferencias
  }

  if (Array.isArray(fichero) && Array.isArray(generado)) {
    const diferencias: Diferencia[] = []

    for (let i = 0; i < Math.max(fichero.length, generado.length); i++) {
      const hija = `${ruta}[${i}]`

      if (i >= generado.length) {
        diferencias.push({ ruta: hija, motivo: 'sobra en el fichero' })
        continue
      }
      if (i >= fichero.length) {
        diferencias.push({ ruta: hija, motivo: 'falta en el fichero' })
        continue
      }
      diferencias.push(...comparar(fichero[i], generado[i], hija))
    }

    return diferencias
  }

  if (JSON.stringify(fichero) !== JSON.stringify(generado)) {
    return [{ ruta: ruta || '(raíz)', motivo: 'valor distinto' }]
  }

  return []
}
