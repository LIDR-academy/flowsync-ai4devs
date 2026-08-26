import vine from '@vinejs/vine'
import { TASK_STATUSES } from '#models/task_status'

/**
 * Guarda técnica de longitud, NO la regla de producto.
 *
 * PA-9 deja sin decidir dónde está la frontera de "demasiado largo". Este
 * número es generoso a propósito: admite con holgura cualquier frase
 * descriptiva y solo frena lo desmedido. Cuando PA-9 se resuelva, se cambia
 * aquí (design.md D6).
 *
 * Lo que sí es requisito y no depende de este número: superarlo avisa, nunca
 * guarda una versión recortada.
 */
const TITLE_MAX_LENGTH = 200

/**
 * El recorte de extremos ocurre antes de validar (design.md D5), de modo que un
 * título de solo espacios cae en la misma regla que uno vacío en vez de
 * necesitar una regla propia.
 */
const title = () => vine.string().trim().minLength(1).maxLength(TITLE_MAX_LENGTH)

/**
 * Crear una tarea acepta ÚNICAMENTE el título.
 *
 * Ni responsable ni estado: los resuelve el servidor. Aceptarlos aquí los
 * convertiría en dato de entrada falsificable y contradiría el requisito de que
 * la persona no elige ninguno de los dos (design.md D3).
 */
export const createTaskValidator = vine.create({
  title: title(),
})

/**
 * Actualizar acepta ÚNICAMENTE el estado.
 *
 * Ni título ni responsable: editar el título y reasignar son historias con
 * criterios todavía sin escribir, y una API que las admitiera las dejaría
 * implementadas de tapadillo (design.md D4).
 */
export const updateTaskValidator = vine.create({
  status: vine.enum(TASK_STATUSES),
})
