import type {
  AuthResult,
  CreateTaskPayload,
  LoginPayload,
  SignupPayload,
  Task,
  UpdateTaskPayload,
  User,
} from '@/lib/types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

/** Forma de cada error que devuelve el backend: `{ errors: [...] }`. */
type BackendError = {
  message: string
  rule?: string
  field?: string
  meta?: Record<string, unknown>
}

/**
 * Error de API con el mensaje ya traducido y listo para pintar, más los errores
 * desglosados por campo para colocarlos bajo su input correspondiente.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const FIELD_LABELS: Record<string, string> = {
  fullName: 'el nombre',
  email: 'el email',
  password: 'la contraseña',
  passwordConfirmation: 'la confirmación de la contraseña',
  title: 'el título',
  status: 'el estado',
}

const label = (field?: string) => FIELD_LABELS[field ?? ''] ?? 'el campo'

/**
 * Traduce un error de VineJS a una frase que el usuario pueda entender.
 * Cubre todas las reglas que usa `app/validators/user.ts` en el backend.
 */
function translate(error: BackendError): string {
  const { rule, field, meta } = error

  switch (rule) {
    case 'database.unique':
      return field === 'email'
        ? 'Ese email ya está registrado. Inicia sesión en su lugar.'
        : `Ya existe un registro con ${label(field)}.`
    case 'sameAs':
      return 'Las contraseñas no coinciden.'
    case 'email':
      return 'Introduce una dirección de email válida.'
    case 'required':
      // El backend recorta los extremos antes de validar, así que un título de
      // solo espacios llega aquí como `required`. Decir "falta rellenar" ante
      // un campo que la persona sí escribió sería mentirle.
      return field === 'title'
        ? 'El título no puede estar vacío.'
        : `Falta rellenar ${label(field)}.`
    case 'enum':
      return `${label(field)} no es válido.`
    case 'minLength':
      return `${label(field)} debe tener al menos ${meta?.min} caracteres.`
    case 'maxLength':
      return `${label(field)} no puede superar los ${meta?.max} caracteres.`
    default:
      return `Revisa ${label(field)}.`
  }
}

/**
 * Convierte una respuesta de error del backend en un `ApiError`.
 */
function toApiError(status: number, body: unknown): ApiError {
  const errors = (body as { errors?: BackendError[] } | null)?.errors

  if (status === 401) {
    return new ApiError(
      'Tu sesión ha caducado. Vuelve a iniciar sesión.',
      status,
    )
  }

  // `User.verifyCredentials` lanza E_INVALID_CREDENTIALS con un 400 sin `field`.
  if (status === 400) {
    return new ApiError('El email o la contraseña no son correctos.', status)
  }

  if (status === 422 && errors?.length) {
    const fieldErrors: Record<string, string> = {}
    for (const error of errors) {
      if (error.field && !fieldErrors[error.field]) {
        fieldErrors[error.field] = translate(error)
      }
    }

    return new ApiError(translate(errors[0]), status, fieldErrors)
  }

  return new ApiError(
    'Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento.',
    status,
  )
}

/**
 * Aviso de que el sistema ha rechazado la credencial (design.md D4 de
 * `fix-defectos-abiertos`).
 *
 * Vive aquí porque este fichero es el único punto de contacto con el backend,
 * así que es el único sitio por el que pasan **todas** las respuestas. Dejar
 * que cada pantalla capturase su propio 401 es lo que producía el callejón sin
 * salida: la lista de tareas pintaba «vuelve a iniciar sesión» y nadie tocaba
 * el estado de la sesión, con lo que el guard rebotaba el login de vuelta.
 */
type UnauthorizedHandler = (error: ApiError) => void

const unauthorizedHandlers = new Set<UnauthorizedHandler>()

export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedHandlers.add(handler)
  return () => {
    unauthorizedHandlers.delete(handler)
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  token?: string | null
}

async function request<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Comprueba que el backend está arrancado.',
      0,
    )
  }

  // Un 500 puede responder HTML, así que el parseo no puede darse por hecho.
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const error = toApiError(response.status, payload)
    if (error.status === 401) {
      // Solo el 401. Un servidor caído responde 500 o no responde, y esos casos
      // no deben cerrar la sesión de nadie.
      unauthorizedHandlers.forEach((handler) => handler(error))
    }
    throw error
  }

  return payload as T
}

export function signup(payload: SignupPayload): Promise<AuthResult> {
  return request<{ data: AuthResult }>('/api/v1/auth/signup', {
    method: 'POST',
    body: payload,
  }).then((response) => response.data)
}

export function login(payload: LoginPayload): Promise<AuthResult> {
  return request<{ data: AuthResult }>('/api/v1/auth/login', {
    method: 'POST',
    body: payload,
  }).then((response) => response.data)
}

export function getProfile(token: string): Promise<User> {
  return request<{ data: User }>('/api/v1/account/profile', { token }).then(
    (response) => response.data,
  )
}

export function logout(token: string): Promise<void> {
  return request('/api/v1/account/logout', { method: 'POST', token }).then(
    () => undefined,
  )
}

/** La lista es única para el espacio: no admite filtro ni orden. */
export function getTasks(token: string): Promise<Task[]> {
  return request<{ data: Task[] }>('/api/v1/tasks', { token }).then(
    (response) => response.data,
  )
}

export function createTask(
  token: string,
  payload: CreateTaskPayload,
): Promise<Task> {
  return request<{ data: Task }>('/api/v1/tasks', {
    method: 'POST',
    body: payload,
    token,
  }).then((response) => response.data)
}

export function updateTask(
  token: string,
  id: number,
  payload: UpdateTaskPayload,
): Promise<Task> {
  return request<{ data: Task }>(`/api/v1/tasks/${id}`, {
    method: 'PATCH',
    body: payload,
    token,
  }).then((response) => response.data)
}
