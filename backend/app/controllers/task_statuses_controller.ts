import Task from '#models/task'
import { updateTaskStatusValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@martin.xyz/openapi-decorators/decorators'
import {
  notFoundErrorSchema,
  taskSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
  wrapData,
} from '#openapi/task_schemas'

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
      'Cualquier cuenta con sesión puede cambiar el estado de cualquier tarea, en cualquier ' +
      'dirección, incluida la vuelta desde `done`. No toca el título ni el responsable.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Identificador de la tarea',
    schema: { type: 'integer' },
  })
  @ApiBody({ type: updateTaskStatusValidator })
  @ApiResponse({
    status: 200,
    description: 'La tarea ya con el nuevo estado',
    schema: wrapData(taskSchema),
  })
  @ApiResponse({
    status: 401,
    description: 'Sin token de acceso válido',
    schema: unauthorizedErrorSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'No existe una tarea con ese id',
    schema: notFoundErrorSchema,
  })
  @ApiResponse({
    status: 422,
    description: '`status` no es ninguno de los tres estados del dominio',
    schema: validationErrorSchema,
  })
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const { status } = await request.validateUsing(updateTaskStatusValidator)

    task.status = status
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
