import vine from '@vinejs/vine'
import normalizeEmailModule from 'validator/lib/normalizeEmail.js'

/**
 * Solo se baja a minúsculas (design.md D2).
 *
 * `normalizeEmail` arrastra transformaciones específicas de proveedor: quitar
 * los puntos de Gmail, quitar lo que va tras el `+`, convertir dominios. Todas
 * se apagan aquí de forma explícita, porque cambian la identidad de la cuenta:
 * hay quien usa `+etiqueta` a propósito para separar su correo, y un cambio
 * pensado para arreglar un defecto de identidad no puede introducir otro.
 */
const SOLO_MINUSCULAS = {
  all_lowercase: true,
  gmail_lowercase: true,
  gmail_remove_dots: false,
  gmail_remove_subaddress: false,
  gmail_convert_googlemaildotcom: false,
  outlookdotcom_lowercase: true,
  outlookdotcom_remove_subaddress: false,
  yahoo_lowercase: true,
  yahoo_remove_subaddress: false,
  icloud_lowercase: true,
  icloud_remove_subaddress: false,
  yandex_lowercase: true,
  // Convierte yandex.com, yandex.ua, ya.ru y compañía a yandex.ru. Es una
  // conversión de dominio, igual de peligrosa que las anteriores: dejarla
  // activa reabría este mismo defecto por otra puerta.
  yandex_convert_yandexru: false,
}

/**
 * Shared rules for email and password.
 *
 * El orden importa: VineJS muta el valor según avanza, así que normalizar antes
 * hace que `unique` consulte el email ya normalizado. Al revés daría por libre
 * un email que sí existe y el índice de la base reventaría después con un 500
 * en lugar de un «ese email ya está registrado» (design.md D1).
 */
const email = () => vine.string().email().normalizeEmail(SOLO_MINUSCULAS).maxLength(254)

/**
 * La misma normalización, fuera del pipeline de validación.
 *
 * La usa la migración que normaliza las cuentas ya guardadas. Se exporta desde
 * aquí, y no se reimplementa allí, para que sea imposible que las dos
 * normalicen distinto.
 */
export function normalizeUserEmail(value: string): string {
  return normalizeEmailModule.default(value, SOLO_MINUSCULAS) as string
}
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
