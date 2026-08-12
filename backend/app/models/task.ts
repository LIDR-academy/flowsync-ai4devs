import User from '#models/user'
import { TaskSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * Los tres estados son fijos: no hay forma de añadir, renombrar ni eliminar
 * ninguno. La columna los restringe además con un CHECK en base de datos.
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const DEFAULT_TASK_STATUS: TaskStatus = 'pending'

export default class Task extends TaskSchema {
  /**
   * El esquema generado tipa la columna como `string`; aquí se estrecha a los
   * tres valores admitidos.
   */
  declare status: TaskStatus

  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>
}
