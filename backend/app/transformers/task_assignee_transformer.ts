import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * El responsable de una tarea, reducido a lo justo para pintarlo por su nombre.
 *
 * No se reutiliza `UserTransformer` a propósito: ese expone `email`, `createdAt`
 * y `updatedAt`, y una lista compartida no tiene por qué repartir los datos de
 * cuenta de nadie.
 */
export default class TaskAssigneeTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, ['id', 'fullName', 'initials'])
  }
}
