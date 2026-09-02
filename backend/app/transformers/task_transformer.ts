import type Task from '#models/task'
import { BaseTransformer } from '@adonisjs/core/transformers'
import TaskAssigneeTransformer from '#transformers/task_assignee_transformer'

/**
 * La tarea tal y como la lleva la lista.
 *
 * El responsable sale por `TaskAssigneeTransformer` y no por `UserTransformer`.
 * No es equivalente: `UserTransformer` incluye el email y las fechas de la
 * cuenta, y el requisito «Lo que cada tarea muestra de su responsable» dice que
 * junto a la tarea no viaja ningún otro dato de esa cuenta, «en particular su
 * email», y lo dice para la tarea suelta y para la lista.
 */
export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'status', 'createdAt', 'updatedAt']),
      assignee: TaskAssigneeTransformer.transform(this.whenLoaded(this.resource.assignee)),
    }
  }
}
