import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  createTask,
  getTask,
  listTasks,
  login,
  logout,
  onUnauthorized,
  setTaskDueDate,
  updateTaskStatus,
} from '@/lib/api'

/**
 * `lib/api.ts` es el único punto de contacto con el backend, y donde vive la
 * lógica del frontend: desenvolver el `{ data }`, traducir los errores de
 * VineJS, desglosarlos por campo, y avisar cuando el sistema rechaza la
 * credencial.
 *
 * Esa traducción compara cadenas literales (`rule`) contra lo que emiten las
 * dependencias del backend. Sin estas pruebas nada vigila ese acoplamiento: si
 * una actualización renombra una regla, el usuario empieza a ver el mensaje
 * genérico y nadie se entera. Es **H-05**, y aquí se convierte en un fallo
 * ruidoso.
 *
 * **Este fichero y su runner venían de `s3/start` y no cruzaron a `s4/start`.**
 * El 2026-09-02 se portó el arreglo de H-13 -el aviso de credencial rechazada-
 * y no la prueba que lo guardaba, en el mismo commit que cerraba H-22. Cuarto
 * caso del mismo patrón, y el único cometido después de escribir la regla que
 * lo prohíbe.
 */
function responde(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response)
}

function stubFetch(fn: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Desenvolver la respuesta', () => {
  it('devuelve el contenido sin el envoltorio del serializer', async () => {
    stubFetch(responde(200, { data: [{ id: 1, title: 'Una tarea' }] }))

    const tareas = await listTasks('un-token')

    expect(tareas).toEqual([{ id: 1, title: 'Una tarea' }])
  })

  it('adjunta la credencial y el cuerpo tal como los espera el backend', async () => {
    const fetchMock = stubFetch(responde(201, { data: { id: 1 } }))

    await createTask({ title: 'Nueva' }, 'un-token')

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/tasks')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer un-token')
    expect(JSON.parse(init.body)).toEqual({ title: 'Nueva' })
  })

  it('sin filtro la ruta va pelada, y un `?status=` vacío no se genera nunca', async () => {
    // No es cosmética: `?status=` vacío llegaría al validador como cadena vacía
    // y saldría 422, cuando lo que la persona pidió es «sin filtro».
    const fetchMock = stubFetch(responde(200, { data: [] }))

    await listTasks('t')
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/tasks$/)

    await listTasks('t', 'done')
    expect(fetchMock.mock.calls[1][0]).toContain('?status=done')
  })

  it('el día de hoy viaja en cada lectura que informa del vencimiento', async () => {
    // La condición de vencida no es un dato de la tarea: es el resultado de
    // mirarla desde un día concreto, y ese día lo pone quien mira.
    const fetchMock = stubFetch(responde(200, { data: { id: 1 } }))

    await getTask(1, 't')

    expect(fetchMock.mock.calls[0][0]).toMatch(/today=\d{4}-\d{2}-\d{2}/)
  })
})

describe('Traducción de errores por regla', () => {
  const casos: Array<{
    rule: string
    field: string
    meta?: Record<string, unknown>
    contiene: string
  }> = [
    { rule: 'database.unique', field: 'email', contiene: 'Ese email ya está registrado' },
    { rule: 'sameAs', field: 'passwordConfirmation', contiene: 'Las contraseñas no coinciden' },
    { rule: 'email', field: 'email', contiene: 'email válida' },
    { rule: 'required', field: 'title', contiene: 'Falta rellenar el título' },
    { rule: 'required', field: 'email', contiene: 'Falta rellenar el email' },
    { rule: 'minLength', field: 'password', meta: { min: 8 }, contiene: 'al menos 8 caracteres' },
    { rule: 'maxLength', field: 'title', meta: { max: 200 }, contiene: 'no puede superar los 200' },
    { rule: 'date', field: 'dueDate', contiene: 'Esa fecha no existe' },
    { rule: 'date', field: 'today', contiene: 'qué día es hoy' },
  ]

  it.each(casos)(
    'la regla $rule sobre $field sale en castellano',
    async ({ rule, field, meta, contiene }) => {
      stubFetch(responde(422, { errors: [{ message: 'in english', rule, field, meta }] }))

      await expect(createTask({ title: 'x' }, 't')).rejects.toThrow(contiene)
    }
  )

  it('un mínimo de un carácter se dice como lo que es: el campo en blanco', async () => {
    stubFetch(
      responde(422, {
        errors: [{ message: 'x', rule: 'minLength', field: 'title', meta: { min: 1 } }],
      })
    )

    await expect(createTask({ title: '' }, 't')).rejects.toThrow('Falta rellenar el título')
  })

  it('una regla que el diccionario no conoce no rompe, pero tampoco inventa', async () => {
    stubFetch(
      responde(422, { errors: [{ message: 'x', rule: 'regla.que.no.existe', field: 'title' }] })
    )

    await expect(createTask({ title: 'x' }, 't')).rejects.toThrow('Revisa el título')
  })
})

/**
 * H-16 en la capa que lo cuenta.
 *
 * Un estado inventado tiene que sonar a «lo que has pedido no existe» y nunca a
 * «no hay nada de eso». Confundir las dos cosas es exactamente el fallo
 * silencioso que el filtro por estado existe para evitar, y el `default` de la
 * traducción -«Revisa el estado.»- no distinguiría ni una cosa ni la otra.
 */
describe('Un estado que no existe se explica como tal', () => {
  it('lo dice, y enumera los válidos que manda el backend', async () => {
    stubFetch(
      responde(422, {
        errors: [
          {
            message: 'x',
            rule: 'enum',
            field: 'status',
            meta: { choices: ['pending', 'in_progress', 'done'] },
          },
        ],
      })
    )

    const error = await listTasks('t', 'archivado').catch((e) => e)

    expect(error.message).toContain('No existe el estado que has pedido')
    expect(error.message).toContain('pending, in_progress, done')
    // Y nunca puede sonar a lista vacía legítima.
    expect(error.message).not.toContain('No hay')
  })

  it('sin `choices` sigue diciendo que no existe, en vez del genérico', async () => {
    stubFetch(responde(422, { errors: [{ message: 'x', rule: 'enum', field: 'status' }] }))

    const error = await listTasks('t', 'archivado').catch((e) => e)

    expect(error.message).toContain('No existe el estado que has pedido')
    expect(error.message).not.toContain('Revisa el estado')
  })
})

describe('Desglose por campo', () => {
  it('coloca cada mensaje bajo su campo', async () => {
    stubFetch(
      responde(422, {
        errors: [
          { message: 'x', rule: 'email', field: 'email' },
          { message: 'x', rule: 'minLength', field: 'password', meta: { min: 8 } },
        ],
      })
    )

    const error = await login({ email: 'a', password: 'b' }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(Object.keys(error.fieldErrors)).toEqual(['email', 'password'])
    expect(error.fieldErrors.email).toContain('email válida')
    expect(error.fieldErrors.password).toContain('al menos 8 caracteres')
  })

  it('con dos errores del mismo campo se queda con el primero', async () => {
    stubFetch(
      responde(422, {
        errors: [
          { message: 'x', rule: 'required', field: 'email' },
          { message: 'x', rule: 'email', field: 'email' },
        ],
      })
    )

    const error = await login({ email: '', password: 'b' }).catch((e) => e)

    expect(error.fieldErrors.email).toContain('Falta rellenar el email')
  })
})

/**
 * Las de aquí abajo son pruebas de **implementación**, no de requisito: ni la
 * spec de `auth` ni la de `tasks` deciden qué pasa con una regla desconocida o
 * con un 500 que responde HTML. Se marcan como tales para no hacerlas pasar por
 * contrato.
 */
describe('Errores que no vienen de la validación', () => {
  it('un fallo de red se distingue de uno de credenciales y lo dice', async () => {
    stubFetch(vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await login({ email: 'a', password: 'b' }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
    expect(error.message).toContain('No se pudo conectar con el servidor')
  })

  it('unas credenciales incorrectas no se confunden con un fallo de red', async () => {
    stubFetch(responde(400, { errors: [{ message: 'Invalid credentials' }] }))

    const error = await login({ email: 'a', password: 'b' }).catch((e) => e)

    expect(error.status).toBe(400)
    expect(error.message).toContain('El email o la contraseña no son correctos')
  })

  it('una sesión caducada se explica como tal', async () => {
    stubFetch(responde(401, { errors: [{ message: 'Unauthorized' }] }))

    const error = await listTasks('caducado').catch((e) => e)

    expect(error.status).toBe(401)
    expect(error.message).toContain('sesión ha caducado')
  })

  /**
   * El 500 que ADR-0003 dejó cerrado, visto desde el cliente.
   *
   * El backend responde `{ errors: [{ message: 'Error interno del servidor' }] }`
   * y sin `field`. El cliente no puede desglosarlo por campo ni repetir ese
   * mensaje: cae al genérico, que es lo correcto.
   */
  it('un 500 del backend sale como fallo del servidor, sin desglose', async () => {
    stubFetch(responde(500, { errors: [{ message: 'Error interno del servidor' }] }))

    const error = await updateTaskStatus(1, 'done', 't').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.message).toContain('Algo ha ido mal en el servidor')
    // Sin desglose: el 500 no trae `field`, así que no hay nada que colocar
    // bajo ningún campo del formulario. `fieldErrors` existe siempre y aquí
    // está vacío, que no es lo mismo que no existir.
    expect(error.fieldErrors).toEqual({})
  })

  it('un 500 que responde HTML en vez de JSON no rompe el parseo', async () => {
    stubFetch(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError('Unexpected token <')
        },
      } as unknown as Response)
    )

    const error = await updateTaskStatus(1, 'done', 't').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.message).toContain('Algo ha ido mal en el servidor')
  })
})

/**
 * H-13. Es lo que porté el 2026-09-02 sin traer esta prueba detrás.
 *
 * Cualquier 401 posterior al arranque cierra la sesión, venga de la operación
 * que venga. Y **solo** el 401: un servidor caído o un corte de red no pueden
 * cerrar la sesión de nadie, porque el token puede seguir siendo bueno.
 */
describe('Aviso de credencial rechazada', () => {
  it('avisa cuando el sistema rechaza la credencial', async () => {
    stubFetch(responde(401, { errors: [{ message: 'Unauthorized' }] }))
    const avisos: ApiError[] = []
    const cancelar = onUnauthorized((error) => avisos.push(error))

    await listTasks('caducado').catch(() => undefined)
    cancelar()

    expect(avisos).toHaveLength(1)
    expect(avisos[0].status).toBe(401)
  })

  it('no avisa por un error que no es de credencial', async () => {
    const avisos: ApiError[] = []
    const cancelar = onUnauthorized((error) => avisos.push(error))

    stubFetch(responde(500, null))
    await listTasks('t').catch(() => undefined)

    stubFetch(vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await listTasks('t').catch(() => undefined)

    stubFetch(responde(422, { errors: [{ message: 'x', rule: 'required', field: 'title' }] }))
    await createTask({ title: '' }, 't').catch(() => undefined)

    stubFetch(responde(404, { errors: [{ message: 'No se ha encontrado' }] }))
    await setTaskDueDate(99, '2026-09-30', 't').catch(() => undefined)

    cancelar()
    expect(avisos).toHaveLength(0)
  })

  it('cerrar sesión con el token ya revocado no avisa', async () => {
    // Salir a propósito no puede aterrizar en el acceso con un aviso de sesión
    // caducada: la persona ya sabe que ha salido.
    stubFetch(responde(401, { errors: [{ message: 'Unauthorized' }] }))
    const avisos: ApiError[] = []
    const cancelar = onUnauthorized((error) => avisos.push(error))

    await logout('token-ya-revocado').catch(() => undefined)
    cancelar()

    expect(avisos).toHaveLength(0)
  })

  it('deja de avisar una vez cancelada la suscripción', async () => {
    stubFetch(responde(401, { errors: [{ message: 'Unauthorized' }] }))
    const avisos: ApiError[] = []
    onUnauthorized((error) => avisos.push(error))()

    await listTasks('caducado').catch(() => undefined)

    expect(avisos).toHaveLength(0)
  })
})
