import { TASK_STATUSES } from '#models/task'
import type { OpenAPIV3 } from 'openapi-types'

/**
 * Formas de respuesta reutilizadas por los tres controladores de tareas.
 *
 * Viven aparte de los transformers porque describen el mismo objeto desde el
 * otro lado: lo que el documento OpenAPI promete, no lo que el código produce.
 * Los campos aquí replican exactamente los `pick(...)` de cada transformer —
 * si esos cambian, esto se queda desincronizado y hay que tocarlo a mano.
 */

export const taskAssigneeSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Lo justo para identificar al responsable de una tarea. Nunca su email.',
  properties: {
    id: { type: 'integer', example: 1 },
    fullName: {
      type: 'string',
      nullable: true,
      example: 'Ada Lovelace',
      description: 'Nulo cuando la cuenta se registró sin nombre.',
    },
    initials: { type: 'string', example: 'AL' },
  },
  required: ['id', 'fullName', 'initials'],
}

export const taskSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Una tarea tal y como aparece en la lista, sin vencimiento.',
  properties: {
    id: { type: 'integer', example: 1 },
    title: { type: 'string', example: 'Revisar el informe' },
    status: { type: 'string', enum: [...TASK_STATUSES], example: 'pending' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    assignee: taskAssigneeSchema,
  },
  required: ['id', 'title', 'status', 'createdAt', 'updatedAt', 'assignee'],
}

export const taskDetailSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description: 'Una tarea suelta, con su fecha de vencimiento y su condición de vencida.',
  properties: {
    id: { type: 'integer', example: 1 },
    title: { type: 'string', example: 'Revisar el informe' },
    status: { type: 'string', enum: [...TASK_STATUSES], example: 'pending' },
    dueDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      example: '2026-09-30',
      description: 'Un día de calendario AAAA-MM-DD, o null si no tiene.',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    isOverdue: {
      type: 'boolean',
      description: 'true solo si hay fecha, es anterior a `today` y el estado no es `done`.',
    },
    assignee: taskAssigneeSchema,
  },
  required: ['id', 'title', 'status', 'dueDate', 'createdAt', 'updatedAt', 'isOverdue', 'assignee'],
}

/** Envuelve un schema en `{ data: ... }`, el sobre que aplica `ctx.serialize()`. */
export const wrapData = (schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject => ({
  type: 'object',
  properties: { data: schema },
  required: ['data'],
})

/** Igual que `wrapData`, para las respuestas cuyo `data` es una lista. */
export const wrapDataList = (schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject => ({
  type: 'object',
  properties: {
    data: { type: 'array', items: schema },
  },
  required: ['data'],
})

/**
 * `422` de VineJS: un error por campo, con la regla que lo dispara y a veces
 * metadatos propios de esa regla (p. ej. `choices` en un `enum`).
 */
export const validationErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'The title field must be defined' },
          rule: { type: 'string', example: 'required' },
          field: { type: 'string', example: 'title' },
          meta: { type: 'object', additionalProperties: true },
        },
        required: ['message', 'rule', 'field'],
      },
    },
  },
  required: ['errors'],
}

/** `401` cuando falta el token o no es válido. */
export const unauthorizedErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Unauthorized access' },
        },
        required: ['message'],
      },
    },
  },
  required: ['errors'],
}

/** `404` cuando la tarea del `:id` no existe. */
export const notFoundErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'Row not found' },
  },
  required: ['message'],
}
