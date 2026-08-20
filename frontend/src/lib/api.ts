import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  User,
} from '@/lib/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export const TOKEN_STORAGE_KEY = 'flowsync.token'

/**
 * El backend responde siempre en inglés. Se traduce aquí, en el único punto
 * que conoce la forma de sus errores, para que las pantallas solo pinten texto.
 */
const MESSAGES: Record<string, string> = {
  'Invalid user credentials': 'Email o contraseña incorrectos.',
  'Unauthorized access': 'Tu sesión ha caducado. Vuelve a iniciar sesión.',
  'The email has already been taken': 'Ya existe una cuenta con este email.',
  'The email field must be a valid email address': 'Introduce un email válido.',
  'The email field must be defined': 'El email es obligatorio.',
  'The password field must be defined': 'La contraseña es obligatoria.',
  'The password field must have at least 8 characters':
    'La contraseña debe tener al menos 8 caracteres.',
  'The password field must not be greater than 32 characters':
    'La contraseña no puede superar los 32 caracteres.',
  'The passwordConfirmation field must be defined': 'Repite la contraseña.',
  'The passwordConfirmation field and password field must be the same':
    'Las contraseñas no coinciden.',
  'The fullName field must be defined': 'El nombre no puede faltar.',
}

const FALLBACK_MESSAGE =
  'No se ha podido completar la operación. Inténtalo de nuevo.'
const NETWORK_MESSAGE =
  'No se ha podido conectar con el servidor. ¿Está arrancado el backend?'

function translate(message: string) {
  return MESSAGES[message] ?? message
}

interface BackendError {
  message: string
  field?: string
  rule?: string
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

function readToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Convierte el cuerpo de error del backend en un ApiError.
 *
 * Hay tres formas distintas según el caso: 422 de VineJS trae `field` por cada
 * error, mientras que 400 y 401 traen un único mensaje sin campo asociado.
 */
async function toApiError(response: Response) {
  let errors: BackendError[] = []

  try {
    const body = await response.json()
    if (Array.isArray(body?.errors)) errors = body.errors
  } catch {
    // Cuerpo vacío o no-JSON: nos quedamos con el mensaje genérico.
  }

  const fieldErrors: Record<string, string> = {}
  for (const error of errors) {
    if (error.field && !fieldErrors[error.field]) {
      fieldErrors[error.field] = translate(error.message)
    }
  }

  const summary = errors[0] ? translate(errors[0].message) : FALLBACK_MESSAGE

  return new ApiError(response.status, summary, fieldErrors)
}

async function send(path: string, init: RequestInit = {}) {
  const token = readToken()

  let response: Response
  try {
    response = await fetch(`${BASE_URL}/api/v1${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, NETWORK_MESSAGE)
  }

  if (!response.ok) throw await toApiError(response)

  return response
}

/**
 * Para los endpoints que pasan por `ctx.serialize()`, que envuelve el payload
 * bajo la clave `data`. Ojo: `/account/logout` no lo hace, devuelve el objeto
 * plano, por eso no usa esta función.
 */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await send(path, init)
  const body = await response.json()
  return body.data as T
}

export function signup(payload: SignupPayload) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload: LoginPayload) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getProfile() {
  return request<User>('/account/profile')
}

export async function logout() {
  await send('/account/logout', { method: 'POST' })
}
