import User from '#models/user'
import { TaskSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/**
 * Los tres únicos estados admitidos, en minúsculas. Es la única lista: el
 * validador la consume desde aquí para que no puedan divergir.
 */
export const STATUSES = ['pendiente', 'en curso', 'hecho'] as const

export type TaskStatus = (typeof STATUSES)[number]

export default class Task extends TaskSchema {
  static STATUSES = STATUSES

  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>
}
