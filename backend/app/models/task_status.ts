/**
 * Los tres estados del MVP, como conjunto cerrado.
 *
 * Punto único de declaración en el backend: el validador y cualquier otra capa
 * derivan de aquí, nunca repiten los literales.
 *
 * Los identificadores son estables e independientes del idioma a propósito
 * (design.md D2). El rótulo en castellano que ve la persona vive solo en la
 * capa de presentación del frontend, y no se usa nunca como identificador.
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

/**
 * Estado con el que nace una tarea. Lo fija el servidor: quien la crea no lo
 * elige en ningún momento.
 */
export const DEFAULT_TASK_STATUS: TaskStatus = 'pending'
