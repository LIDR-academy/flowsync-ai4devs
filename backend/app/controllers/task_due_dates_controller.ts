import Task from '#models/task'
import { setTaskDueDateValidator, toCalendarDay } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import {
  apiErrorSchema,
  calendarDaySchema,
  taskDetailSchema,
  wrappedInData,
} from '#transformers/task_schemas'
import { ApiBearerAuth, ApiBody, ApiResponse } from '@foadonis/openapi/decorators'

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
  @ApiBody({
    // `setTaskDueDateValidator` mezcla `today` y `dueDate`, ambos `vine.date()`,
    // y el conversor a JSON Schema de VineJS no sabe representar ese tipo
    // (da `{}` y `{"type":"null"}`): se documenta a mano en su lugar.
    schema: {
      type: 'object',
      properties: {
        today: {
          ...calendarDaySchema,
          description: 'Día de referencia contra el que se resuelve `isOverdue` en la respuesta.',
        },
        dueDate: {
          ...calendarDaySchema,
          nullable: true,
          description: 'La nueva fecha, o `null` para retirarla.',
        },
      },
      required: ['today', 'dueDate'],
    },
    description:
      'Fija, cambia o retira la fecha de vencimiento. Retirarla es una operación admitida, no un error.',
  })
  @ApiResponse({
    status: 200,
    description:
      'La tarea con la fecha ya actualizada y su condición de vencida resuelta contra `today`.',
    schema: wrappedInData(taskDetailSchema),
  })
  @ApiResponse({ status: 401, description: 'No hay sesión iniciada.', schema: apiErrorSchema })
  @ApiResponse({
    status: 404,
    description: 'No existe ninguna tarea con ese id.',
    schema: apiErrorSchema,
  })
  @ApiResponse({
    status: 422,
    description: 'Falta `today`, o `dueDate` es una fecha imposible o mal formada.',
    schema: apiErrorSchema,
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
