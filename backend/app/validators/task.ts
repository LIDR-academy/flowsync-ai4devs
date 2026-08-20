import vine from '@vinejs/vine'
import { STATUSES } from '#models/task'

/**
 * Reglas compartidas por creación y actualización.
 *
 * - `title`: obligatorio siempre, también al actualizar. `.trim()` normaliza el
 *   valor guardado y hace que una cadena de solo espacios caiga en `minLength(1)`.
 *   Sin `maxLength`: el umbral de «demasiado largo» es una decisión de producto
 *   pendiente y aquí no se inventa ninguno.
 * - `status`: conjunto cerrado comparado por igualdad exacta, así que `Pendiente`
 *   o `EN CURSO` se rechazan en lugar de normalizarse.
 * - `assigneeId`: `.nullable().optional()` deja la clave fuera del objeto
 *   validado cuando no viaja y a `null` cuando viaja vacía, que es lo que
 *   permite distinguir «no mencionado» de «vaciado a propósito».
 */
const title = () => vine.string().trim().minLength(1)
const status = () => vine.enum(STATUSES).optional()
const assigneeId = () =>
  vine.number().exists({ table: 'users', column: 'id' }).nullable().optional()

/**
 * Validador para `POST /api/v1/tasks`. El título es el único dato obligatorio:
 * estado y responsable tienen valor por defecto y solo se aceptan como
 * sobrescritura.
 */
export const createTaskValidator = vine.create({
  title: title(),
  status: status(),
  assigneeId: assigneeId(),
})

/**
 * Validador para `PATCH /api/v1/tasks/:id`. Actualización parcial salvo en el
 * título, que viaja siempre.
 */
export const updateTaskValidator = vine.create({
  title: title(),
  status: status(),
  assigneeId: assigneeId(),
})
