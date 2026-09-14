import { defineConfig, devices } from '@playwright/test'

/**
 * Pruebas de navegador: lo que solo se observa en pantalla.
 *
 * El backend arranca con `NODE_ENV=test`, así que escribe en la base de
 * pruebas y **nunca en la de desarrollo** (ADR-0003), y escucha en el puerto de
 * `.env.test`. Antes de arrancar recrea las tablas y al terminar las deshace
 * (`e2e/teardown.ts`), para no dejar filas que rompan la suite de Japa, que usa
 * el mismo fichero. Lanzar las dos a la vez falla por el puerto, que es un
 * fallo ruidoso y no uno silencioso.
 *
 * Sin reintentos: una prueba de navegador que solo pasa a la segunda es una
 * prueba flaky, y un reintento la esconde.
 */
export const BACKEND = 'http://localhost:3334'
const FRONTEND = 'http://localhost:5174'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  workers: 1,
  retries: 0,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  globalTeardown: './e2e/teardown.ts',
  use: {
    baseURL: FRONTEND,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Sin `migration:fresh`, que regenera `database/schema.ts` a partir de la
      // base: es un fichero versionado, y el `reset` del teardown lo dejó vacío
      // la primera vez que se ejecutaron estas pruebas. `--no-schema-generate`
      // en los dos pasos, y CI comprueba que el fichero sale intacto.
      command:
        'node ace migration:reset --force --no-schema-generate && node ace migration:run --force --no-schema-generate && node ace serve',
      cwd: '../backend',
      env: { NODE_ENV: 'test' },
      url: `${BACKEND}/`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npx vite --port 5174 --strictPort',
      env: { VITE_API_URL: BACKEND },
      url: FRONTEND,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
