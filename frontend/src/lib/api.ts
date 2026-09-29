import type {
  AuthResult,
  CreateTaskPayload,
  LoginPayload,
  SignupPayload,
  Task,
  TaskDetail,
  TaskStatus,
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
  dueDate: 'la fecha de vencimiento',
  today: 'el día de hoy',
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
      return `Falta rellenar ${label(field)}.`
    case 'minLength':
      // Un mínimo de un carácter no es una longitud, es una obligación:
      // «debe tener al menos 1 caracteres» sería feo y además no diría lo
      // que de verdad pasa, que es que el campo se ha dejado en blanco.
      if (meta?.min === 1) return `Falta rellenar ${label(field)}.`
      return `${label(field)} debe tener al menos ${meta?.min} caracteres.`
    case 'maxLength':
      return `${label(field)} no puede superar los ${meta?.max} caracteres.`
    case 'date':
      // El día de referencia lo genera el propio cliente, así que este error no
      // debería verlo nadie; si aparece, lo que falla es el reloj del navegador.
      return field === 'today'
        ? 'No hemos podido determinar qué día es hoy. Recarga la página.'
        : 'Esa fecha no existe. Revisa el día, el mes y el año.'
    case 'enum': {
      // Este mensaje tiene que sonar a «lo que has pedido no existe» y nunca a
      // «no hay nada de eso»: confundir las dos cosas es exactamente el fallo
      // silencioso que el filtro por estado tiene que evitar. El `default` de
      // abajo («Revisa el estado.») no distinguiría ni una cosa ni la otra.
      const choices = Array.isArray(meta?.choices) ? meta.choices : []
      const validos = choices.length
        ? ` Los válidos son: ${choices.join(', ')}.`
        : ''

      return `No existe ${label(field)} que has pedido.${validos}`
    }
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

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT'
  body?: unknown
  token?: string | null
}

/**
 * El día de hoy de quien está mirando, en `AAAA-MM-DD`.
 *
 * Se construye a partir de los métodos locales de `Date` y **nunca** con
 * `toISOString()`, que devuelve el día en UTC: de madrugada o al otro lado del
 * meridiano ese sería otro día, y una tarea se vería vencida —o no— cuando no
 * toca. Ese es exactamente el fallo que el día de referencia explícito existe
 * para evitar, y sería absurdo reintroducirlo aquí.
 *
 * Vive en esta capa para que ninguna pantalla tenga que acordarse de mandarlo.
 */
function localToday(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
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
    throw toApiError(response.status, payload)
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

/**
 * La lista del equipo: una sola, la misma para todos, ya ordenada por la API.
 *
 * `status` se declara `string` a secas y no `TaskStatus` a propósito: el valor
 * puede venir de la URL, que la escribe cualquiera. Quien dictamina si es un
 * estado válido es el backend, no el tipo — colar aquí un `as TaskStatus`
 * sería fingir una certeza que no tenemos y cerrar el camino del 422.
 *
 * Sin `status` la ruta va pelada, que es la ausencia de filtro. Un `?status=`
 * vacío no es lo mismo y por eso no se genera nunca.
 */
export function listTasks(token: string, status?: string): Promise<Task[]> {
  const query = status ? `?${new URLSearchParams({ status })}` : ''

  return request<{ data: Task[] }>(`/api/v1/tasks${query}`, { token }).then(
    (response) => response.data,
  )
}

export function createTask(
  payload: CreateTaskPayload,
  token: string,
): Promise<Task> {
  return request<{ data: Task }>('/api/v1/tasks', {
    method: 'POST',
    body: payload,
    token,
  }).then((response) => response.data)
}

/**
 * Una tarea abierta, con su fecha y su condición de vencida ya resuelta contra
 * el día de quien mira. Ese día se manda en cada consulta, y por eso la misma
 * tarea sin tocarla aparece vencida al día siguiente.
 */
export function getTask(id: number, token: string): Promise<TaskDetail> {
  const query = new URLSearchParams({ today: localToday() })

  return request<{ data: TaskDetail }>(`/api/v1/tasks/${id}?${query}`, {
    token,
  }).then((response) => response.data)
}

/**
 * Fija, cambia o retira la fecha de vencimiento. `null` es retirarla, y es una
 * operación normal: no hay endpoint aparte para borrar.
 */
export function setTaskDueDate(
  id: number,
  dueDate: string | null,
  token: string,
): Promise<TaskDetail> {
  return request<{ data: TaskDetail }>(`/api/v1/tasks/${id}/due-date`, {
    method: 'PUT',
    body: { dueDate, today: localToday() },
    token,
  }).then((response) => response.data)
}

export function updateTaskStatus(
  id: number,
  status: TaskStatus,
  token: string,
): Promise<Task> {
  return request<{ data: Task }>(`/api/v1/tasks/${id}/status`, {
    method: 'PATCH',
    body: { status },
    token,
  }).then((response) => response.data)
}
