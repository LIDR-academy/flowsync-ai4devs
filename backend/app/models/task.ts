import User from '#models/user'
import { TaskSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { TaskStatus } from '#models/task_status'

export default class Task extends TaskSchema {
  /**
   * La columna es texto en la base de datos (design.md D1); quien impone el
   * conjunto cerrado es la validación. Aquí se estrecha el tipo para que el
   * resto del backend no maneje un string cualquiera.
   */
  declare status: TaskStatus

  @belongsTo(() => User, { foreignKey: 'assigneeId' })
  declare assignee: BelongsTo<typeof User>
}
