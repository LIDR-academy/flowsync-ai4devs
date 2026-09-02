import Task from '#models/task'
import { updateTaskStatusValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import {
  ErrorResponse,
  TaskResponse,
  UpdateTaskStatusBody,
  ValidationErrorResponse,
} from '#openapi/schemas'

@ApiBearerAuth()
export default class TaskStatusesController {
  /**
   * El estado es lo único mutable de una tarea en este momento, y por eso
   * tiene endpoint propio en vez de colgar de un update genérico: por ese
   * update acabarían colándose el título y el responsable, que son historias
   * que todavía no se han especificado.
   *
   * Cualquier persona con sesión puede cambiar el estado de cualquier tarea,
   * en cualquier dirección. No hay permisos por responsable ni transiciones
   * prohibidas: volver de «hecho» a «pendiente» es justamente lo que arregla
   * un clic dado por error.
   */
  @ApiOperation({
    summary: 'Cambiar el estado de una tarea',
    description:
      'Cualquier cuenta con sesión cambia el estado de cualquier tarea, sea o no la responsable, y en cualquier dirección: volver de `done` a `pending` está permitido. El título y el responsable no se tocan. Responde con la forma de lista, sin fecha ni condición de vencida, así que no pide día de referencia.',
  })
  @ApiBody({ type: () => UpdateTaskStatusBody })
  @ApiResponse({
    status: 200,
    description: 'La tarea ya en el estado de destino.',
    type: () => TaskResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Falta el token o no es válido. Nada cambia.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No existe ninguna tarea con ese identificador. Se comprueba antes que el cuerpo.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 422,
    description:
      'El estado falta o no es uno de los tres. La tarea conserva el que tenía y el estado inventado no pasa a existir.',
    type: () => ValidationErrorResponse,
  })
  async update({ params, request, serialize }: HttpContext) {
    // Validar antes de resolver (ADR-0004). Un 404 afirma «te entendí y no
    // existe», y esa afirmación no se puede hacer sobre una petición que no se
    // ha entendido.
    const { status } = await request.validateUsing(updateTaskStatusValidator)
    const task = await Task.findOrFail(params.id)

    task.status = status
    await task.save()

    return serialize(TaskTransformer.transform(await Task.releerConResponsable(task.id)))
  }
}
