const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type ErrorBody = { errors?: Array<{ message?: string }> }

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica tu conexión.', 0)
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const errorBody = body as ErrorBody | null
    const message = errorBody?.errors?.[0]?.message ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.'
    throw new ApiError(message, response.status)
  }

  return body as T
}

export function requestData<T>(path: string, init?: RequestInit, token?: string | null): Promise<T> {
  return request<{ data: T }>(path, init, token).then((body) => body.data)
}

export { request }
