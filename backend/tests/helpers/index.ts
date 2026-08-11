import User from '#models/user'

/**
 * Contador de proceso: basta para que dos usuarios creados en la misma tanda no
 * choquen en la columna `email`, que es única. No hace falta ninguna librería de
 * datos falsos para eso.
 */
let sequence = 0

const nextSequence = () => {
  sequence += 1
  return sequence
}

/**
 * Fábrica de usuarios para los tests. El email es único en cada llamada; el
 * resto de campos se puede sobrescribir.
 */
export function createUser(
  attributes: Partial<{ fullName: string | null; email: string; password: string }> = {}
) {
  const id = `${nextSequence()}-${process.pid}`

  return User.create({
    fullName: `Persona ${id}`,
    email: `persona.${id}@flowsync.test`,
    password: 'secret123',
    ...attributes,
  })
}

/**
 * Cuerpo de una respuesta sin la ambigüedad del registro tipado.
 *
 * Tuyau resuelve los tipos por patrón de ruta, así que `/api/v1/tasks` —que
 * sirve la colección en GET y una tarea en POST— llega como unión de ambas, y
 * los cuerpos de error (422, 404) no están en esa unión. En un test se sabe
 * exactamente qué respuesta se está mirando, y afirmarlo es justo su cometido.
 */
export function bodyOf(response: { body(): unknown }): any {
  return response.body()
}
