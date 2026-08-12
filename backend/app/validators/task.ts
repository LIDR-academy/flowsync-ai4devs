import vine from '@vinejs/vine'
import { TASK_STATUSES } from '#models/task'

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
