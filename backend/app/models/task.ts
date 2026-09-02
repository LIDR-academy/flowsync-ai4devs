import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import { TaskSchema } from '#database/schema'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * Los tres estados que puede tener una tarea. No se añaden, ni se renombran,
 * ni se eliminan: la lista sería otra cosa si esto fuera configurable.
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

/**
 * Lo que devuelve la lista cuando no se pide ningún filtro. No es «todas»: lo
 * hecho queda fuera, que es justo el motivo por el que existe el filtro.
 *
 * Se escribe explícita y no como `TASK_STATUSES` menos `'done'`: es una
 * decisión de producto sobre qué merece ocupar la pantalla, no el resultado de
 * una resta.
 */
export const DEFAULT_LIST_STATUSES = [
  'pending',
  'in_progress',
] as const satisfies readonly TaskStatus[]

export default class Task extends TaskSchema {
  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>

  /**
   * Lo persistido, con el responsable.
   *
   * Toda escritura devuelve esto en vez del objeto que tiene en memoria. El
   * modelo recién guardado trae `updatedAt` con milisegundos y la base lo
   * guarda con precisión de segundo, así que sin releer la respuesta de la
   * escritura y la de la lectura siguiente dicen valores distintos del mismo
   * campo. Es H-14: hoy no duele porque la interfaz no pinta esas marcas, y
   * dolería en cuanto algo las compare o cachee por ellas.
   *
   * Cuesta **dos consultas**: una por la tarea y otra por el responsable, que
   * es lo que emite `preload` siempre. Antes era una -`load()` sobre el objeto
   * ya en memoria-, así que releer no sale gratis: se paga una consulta por
   * escritura a cambio de que la respuesta diga lo que hay en la base.
   *
   * El comentario anterior decía «una sola consulta, no `refresh()` más
   * `load()`, que son dos». Era falso, y lo era en cuatro documentos a la vez.
   * Medido con `DEBUG=knex:query`.
   */
  static releerConResponsable(id: number) {
    return Task.query().where('id', id).preload('assignee').firstOrFail()
  }

  /**
   * Si la tarea está vencida para quien mira desde `referenceDay`, un día del
   * calendario en formato `AAAA-MM-DD`.
   *
   * Tres condiciones y ninguna más: hay fecha, esa fecha es **anterior** al día
   * de referencia, y la tarea no está hecha. El `<` es estricto a propósito:
   * vencer hoy todavía no es estar vencida, y un `<=` incumpliría esa regla sin
   * que nada fallara ruidosamente.
   *
   * El día llega por parámetro y no de ningún reloj. Es lo que hace que dos
   * personas en husos distintos obtengan lecturas distintas y las dos sean
   * correctas, y que una tarea pase a vencida sola al cambiar el día sin que
   * nadie la haya tocado: no hay nada congelado, se decide al mirar.
   *
   * Se compara texto contra texto porque dos fechas ISO comparadas así **son**
   * la comparación de días del calendario: no hay hora, ni huso, ni instante
   * intermedio donde se cuele un día de más.
   *
   * Esta es la única definición de «vencida» del sistema. No se reimplementa en
   * ninguna otra capa, y en particular el frontend nunca compara fechas.
   */
  isOverdueOn(referenceDay: string): boolean {
    if (this.dueDate === null) return false
    // La tercera condición. Faltaba, y el comentario de arriba ya la prometía:
    // una tarea hecha con la fecha pasada llegaba marcada como vencida, y la
    // pantalla la anunciaba en rojo debajo de una cabecera que decía «Hecho».
    if (this.status === 'done') return false

    return this.dueDate < referenceDay
  }
}
