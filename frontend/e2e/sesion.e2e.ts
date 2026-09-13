import { expect, test } from '@playwright/test'
import {
  cuentaConSesion,
  guardarSesion,
  revocar,
  tokenGuardado,
} from './api.ts'

/**
 * Qué pasa con una sesión guardada al abrir la aplicación. Son los dos casos
 * que hasta el 2026-09-13 solo se habían comprobado a mano.
 */
test.describe('Arranque con una sesión guardada', () => {
  /**
   * H-37. La rehidratación no cierra la sesión ante un 401: confía en que lo
   * haga el suscriptor de `onUnauthorized`. Si ese suscriptor no está, la app
   * se queda en «cargando» para siempre, sin error. Esta prueba es la que lo
   * vería.
   */
  test('con un token revocado se llega al acceso explicando por qué', async ({
    page,
  }) => {
    const token = await cuentaConSesion()
    await revocar(token)
    await guardarSesion(page, token)

    await page.goto('/tasks')

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByText('Tu sesión ha caducado. Vuelve a iniciar sesión.'),
    ).toBeVisible()
    expect(await tokenGuardado(page)).toBeNull()
  })

  /**
   * H-38 y el escenario «Backend apagado al arrancar con sesión guardada»: la
   * sesión en memoria se cierra, pero el token se conserva y la siguiente
   * carga, con el servidor de vuelta, la restaura sin volver a entrar.
   *
   * El servidor caído se simula cortando la petición de perfil: lo que ve el
   * navegador es un fallo de red, que es lo mismo que con el backend apagado.
   */
  test('con el servidor caído se conserva el token y la sesión vuelve al recargar', async ({
    page,
  }) => {
    const token = await cuentaConSesion()
    await guardarSesion(page, token)

    await page.route('**/api/v1/account/profile', (ruta) =>
      ruta.abort('connectionrefused'),
    )
    await page.goto('/tasks')

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByText('No se pudo conectar con el servidor.', { exact: false }),
    ).toBeVisible()
    expect(await tokenGuardado(page)).toBe(token)

    await page.unroute('**/api/v1/account/profile')
    await page.goto('/tasks')

    await expect(page).toHaveURL(/\/tasks$/)
    await expect(
      page.getByRole('heading', { name: 'Tareas del equipo' }),
    ).toBeVisible()
  })
})
