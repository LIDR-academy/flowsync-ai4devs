const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface ErrorPayload {
  errors?: { message: string }[]
}

function extractErrorMessage(body: unknown): string {
  const payload = body as ErrorPayload | null
  const message = payload?.errors?.map((error) => error.message).join(' ')
  return message || 'Something went wrong. Please try again.'
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  })

  const body = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(body), response.status)
  }

  return body as T
}
