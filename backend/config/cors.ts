import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  /**
   * Enable or disable CORS handling globally.
   */
  enabled: true,

  /**
   * In development, allow every origin to simplify local front/backend setup.
   * In production, keep an explicit allowlist (empty by default, so no
   * cross-origin browser access is allowed until configured).
   *
   * Y en el entorno de pruebas también: las pruebas de navegador de
   * `frontend/e2e/` levantan el backend con `NODE_ENV=test` -para que escriba
   * en la base de pruebas y nunca en la de desarrollo- y el frontend en otro
   * puerto. Sin esto el navegador bloquea cada llamada. Producción no cambia.
   */
  origin: app.inDev || app.inTest ? true : [],

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
