import vine from '@vinejs/vine'
import { TASK_STATUSES } from '#models/task'
import type { DateTime } from 'luxon'

/**
 * El título es lo único que una tarea necesita para existir, así que es lo
 * único que se pide aquí. Responsable y estado no se aceptan: los pone el
 * sistema, y admitirlos por esta puerta permitiría crear una tarea a nombre
 * de otro.
 *
 * El orden importa: `trim()` corre antes que `minLength()`, de modo que un
 * título de solo espacios se queda vacío y se rechaza igual que si no se
 * hubiera escrito nada. El máximo se comprueba sobre el título ya recortado,
 * y superarlo es un error, nunca un recorte silencioso.
 */
export const createTaskValidator = vine.create({
  title: vine.string().trim().minLength(1).maxLength(200),
})

/**
 * El estado por el que se acota la lista. `optional()` es lo que mantiene
 * separados los dos caminos que nunca deben juntarse: no pedir filtro es una
 * cosa, y pedir uno que no existe es otra que termina en 422 señalando el
 * campo. Un estado inventado jamás sale por aquí como lista vacía.
 *
 * Llega por query string y no por cuerpo, pero se valida igual: el validador
 * corre sobre `request.all()`, que mezcla ambos.
 */
export const listTasksValidator = vine.create({
  status: vine.enum(TASK_STATUSES).optional(),
})

/**
 * Cambiar el estado es lo único que este change permite modificar de una
 * tarea, y solo a uno de los tres valores del dominio. Cualquier otro es un
 * 422, no un estado nuevo.
 */
export const updateTaskStatusValidator = vine.create({
  status: vine.enum(TASK_STATUSES),
})

/**
 * Un día del calendario, sin hora. `vine.date()` comprueba el calendario de
 * verdad y no solo la forma: `2026-02-31` encaja en cualquier patrón `AAAA-MM-DD`
 * y no existe.
 *
 * Devuelve un `DateTime` de luxon por el transform global de `start/validator.ts`,
 * pero ese objeto no sobrevive al borde del controlador: se reduce a texto
 * inmediatamente. Dentro de la aplicación una fecha de vencimiento es un día en
 * texto, nunca un instante.
 */
const calendarDay = () => vine.date({ formats: 'YYYY-MM-DD' })

/**
 * Reduce a texto el `DateTime` que devuelve el validador. Se usa `toFormat` y no
 * `toISODate()` porque el segundo se declara nulable y obligaría a un `!` que
 * aquí no significaría nada: lo que sale del validador siempre es una fecha.
 */
export const toCalendarDay = (value: DateTime): string => value.toFormat('yyyy-MM-dd')

/**
 * El día de referencia contra el que se decide si una tarea está vencida.
 *
 * Es **obligatorio y no tiene valor por defecto**, y esa es la decisión más
 * importante de todo el vencimiento. Un valor por defecto —el día del servidor—
 * sería un camino silencioso a dar la lectura equivocada a quien mire desde otro
 * huso: funcionaría en todas las pruebas hechas desde el mismo sitio y fallaría
 * solo lejos. Un 422 ruidoso vale más que ese fallo.
 */
export const taskReferenceDayValidator = vine.create({
  today: calendarDay(),
})

/**
 * Fijar, cambiar o retirar la fecha de vencimiento. `null` es un valor legítimo
 * del campo —«sin fecha»— y no un error ni la ausencia del dato.
 *
 * Lleva también el día de referencia porque la respuesta devuelve la tarea con
 * su condición de vencida ya resuelta: aplazar una tarea vencida tiene que
 * dejar de mostrarla vencida en esa misma respuesta.
 */
export const setTaskDueDateValidator = vine.create({
  today: calendarDay(),
  dueDate: calendarDay().nullable(),
})
