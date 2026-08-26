import type Task from '#models/task'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Del responsable solo sale lo que la fila de la lista necesita pintar.
 *
 * No se reutiliza UserTransformer anidado (design.md D7): arrastraría a la
 * lista de tareas campos que nadie pinta, y ataría dos contratos que no tienen
 * por qué cambiar juntos.
 */
export default class TaskTransformer extends BaseTransformer<Task> {
  toObject() {
    const task = this.resource

    return {
      ...this.pick(task, ['id', 'title', 'status', 'createdAt', 'updatedAt']),
      assignee: {
        id: task.assignee.id,
        fullName: task.assignee.fullName,
        initials: task.assignee.initials,
      },
    }
  }
}
