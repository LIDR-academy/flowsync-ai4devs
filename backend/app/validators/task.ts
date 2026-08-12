import vine from '@vinejs/vine'
import { TASK_STATUSES } from '#models/task'

/**
 * Validator para acotar la lista por estado. `status` es opcional porque su
 * ausencia no es un filtro, sino la vista por defecto. Cualquier otro valor
 * —incluida la cadena vacía de un `?status=` a medias— se rechaza señalando el
 * campo, en vez de responder una lista vacía que se leería como «no hay nada».
 */
export const listTasksValidator = vine.create({
  status: vine.enum(TASK_STATUSES).optional(),
})

/**
 * El título se recorta por los extremos ANTES de medirlo, de modo que un valor
 * de solo espacios se rechaza igual que uno vacío. Recortar los extremos es
 * distinto de recortar por longitud: un título que se pasa de 200 se rechaza
 * con un aviso, nunca se guarda acortado.
 */
const title = () => vine.string().trim().minLength(1).maxLength(200)

/**
 * Validator para crear una tarea. El título es lo único que se acepta: el
 * responsable y el estado no se pueden fijar al crear.
 */
export const createTaskValidator = vine.create({
  title: title(),
})

/**
 * Validator para cambiar el estado de una tarea.
 */
export const updateTaskStatusValidator = vine.create({
  status: vine.enum(TASK_STATUSES),
})
