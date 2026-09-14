import { expect, test } from '@playwright/test'
import { cuentaConSesion, guardarSesion } from './api.ts'

/**
 * El flujo principal, el que el PRD llama la vertical: «entro, veo en qué
 * anda el equipo, cambio el estado de lo mío en un gesto, y otra persona lo
 * ve sin preguntarme». Recorrido entero desde la pantalla de registro, sin
 * atajar nada por la API salvo la segunda cuenta, que solo mira.
 *
 * Es la única prueba que atraviesa las dos capas de punta a punta; las demás
 * de `e2e/` cubren un caso cada una. Si esta falla, el producto no se puede
 * demostrar.
 */
test('registrarse, apuntar una tarea, ponerla en curso y que otra persona la vea', async ({
  page,
  browser,
}) => {
  const sufijo = Date.now()
  const email = `flujo-${sufijo}@example.com`
  const titulo = `Revisar el informe ${sufijo}`

  // 1. Una persona se registra desde la pantalla y entra directa a la lista.
  await page.goto('/register')
  await page.getByLabel('Nombre completo').fill('Ada Lovelace')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill('secreto123')
  await page.getByLabel('Repite la contraseña').fill('secreto123')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL(/\/tasks$/)

  // 2. Apunta una tarea escribiendo solo el título. Nace a su nombre y en
  //    Pendiente, sin que se le haya pedido nada más.
  await page.getByPlaceholder('¿Qué hay que hacer?').fill(titulo)
  await page.getByRole('button', { name: 'Crear tarea' }).click()
  const fila = page.getByRole('link', { name: titulo })
  await expect(fila).toBeVisible()
  const estado = page.getByRole('group', { name: `Estado de «${titulo}»` })
  await expect(
    estado.getByRole('button', { name: 'Pendiente' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('Ada Lovelace').first()).toBeVisible()

  // 3. La pone en curso desde la propia fila, en un gesto.
  await estado.getByRole('button', { name: 'En curso' }).click()
  await expect(
    estado.getByRole('button', { name: 'En curso' }),
  ).toHaveAttribute('aria-pressed', 'true')

  // 4. Otra persona del equipo, en otro navegador, la ve en curso y a nombre
  //    de quien la apuntó, sin haber preguntado a nadie.
  const otra = await browser.newContext()
  const otraPagina = await otra.newPage()
  try {
    await guardarSesion(otraPagina, await cuentaConSesion())
    await otraPagina.goto('/tasks')
    await expect(otraPagina.getByRole('link', { name: titulo })).toBeVisible()
    await expect(
      otraPagina
        .getByRole('group', { name: `Estado de «${titulo}»` })
        .getByRole('button', { name: 'En curso' }),
    ).toHaveAttribute('aria-pressed', 'true')
  } finally {
    await otra.close()
  }
})
