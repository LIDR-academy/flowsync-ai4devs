import Task, { DEFAULT_LIST_STATUSES, TASK_STATUSES } from '#models/task'
import {
  createTaskValidator,
  listTasksValidator,
  taskReferenceDayValidator,
  toCalendarDay,
} from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@foadonis/openapi/decorators'
import {
  CreateTaskBody,
  ErrorResponse,
  TaskDetailResponse,
  TaskListResponse,
  TaskResponse,
  ValidationErrorResponse,
} from '#openapi/schemas'

@ApiBearerAuth()
export default class TasksController {
  /**
   * La lista del espacio: una sola, la misma para todo el mundo, sin filtrar
   * por quién la pide. El responsable va precargado en la misma consulta —
   * es el 100 % de los accesos y resolverlo tarea a tarea sería el error caro
   * y evidente aquí.
   *
   * Admite acotarse por estado, y aquí hay tres caminos que no se cruzan:
   * un estado válido devuelve solo el suyo (aunque no haya ninguna, y eso es
   * una lista vacía legítima, no un error); no pedir nada devuelve lo que
   * sigue abierto; y un estado que no existe ni siquiera llega, porque el
   * validador lo corta antes con un 422. Devolverlo vacío sería el fallo
   * silencioso que esta lista no se puede permitir.
   *
   * Acotar es solo lectura: ninguna tarea cambia por consultarla.
   */
  @ApiOperation({
    summary: 'La lista compartida del espacio',
    description:
      'Devuelve el mismo conjunto para cualquier cuenta que pida el mismo alcance, de la más reciente a la más antigua y sin paginar. Sin acotar, el alcance son las pendientes y las que están en curso; las hechas se quedan fuera y solo se alcanzan pidiéndolas por su estado. No informa del vencimiento, y por eso no pide día de referencia.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [...TASK_STATUSES],
    description:
      'Acota la lista a un estado. El estado es la única dimensión por la que se puede acotar. Sin él llegan `pending` e `in_progress`. Un valor que no sea uno de los tres se rechaza con `422` señalando el campo, y **nunca** devuelve una lista vacía: confundir «no existe ese estado» con «no hay nada en ese estado» es el fallo silencioso que este filtro existe para evitar.',
  })
  @ApiResponse({
    status: 200,
    description:
      'La lista del alcance pedido, entera. Ninguna tarea trae fecha ni condición de vencida.',
    type: () => TaskListResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Falta el token o no es válido. No se devuelve ninguna tarea.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 422,
    description:
      'El estado por el que se pide acotar no es ninguno de los tres del dominio. Se rechaza señalando el campo, y **no** se devuelve una lista vacía: confundir «no existe ese estado» con «no hay nada en ese estado» es el fallo silencioso que este filtro existe para evitar.',
    type: () => ValidationErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no depende de qué excepción se lanzara: el mensaje de un error inesperado lo escribe la librería que falló y describe el fallo, no el producto (ADR-0005). No lleva traza, ni rutas del disco, ni la sentencia SQL.',
    type: () => ErrorResponse,
  })
  async index({ request, serialize }: HttpContext) {
    const { status } = await request.validateUsing(listTasksValidator)

    const query = Task.query().preload('assignee')

    if (status) {
      query.where('status', status)
    } else {
      // Sin filtro no es «todas»: lo hecho se queda fuera.
      query.whereIn('status', [...DEFAULT_LIST_STATUSES])
    }

    const tasks = await query
      .orderBy('createdAt', 'desc')
      // Desempate estable: dos tareas creadas en el mismo milisegundo tienen
      // la misma marca de tiempo, y sin esto su orden relativo sería el que
      // quisiera la base de datos.
      .orderBy('id', 'desc')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * Una tarea suelta, con todo lo que tiene: es la única lectura que informa
   * del vencimiento, y por eso es la única que exige el día de quien mira.
   */
  @ApiOperation({
    summary: 'Una tarea suelta, con su vencimiento resuelto',
    description:
      'Devuelve la tarea entera —fecha de vencimiento incluida, o su ausencia— con `isOverdue` ya resuelto contra el día que indique quien pregunta. No comprueba quién es el responsable: una tarea ajena llega igual que una propia, y mirarla no la cambia.',
  })
  @ApiQuery({
    name: 'today',
    required: true,
    schema: { type: 'string', format: 'date' },
    example: '2026-08-27',
    description:
      'Día de referencia `AAAA-MM-DD` contra el que se decide el vencimiento. Obligatorio y sin valor por defecto: el sistema no sustituye el día que falte por el de su propio reloj.',
  })
  @ApiResponse({
    status: 200,
    description: 'La tarea, con su fecha de vencimiento y su condición de vencida.',
    type: () => TaskDetailResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Falta el token o no es válido. No se devuelve ninguna tarea.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'No existe ninguna tarea con ese identificador.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Falta `today` o no es una fecha válida. No se devuelve ninguna tarea.',
    type: () => ValidationErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no depende de qué excepción se lanzara: el mensaje de un error inesperado lo escribe la librería que falló y describe el fallo, no el producto (ADR-0005). No lleva traza, ni rutas del disco, ni la sentencia SQL.',
    type: () => ErrorResponse,
  })
  async show({ params, request, serialize }: HttpContext) {
    const { today } = await request.validateUsing(taskReferenceDayValidator)
    const task = await Task.findOrFail(params.id)
    await task.load('assignee')

    return serialize(TaskDetailTransformer.transform(task, toCalendarDay(today)))
  }

  /**
   * Crear cuesta un título. El responsable y el estado no se leen de la
   * petición ni aunque vengan: los pone el sistema.
   */
  @ApiOperation({
    summary: 'Crear una tarea con solo el título',
    description:
      'El título es el único dato que se lee. La tarea nace en `pending` y a nombre de la cuenta dueña del token: un `status` o un responsable enviados en el cuerpo se ignoran, no se rechazan. Tampoco admite fecha de vencimiento, que se pone después con `PUT /tasks/{id}/due-date`.',
  })
  @ApiBody({ type: () => CreateTaskBody })
  @ApiResponse({
    status: 201,
    description: 'La tarea ya creada, en `pending` y a nombre de quien la envió.',
    type: () => TaskResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Falta el token o no es válido. No se crea ninguna tarea.',
    type: () => ErrorResponse,
  })
  @ApiResponse({
    status: 422,
    description:
      'El título falta, está vacío, es solo espacios o pasa de 200 caracteres. No se crea ninguna tarea ni se guarda una versión recortada.',
    type: () => ValidationErrorResponse,
  })
  @ApiResponse({
    status: 500,
    description:
      'Algo falló y no estaba previsto. El cuerpo es siempre el mismo y no depende de qué excepción se lanzara: el mensaje de un error inesperado lo escribe la librería que falló y describe el fallo, no el producto (ADR-0005). No lleva traza, ni rutas del disco, ni la sentencia SQL.',
    type: () => ErrorResponse,
  })
  async store({ request, response, auth, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    // El estado va explícito y no se deja al valor por defecto de la columna:
    // el modelo recién creado no vuelve a leerse de la base de datos, así que
    // ese defecto no llegaría a la respuesta.
    const task = await Task.create({ title, status: 'pending', assigneeId: user.id })

    // El estado se marca aparte y el cuerpo se devuelve: `serialize()` entrega
    // una promesa que resuelve el pipeline al devolverla, y pasársela a
    // `response.created()` deja la respuesta con el cuerpo vacío.
    response.status(201)
    return serialize(TaskTransformer.transform(await Task.releerConResponsable(task.id)))
  }
}
