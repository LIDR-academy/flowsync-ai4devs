import Task from '#models/task'
import { updateTaskStatusValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { apiErrorSchema, taskSchema, wrappedInData } from '#transformers/task_schemas'
import { ApiBearerAuth, ApiBody, ApiResponse } from '@foadonis/openapi/decorators'

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
  @ApiBody({
    type: updateTaskStatusValidator,
    description:
      'El estado de destino. Cualquier transición entre los tres vale, incluida la vuelta desde done.',
  })
  @ApiResponse({
    status: 200,
    description: 'La tarea ya con el nuevo estado; su título y su responsable no cambian.',
    schema: wrappedInData(taskSchema),
  })
  @ApiResponse({ status: 401, description: 'No hay sesión iniciada.', schema: apiErrorSchema })
  @ApiResponse({
    status: 404,
    description: 'No existe ninguna tarea con ese id.',
    schema: apiErrorSchema,
  })
  @ApiResponse({
    status: 422,
    description: '`status` no es ninguno de los tres estados del dominio.',
    schema: apiErrorSchema,
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
