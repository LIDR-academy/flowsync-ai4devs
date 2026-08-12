import type Task from '#models/task'
import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Vista reducida del responsable de una tarea: solo lo que la lista necesita
 * para decir quién la lleva.
 *
 * No reutiliza `UserTransformer` a propósito. Ese expone además el correo y las
 * fechas de la cuenta, datos que la lista no usa y que, una vez que el cliente
 * los consume, ya no se recortan sin romperlo.
 */
class TaskAssigneeTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, ['id', 'fullName'])
  }
}

export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'status', 'createdAt', 'updatedAt']),
      assignee: TaskAssigneeTransformer.transform(this.whenLoaded(this.resource.assignee)),
    }
  }
}
