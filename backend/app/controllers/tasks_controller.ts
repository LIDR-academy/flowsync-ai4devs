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
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@martin.xyz/openapi-decorators/decorators'
import {
  notFoundErrorSchema,
  taskDetailSchema,
  taskSchema,
  unauthorizedErrorSchema,
  validationErrorSchema,
  wrapData,
  wrapDataList,
} from '#openapi/task_schemas'

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
    summary: 'Listar tareas',
    description:
      'La lista compartida del espacio. Sin `status`, devuelve las pendientes y las que están ' +
      'en curso; nunca las hechas mezcladas con el resto. Ordenada de la más reciente a la más ' +
      'antigua. No incluye fecha de vencimiento ni condición de vencida.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Acota la lista a un único estado del dominio. Ausente = pendientes + en curso.',
    schema: { type: 'string', enum: [...TASK_STATUSES] },
  })
  @ApiResponse({ status: 200, description: 'Lista de tareas', schema: wrapDataList(taskSchema) })
  @ApiResponse({
    status: 401,
    description: 'Sin token de acceso válido',
    schema: unauthorizedErrorSchema,
  })
  @ApiResponse({
    status: 422,
    description: '`status` no es ninguno de los tres estados del dominio',
    schema: validationErrorSchema,
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
    summary: 'Consultar una tarea',
    description:
      'La única lectura que informa del vencimiento, y por eso la única que exige `today`. ' +
      'No comprueba quién es el responsable: cualquier cuenta con sesión ve cualquier tarea.',
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
      'Día de referencia (AAAA-MM-DD) contra el que se resuelve si la tarea está vencida. ' +
      'Obligatorio: no hay valor por defecto ni se sustituye por el reloj del servidor.',
    schema: { type: 'string', format: 'date', example: '2026-09-30' },
  })
  @ApiResponse({ status: 200, description: 'La tarea', schema: wrapData(taskDetailSchema) })
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
    description: 'Falta `today` o no es una fecha de calendario válida',
    schema: validationErrorSchema,
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
    summary: 'Crear una tarea',
    description:
      'Crea la tarea a nombre de quien la pide y en estado `pending`. Cualquier `status`, ' +
      'responsable o `dueDate` que venga en el cuerpo se ignora.',
  })
  @ApiBody({
    type: createTaskValidator,
    description: 'El título es el único dato que se admite.',
  })
  @ApiResponse({ status: 201, description: 'La tarea ya creada', schema: wrapData(taskSchema) })
  @ApiResponse({
    status: 401,
    description: 'Sin token de acceso válido',
    schema: unauthorizedErrorSchema,
  })
  @ApiResponse({
    status: 422,
    description: 'El título falta, es solo espacios o supera los 200 caracteres',
    schema: validationErrorSchema,
  })
  async store({ request, response, auth, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    // El estado va explícito y no se deja al valor por defecto de la columna:
    // el modelo recién creado no vuelve a leerse de la base de datos, así que
    // ese defecto no llegaría a la respuesta.
    const task = await Task.create({ title, status: 'pending', assigneeId: user.id })
    await task.load('assignee')

    // El estado se marca aparte y el cuerpo se devuelve: `serialize()` entrega
    // una promesa que resuelve el pipeline al devolverla, y pasársela a
    // `response.created()` deja la respuesta con el cuerpo vacío.
    response.status(201)
    return serialize(TaskTransformer.transform(task))
  }
}
