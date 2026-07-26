import type { LoginPayload, LoginResponse, User } from '@/lib/types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

const GENERIC_ERROR = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'

export class ApiError extends Error {
  readonly status: number
  readonly messages: string[]

  constructor(status: number, messages: string[]) {
    super(messages[0] ?? GENERIC_ERROR)
    this.name = 'ApiError'
    this.status = status
    this.messages = messages
  }
}

/**
 * AdonisJS devuelve `{ errors: [{ message, field?, rule? }] }` tanto en los 422
 * de validación como en los 400 de credenciales inválidas y los 401 de token
 * caducado. Los errores no controlados, en cambio, salen con el JSON de Youch
 * en dev y como `{ message }` en producción, así que hay que degradar.
 */
function extractMessages(payload: unknown): string[] {
  if (payload && typeof payload === 'object') {
    const { errors, message } = payload as {
      errors?: unknown
      message?: unknown
    }

    if (Array.isArray(errors)) {
      const messages = errors
        .map((error) =>
          error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : null,
        )
        .filter((message): message is string => Boolean(message))

      if (messages.length > 0) return messages
    }

    if (typeof message === 'string' && message.length > 0) return [message]
  }

  return [GENERIC_ERROR]
}

type RequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, ['No se ha podido contactar con el servidor.'])
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, extractMessages(payload))
  }

  return payload as T
}

/** Credenciales inválidas responden 400 (no 401), con `Invalid user credentials`. */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await request<{ data: LoginResponse }>(
    '/api/v1/auth/login',
    {
      method: 'POST',
      body: payload,
    },
  )

  return data
}

export async function getProfile(token: string): Promise<User> {
  const { data } = await request<{ data: User }>('/api/v1/account/profile', {
    token,
  })

  return data
}

/** Ojo: este endpoint es el único que NO envuelve la respuesta en `data`. */
export async function logout(token: string): Promise<void> {
  await request<{ message: string }>('/api/v1/account/logout', {
    method: 'POST',
    token,
  })
}
