import type Task from '#models/task'
import { BaseTransformer } from '@adonisjs/core/transformers'
import TaskAssigneeTransformer from '#transformers/task_assignee_transformer'

/**
 * Una tarea tal y como la ve quien consume la lista.
 *
 * `createdAt` y `updatedAt` no se exponen: la lista no las usa, no hay vista de
 * detalle, y publicarlas invita a derivar de ellas un orden o una señal de
 * urgencia que la especificación prohíbe. Tampoco hay ningún campo de
 * vencimiento, aquí ni en la base de datos.
 */
export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'status']),
      // Sin responsable es `null` explícito, no un identificador huérfano.
      assignee: TaskAssigneeTransformer.transform(this.resource.assignee ?? null),
    }
  }
}
