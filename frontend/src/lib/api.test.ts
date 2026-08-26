import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  createTask,
  getTasks,
  login,
  logout,
  onUnauthorized,
  updateTask,
} from '@/lib/api'

/**
 * `lib/api.ts` es el único punto de contacto con el backend, y donde vive la
 * lógica del frontend: desenvolver el `{ data }`, traducir los errores de
 * VineJS y desglosarlos por campo.
 *
 * Esa traducción compara cadenas literales (`rule`) contra lo que emiten las
 * dependencias del backend. Hoy nada vigila ese acoplamiento: si una
 * actualización renombra una regla, el usuario empieza a ver el mensaje
 * genérico y nadie se entera. Es **H-05**, y estas pruebas lo convierten en un
 * fallo ruidoso.
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

    const tareas = await getTasks('un-token')

    expect(tareas).toEqual([{ id: 1, title: 'Una tarea' }])
  })

  it('adjunta la credencial y el cuerpo tal como los espera el backend', async () => {
    const fetchMock = stubFetch(responde(200, { data: { id: 1 } }))

    await createTask('un-token', { title: 'Nueva' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/v1/tasks')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer un-token')
    expect(JSON.parse(init.body)).toEqual({ title: 'Nueva' })
  })
})

describe('Traducción de errores por regla', () => {
  const casos: Array<{
    rule: string
    field: string
    meta?: Record<string, unknown>
    contiene: string
  }> = [
    {
      rule: 'database.unique',
      field: 'email',
      contiene: 'Ese email ya está registrado',
    },
    {
      rule: 'sameAs',
      field: 'passwordConfirmation',
      contiene: 'Las contraseñas no coinciden',
    },
    { rule: 'email', field: 'email', contiene: 'email válida' },
    {
      rule: 'required',
      field: 'title',
      contiene: 'El título no puede estar vacío',
    },
    { rule: 'required', field: 'email', contiene: 'Falta rellenar el email' },
    { rule: 'enum', field: 'status', contiene: 'el estado no es válido' },
    {
      rule: 'minLength',
      field: 'password',
      meta: { min: 8 },
      contiene: 'al menos 8 caracteres',
    },
    {
      rule: 'maxLength',
      field: 'title',
      meta: { max: 200 },
      contiene: 'no puede superar los 200 caracteres',
    },
  ]

  it.each(casos)(
    'la regla $rule sobre $field sale en castellano',
    async ({ rule, field, meta, contiene }) => {
      stubFetch(
        responde(422, {
          errors: [{ message: 'in english', rule, field, meta }],
        }),
      )

      await expect(createTask('t', { title: 'x' })).rejects.toThrow(contiene)
    },
  )

  it('una regla que el diccionario no conoce no rompe, pero tampoco inventa', async () => {
    stubFetch(
      responde(422, {
        errors: [{ message: 'x', rule: 'regla.que.no.existe', field: 'title' }],
      }),
    )

    await expect(createTask('t', { title: 'x' })).rejects.toThrow(
      'Revisa el título',
    )
  })
})

describe('Desglose por campo', () => {
  it('coloca cada mensaje bajo su campo', async () => {
    stubFetch(
      responde(422, {
        errors: [
          { message: 'x', rule: 'email', field: 'email' },
          {
            message: 'x',
            rule: 'minLength',
            field: 'password',
            meta: { min: 8 },
          },
        ],
      }),
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
      }),
    )

    const error = await login({ email: '', password: 'b' }).catch((e) => e)

    expect(error.fieldErrors.email).toContain('Falta rellenar el email')
  })
})

/**
 * Las tres siguientes son pruebas de **implementación**, no de requisito: ni la
 * spec de `auth` ni la de `tasks` deciden qué pasa con dos errores del mismo
 * campo, con una regla desconocida o con un 500 que responde HTML. Se marcan
 * como tales para no hacerlas pasar por contrato.
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

    const error = await getTasks('caducado').catch((e) => e)

    expect(error.status).toBe(401)
    expect(error.message).toContain('sesión ha caducado')
  })

  it('un 500 que responde HTML en vez de JSON no rompe el parseo', async () => {
    stubFetch(
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError('Unexpected token <')
        },
      } as unknown as Response),
    )

    const error = await updateTask('t', 1, { status: 'done' }).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(500)
    expect(error.message).toContain('Algo ha ido mal en el servidor')
  })
})

describe('Aviso de credencial rechazada', () => {
  it('avisa cuando el sistema rechaza la credencial', async () => {
    stubFetch(responde(401, { errors: [{ message: 'Unauthorized' }] }))
    const avisos: ApiError[] = []
    const cancelar = onUnauthorized((error) => avisos.push(error))

    await getTasks('caducado').catch(() => undefined)
    cancelar()

    expect(avisos).toHaveLength(1)
    expect(avisos[0].status).toBe(401)
  })

  it('no avisa por un error que no es de credencial', async () => {
    const avisos: ApiError[] = []
    const cancelar = onUnauthorized((error) => avisos.push(error))

    stubFetch(responde(500, null))
    await getTasks('t').catch(() => undefined)

    stubFetch(vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await getTasks('t').catch(() => undefined)

    stubFetch(
      responde(422, {
        errors: [{ message: 'x', rule: 'required', field: 'title' }],
      }),
    )
    await createTask('t', { title: '' }).catch(() => undefined)

    cancelar()
    expect(avisos).toHaveLength(0)
  })

  it('cerrar sesión con el token ya revocado no avisa', async () => {
    // Salir a propósito no puede aterrizar en el login con un aviso de sesión
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

    await getTasks('caducado').catch(() => undefined)

    expect(avisos).toHaveLength(0)
  })
})
