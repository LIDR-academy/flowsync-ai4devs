import Task from '#models/task'
import { setTaskDueDateValidator, toCalendarDay } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import {
  ErrorResponse,
  SetTaskDueDateBody,
  TaskDetailResponse,
  ValidationErrorResponse,
} from '#openapi/schemas'

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
      'Las tres cosas son la misma operación: enviar una fecha la pone o la sustituye, y enviar `null` la retira, que es una operación admitida y no un error. Se acepta una fecha ya pasada sin advertir nada. El título, el responsable y el estado siguen igual. Cualquier cuenta con sesión puede hacerlo sobre cualquier tarea.',
  })
  @ApiBody({ type: () => SetTaskDueDateBody })
  @ApiResponse({
    status: 200,
    description:
      'La tarea con la fecha ya actualizada y su `isOverdue` resuelto contra el `today` enviado, de modo que aplazar una tarea vencida deja de mostrarla vencida en esta misma respuesta.',
    type: () => TaskDetailResponse,
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
      '`dueDate` es una fecha imposible o mal formada, o falta `today` o no vale. La tarea conserva intacta la fecha que tuviera.',
    type: () => ValidationErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no depende de qué excepción se lanzara: el mensaje de un error inesperado lo escribe la librería que falló y describe el fallo, no el producto (ADR-0003). No lleva traza, ni rutas del disco, ni la sentencia SQL.',
    type: () => ErrorResponse,
  })
  async update({ params, request, serialize }: HttpContext) {
    // Validar antes de resolver (ADR-0004), igual que las otras cuatro.
    const { today, dueDate } = await request.validateUsing(setTaskDueDateValidator)
    const task = await Task.findOrFail(params.id)

    // El `DateTime` del validador se queda aquí: hacia dentro, una fecha de
    // vencimiento es un día en texto y nunca un instante.
    task.dueDate = dueDate === null ? null : toCalendarDay(dueDate)
    await task.save()

    // Se devuelve ya resuelta contra el día de quien pide, para que aplazar una
    // tarea vencida deje de mostrarla vencida en esta misma respuesta.
    return serialize(
      TaskDetailTransformer.transform(
        await Task.releerConResponsable(task.id),
        toCalendarDay(today)
      )
    )
  }
}
