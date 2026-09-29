import { ApiProperty } from '@foadonis/openapi/decorators'
import { TASK_STATUSES } from '#models/task'

/**
 * Esquemas reutilizables del documento OpenAPI.
 *
 * Cada clase de este fichero se publica en `components.schemas` con su propio
 * nombre y las operaciones la referencian con `$ref`, de modo que la forma de
 * una respuesta se describe una sola vez. No se instancian nunca: existen para
 * que `@foadonis/openapi` lea sus `@ApiProperty` al construir el documento.
 *
 * El tipo de cada propiedad va **siempre explícito**. La inferencia por
 * `design:type` no distingue `string | null` de `string` ni sabe nada de
 * formatos, y aquí la nulabilidad de `fullName` y de `dueDate` es justo lo que
 * hay que documentar.
 *
 * Esto es documentación, no validación: describe lo que los controladores y los
 * transformers ya devuelven hoy. Si cambia un transformer, cambia esto en el
 * mismo commit.
 */

/**
 * El responsable tal y como viaja dentro de una tarea: lo justo para
 * identificarlo en la lista. Refleja `TaskAssigneeTransformer`, que
 * deliberadamente no expone el email ni ningún otro dato de la cuenta.
 */
export class TaskAssignee {
  @ApiProperty({ type: 'number', example: 1 })
  id!: number

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'Ada Lovelace',
    description: 'Nulo cuando la cuenta se registró sin nombre. Las iniciales siguen llegando.',
  })
  fullName!: string | null

  @ApiProperty({ type: 'string', example: 'AL' })
  initials!: string
}

/**
 * La tarea tal y como la devuelven la lista, la creación y el cambio de estado
 * (`TaskTransformer`).
 *
 * NO lleva `dueDate` ni `isOverdue`, y esa ausencia es el contrato: la lista no
 * informa del vencimiento, así que ninguna vista construida sobre ella puede
 * mostrarlo.
 */
export class Task {
  @ApiProperty({ type: 'number', example: 1 })
  id!: number

  @ApiProperty({ type: 'string', maxLength: 200, example: 'Revisar el informe' })
  title!: string

  @ApiProperty({ enum: [...TASK_STATUSES], example: 'pending' })
  status!: string

  @ApiProperty({ type: () => TaskAssignee })
  assignee!: TaskAssignee

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: string

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: string
}

/**
 * La tarea con todo lo que tiene, incluidos su fecha de vencimiento y su
 * condición de vencida (`TaskDetailTransformer`). La devuelven la consulta de
 * una tarea suelta y el cambio de fecha.
 *
 * Se escribe entera y no como `extends Task`, por el mismo motivo por el que
 * `TaskDetailTransformer` no extiende `TaskTransformer`: son dos formas
 * distintas a propósito, y encadenarlas convierte «la lista no lleva el
 * vencimiento» en algo que se rompe solo con añadir un campo arriba.
 */
export class TaskDetail {
  @ApiProperty({ type: 'number', example: 1 })
  id!: number

  @ApiProperty({ type: 'string', maxLength: 200, example: 'Revisar el informe' })
  title!: string

  @ApiProperty({ enum: [...TASK_STATUSES], example: 'pending' })
  status!: string

  @ApiProperty({
    type: 'string',
    format: 'date',
    nullable: true,
    example: '2026-09-30',
    description: 'Día del calendario `AAAA-MM-DD`, sin hora ni huso. Nulo si la tarea no tiene.',
  })
  dueDate!: string | null

  @ApiProperty({
    type: 'boolean',
    description:
      'Resuelto contra el `today` de la petición: hay fecha, es anterior a ese día y el estado no es `done`.',
  })
  isOverdue!: boolean

  @ApiProperty({ type: () => TaskAssignee })
  assignee!: TaskAssignee

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt!: string

  @ApiProperty({ type: 'string', format: 'date-time' })
  updatedAt!: string
}

/**
 * El envoltorio `{ "data": ... }` que `providers/api_provider.ts` pone a toda
 * respuesta. Se documenta como parte de la forma porque el cliente lo tiene que
 * desenvolver.
 */
export class TaskResponse {
  @ApiProperty({ type: () => Task })
  data!: Task
}

export class TaskListResponse {
  @ApiProperty({ type: () => [Task] })
  data!: Task[]
}

export class TaskDetailResponse {
  @ApiProperty({ type: () => TaskDetail })
  data!: TaskDetail
}

/**
 * Cuerpo de la creación. El título es el único dato que se acepta: el estado y
 * el responsable los pone el sistema y se ignoran aunque vengan en la petición.
 */
export class CreateTaskBody {
  @ApiProperty({
    type: 'string',
    minLength: 1,
    maxLength: 200,
    example: 'Revisar el informe',
    description:
      'Se recortan los espacios de los extremos antes de comprobar la longitud: un título de solo espacios se rechaza igual que uno vacío, y pasarse de 200 es un error, nunca un recorte.',
  })
  title!: string
}

export class UpdateTaskStatusBody {
  @ApiProperty({
    enum: [...TASK_STATUSES],
    example: 'in_progress',
    description:
      'Cualquiera de los tres estados. Todas las transiciones valen, incluida la vuelta desde `done`.',
  })
  status!: string
}

export class SetTaskDueDateBody {
  @ApiProperty({
    type: 'string',
    format: 'date',
    nullable: true,
    example: '2026-09-30',
    description: '`null` retira la fecha, y es un valor legítimo del campo, no un error.',
  })
  dueDate!: string | null

  @ApiProperty({
    type: 'string',
    format: 'date',
    example: '2026-08-27',
    description:
      'Día de referencia con el que se resuelve `isOverdue` en la respuesta. Obligatorio y sin valor por defecto.',
  })
  today!: string
}

/**
 * El error de validación de VineJS: `{ "errors": [{ message, rule, field }] }`.
 * Es el cuerpo de todos los 422.
 */
export class ValidationErrorItem {
  @ApiProperty({ type: 'string', example: 'The title field must be defined' })
  message!: string

  @ApiProperty({ type: 'string', example: 'required' })
  rule!: string

  @ApiProperty({ type: 'string', example: 'title' })
  field!: string
}

export class ValidationErrorResponse {
  @ApiProperty({ type: () => [ValidationErrorItem] })
  errors!: ValidationErrorItem[]
}

/**
 * El error sin campo asociado, que es como salen el 401 y el 404: mismo sobre
 * `errors`, pero cada entrada trae solo el mensaje.
 */
export class ErrorItem {
  @ApiProperty({ type: 'string', example: 'Unauthorized access' })
  message!: string
}

export class ErrorResponse {
  @ApiProperty({ type: () => [ErrorItem] })
  errors!: ErrorItem[]
}
