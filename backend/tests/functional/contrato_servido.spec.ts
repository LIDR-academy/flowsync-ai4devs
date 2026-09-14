import { contratoServido, contratoYaConstruido } from '#openapi/document'
import { test } from '@japa/runner'

/**
 * El documento que sirven `/api.json` y `/api.yaml` se construye una sola vez
 * por proceso, porque `buildDocument()` acumula sobre la metadata de los
 * decoradores en cada llamada (H-26).
 *
 * Construirlo una vez no bastaba si la caché se rellenaba **después** del
 * `await`: dos peticiones que llegaran a la vez al arrancar veían la caché
 * vacía y lanzaban dos construcciones solapadas. Medido llamando a
 * `buildDocument()` cuatro veces a la vez: las cuatro devuelven el mismo
 * documento con nueve parámetros repetidos, y ese quedaba cacheado para toda
 * la vida del proceso. Era H-35, y lo encontró el revisor de CI.
 *
 * Esta prueba llama a la función directamente y no por HTTP a propósito. En
 * el servidor de pruebas los controladores ya están importados, la
 * construcción termina en microtareas y la segunda petición no llega a
 * solaparse: por HTTP la carrera no se reproduce y la prueba pasaría con el
 * defecto puesto.
 *
 * Tiene que ser **la primera** que construye el documento en el proceso de
 * pruebas: si otra lo calentara antes, esta partiría de la caché llena y
 * dejaría de ver la carrera. Hasta el 2026-09-12 eso lo decía solo este
 * comentario, y el revisor de CI señaló que una prueba futura contra
 * `/api.json` la neutralizaría en silencio. Ahora lo exige, y en ese caso
 * falla diciendo por qué.
 */
test.group('Contrato | el documento servido', () => {
  test('peticiones simultáneas al arrancar reciben un documento sin repetidos', async ({
    assert,
  }) => {
    assert.isFalse(
      contratoYaConstruido(),
      'otra prueba de este proceso ya construyó el documento servido, así que esta ya no puede ver la carrera de H-35; muévela o sepárala'
    )

    const servidos = await Promise.all([1, 2, 3, 4].map(() => contratoServido()))

    const repetidos: string[] = []
    const documento = JSON.parse(servidos[0]) as {
      paths: Record<string, Record<string, { parameters?: { name: string; in: string }[] }>>
    }
    for (const [ruta, operaciones] of Object.entries(documento.paths)) {
      for (const [metodo, operacion] of Object.entries(operaciones)) {
        const vistos = new Set<string>()
        for (const { name, in: donde } of operacion.parameters ?? []) {
          const clave = `${name} en ${donde}`
          if (vistos.has(clave)) repetidos.push(`${metodo.toUpperCase()} ${ruta} · ${clave}`)
          vistos.add(clave)
        }
      }
    }

    assert.deepEqual(repetidos, [])
    assert.lengthOf(new Set(servidos), 1)
  })
})
