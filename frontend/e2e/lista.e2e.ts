import { expect, test, type Page } from '@playwright/test'
import {
  cambiarEstado,
  crearTarea,
  cuentaConSesion,
  guardarSesion,
} from './api.ts'

/**
 * El orden de la lista en pantalla (PA-3, change `lista-en-curso-primero`):
 * dónde entra una tarea recién creada, y que cambiar un estado desde la fila
 * no la mueva hasta la siguiente carga.
 *
 * Las pruebas comparten base durante la ejecución, así que cada una usa
 * títulos propios y compara el orden **relativo** de los suyos.
 */
const ordenDe = async (page: Page, titulos: string[]) => {
  const enPantalla = await page
    .locator('ul li a[href^="/tasks/"]')
    .allInnerTexts()
  return enPantalla
    .map((texto) => texto.trim())
    .filter((texto) => titulos.includes(texto))
}

test('la tarea creada entra debajo de lo que está en curso y la fila no salta al cambiar su estado', async ({
  page,
}) => {
  const sufijo = Date.now()
  const enCurso = `En curso ${sufijo}`
  const pendiente = `Pendiente ${sufijo}`
  const nueva = `Nueva ${sufijo}`
  const titulos = [enCurso, pendiente, nueva]

  const token = await cuentaConSesion()
  const idEnCurso = await crearTarea(token, enCurso)
  await cambiarEstado(token, idEnCurso, 'in_progress')
  await crearTarea(token, pendiente)

  await guardarSesion(page, token)
  await page.goto('/tasks')
  await expect(page.getByRole('link', { name: pendiente })).toBeVisible()
  expect(await ordenDe(page, titulos)).toEqual([enCurso, pendiente])

  await page.getByPlaceholder('¿Qué hay que hacer?').fill(nueva)
  await page.getByRole('button', { name: 'Crear tarea' }).click()
  await expect(page.getByRole('link', { name: nueva })).toBeVisible()
  expect(await ordenDe(page, titulos)).toEqual([enCurso, nueva, pendiente])

  const estadoDePendiente = page.getByRole('group', {
    name: `Estado de «${pendiente}»`,
  })
  await estadoDePendiente.getByRole('button', { name: 'En curso' }).click()
  await expect(
    estadoDePendiente.getByRole('button', { name: 'En curso' }),
  ).toHaveAttribute('aria-pressed', 'true')
  expect(await ordenDe(page, titulos)).toEqual([enCurso, nueva, pendiente])

  await page.reload()
  await expect(page.getByRole('link', { name: nueva })).toBeVisible()
  expect(await ordenDe(page, titulos)).toEqual([pendiente, enCurso, nueva])
})
