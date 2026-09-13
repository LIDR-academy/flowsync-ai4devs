import type { Page } from '@playwright/test'
import { BACKEND } from '../playwright.config.ts'

/**
 * Preparar el estado por la API y comprobar en pantalla. Crear tareas pulsando
 * botones haría cada prueba lenta y la ataría a pantallas que no son las que
 * prueba.
 */
const API = `${BACKEND}/api/v1`
const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

let secuencia = 0

async function peticion<T>(
  ruta: string,
  init: RequestInit & { token?: string } = {},
) {
  const { token, headers, ...resto } = init
  const respuesta = await fetch(`${API}${ruta}`, {
    ...resto,
    headers: {
      ...JSON_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  if (!respuesta.ok) {
    throw new Error(
      `${init.method ?? 'GET'} ${ruta} respondió ${respuesta.status}: ${await respuesta.text()}`,
    )
  }
  return (await respuesta.json()) as T
}

/** Una cuenta nueva con su token. El email es único por ejecución. */
export async function cuentaConSesion() {
  const email = `e2e-${Date.now()}-${secuencia++}@example.com`
  const { data } = await peticion<{ data: { token: string } }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Ada Lovelace',
      email,
      password: 'secreto123',
      passwordConfirmation: 'secreto123',
    }),
  })
  return data.token
}

export async function crearTarea(token: string, title: string) {
  const { data } = await peticion<{ data: { id: number } }>('/tasks', {
    method: 'POST',
    token,
    body: JSON.stringify({ title }),
  })
  return data.id
}

export async function cambiarEstado(token: string, id: number, status: string) {
  await peticion(`/tasks/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  })
}

export async function revocar(token: string) {
  await peticion('/account/logout', { method: 'POST', token })
}

/** Deja el token guardado como lo dejaría una visita anterior. */
export async function guardarSesion(page: Page, token: string) {
  await page.goto('/login')
  await page.evaluate(
    (valor) => localStorage.setItem('flowsync.token', valor),
    token,
  )
}

export const tokenGuardado = (page: Page) =>
  page.evaluate(() => localStorage.getItem('flowsync.token'))
