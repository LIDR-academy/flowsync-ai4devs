import type { OpenAPIV3 } from 'openapi-types'
import { TASK_STATUSES } from '#models/task'

/**
 * Formas OpenAPI de lo que de verdad devuelven los transformers de tasks.
 * Cada objeto documenta exactamente el mismo `pick()` que su transformer:
 * si TaskTransformer, TaskDetailTransformer o TaskAssigneeTransformer cambian
 * de forma, este archivo tiene que cambiar con ellos.
 */
export const taskAssigneeSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'Lo justo para identificar al responsable: nunca su email ni ningún otro dato de acceso.',
  properties: {
    id: { type: 'integer' },
    fullName: { type: 'string', nullable: true },
    initials: { type: 'string' },
  },
  required: ['id', 'fullName', 'initials'],
}

export const taskSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    assignee: taskAssigneeSchema,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  },
  required: ['id', 'title', 'status', 'assignee', 'createdAt', 'updatedAt'],
}

export const taskDetailSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    dueDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      description: 'Un día del calendario en formato AAAA-MM-DD, sin hora ni huso horario.',
    },
    isOverdue: {
      type: 'boolean',
      description:
        'Solo cuando hay fecha, esa fecha es anterior al `today` de la petición y el estado no es done.',
    },
    assignee: taskAssigneeSchema,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time', nullable: true },
  },
  required: ['id', 'title', 'status', 'dueDate', 'isOverdue', 'assignee', 'createdAt', 'updatedAt'],
}

/** Un día del calendario tal y como lo exigen `today` y `dueDate`: AAAA-MM-DD, sin hora. */
export const calendarDaySchema: OpenAPIV3.SchemaObject = {
  type: 'string',
  format: 'date',
  example: '2026-09-30',
}

/** Forma del error que devuelve VineJS/Adonis en cualquier 401, 404 o 422 de la API. */
export const apiErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          rule: { type: 'string' },
          field: { type: 'string' },
        },
        required: ['message'],
      },
    },
  },
  required: ['errors'],
}

/** Envuelve un schema en `{ data: ... }`, el wrap que aplica `serialize()` a toda la API. */
export function wrappedInData(schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject {
  return {
    type: 'object',
    properties: { data: schema },
    required: ['data'],
  }
}
