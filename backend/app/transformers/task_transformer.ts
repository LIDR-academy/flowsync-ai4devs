import type Task from '#models/task'
import { BaseTransformer } from '@adonisjs/core/transformers'
import TaskAssigneeTransformer from '#transformers/task_assignee_transformer'

export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'status', 'createdAt', 'updatedAt']),
      // El responsable va por `TaskAssigneeTransformer` y no por
      // `UserTransformer`: el segundo incluye el email y las fechas de la
      // cuenta, y el requisito «Lo que cada tarea muestra de su responsable»
      // dice que junto a una tarea no viaja ningún otro dato suyo.
      assignee: TaskAssigneeTransformer.transform(this.whenLoaded(this.resource.assignee)),
    }
  }
}
