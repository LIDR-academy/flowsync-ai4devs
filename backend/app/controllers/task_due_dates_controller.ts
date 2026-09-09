import Task from '#models/task'
import { setTaskDueDateValidator, toCalendarDay } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@martin.xyz/openapi-decorators/decorators'
import {
  notFoundErrorSchema,
  taskDetailSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
  wrapData,
} from '#openapi/task_schemas'

@ApiBearerAuth()
export default class TaskDueDatesController {
  /**
   * Fijar, cambiar y retirar la fecha de vencimiento son la misma operación, y
   * por eso comparten endpoint: quitar la fecha no es borrar un recurso, es
   * poner el valor «sin fecha», que es un valor legítimo del campo.
   *
   * Endpoint propio en vez de un update genérico de la tarea, por el mismo
   * motivo que el estado: por ahí se colarían el título y el responsable, que
   * este change no permite tocar.
   *
   * Cualquiera con sesión puede cambiar la fecha de cualquier tarea, igual que
   * el estado. No se comprueba quién es el responsable.
   */
  @ApiOperation({
    summary: 'Fijar, cambiar o retirar la fecha de vencimiento',
    description:
      'Retirar la fecha (`dueDate: null`) es una operación admitida, no un error. La respuesta ' +
      'ya viene resuelta contra `today`: aplazar una tarea vencida deja de mostrarla vencida en ' +
      'esta misma respuesta.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Identificador de la tarea',
    schema: { type: 'integer' },
  })
  @ApiQuery({
    name: 'today',
    required: true,
    description:
      'Día de referencia (AAAA-MM-DD) contra el que se resuelve la condición de vencida.',
    schema: { type: 'string', format: 'date', example: '2026-09-30' },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dueDate: {
          type: 'string',
          format: 'date',
          nullable: true,
          example: '2026-09-30',
          description: 'AAAA-MM-DD para fijarla o cambiarla; `null` para retirarla.',
        },
      },
      required: ['dueDate'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'La tarea ya con la fecha actualizada',
    schema: wrapData(taskDetailSchema),
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
    description: 'Falta `today`, o `dueDate`/`today` no es una fecha de calendario válida',
    schema: validationErrorSchema,
  })
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const { today, dueDate } = await request.validateUsing(setTaskDueDateValidator)

    // El `DateTime` del validador se queda aquí: hacia dentro, una fecha de
    // vencimiento es un día en texto y nunca un instante.
    task.dueDate = dueDate === null ? null : toCalendarDay(dueDate)
    await task.save()
    await task.load('assignee')

    // Se devuelve ya resuelta contra el día de quien pide, para que aplazar una
    // tarea vencida deje de mostrarla vencida en esta misma respuesta.
    return serialize(TaskDetailTransformer.transform(task, toCalendarDay(today)))
  }
}
