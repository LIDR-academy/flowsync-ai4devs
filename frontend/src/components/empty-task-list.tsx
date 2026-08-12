import { ListTodoIcon, SearchXIcon } from 'lucide-react'
import {
  NO_FILTER,
  TASK_FILTER_LABELS,
  type TaskFilter,
} from '@/lib/task-status'

type EmptyTaskListProps = {
  filter: TaskFilter
}

/**
 * Una lista sin filas no siempre significa lo mismo, y quien mira tiene que
 * poder distinguirlo. Aquí se separan los dos vacíos que sí son vacíos:
 *
 * - sin filtro y sin nada en marcha, ya sea porque el espacio está recién
 *   estrenado o porque el equipo lo ha terminado todo;
 * - con un filtro puesto que hoy no encaja con ninguna tarea.
 *
 * El tercer caso —haber pedido un estado que no existe— no pasa por aquí a
 * propósito: eso no es una ausencia, es una petición que no tiene sentido, y
 * confundirlos es exactamente el fallo silencioso que hay que evitar.
 */
export function EmptyTaskList({ filter }: EmptyTaskListProps) {
  if (filter !== NO_FILTER) {
    return (
      <div className="px-6 py-12 text-center">
        <SearchXIcon
          className="text-muted-foreground mx-auto mb-3 size-8"
          aria-hidden="true"
        />
        <p className="font-medium">
          Ninguna tarea en «{TASK_FILTER_LABELS[filter]}»
        </p>
        <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
          El equipo no tiene nada en ese estado ahora mismo. Quita el filtro
          para volver a ver el trabajo en marcha.
        </p>
      </div>
    )
  }

  return (
    <div className="px-6 py-12 text-center">
      <ListTodoIcon
        className="text-muted-foreground mx-auto mb-3 size-8"
        aria-hidden="true"
      />
      {/*
        Esta vista deja fuera las hechas, así que se queda a cero por dos
        motivos: porque no hay ninguna tarea, o porque el equipo lo ha terminado
        todo. La API no distingue los dos casos sin darle un dato que hoy no
        da, así que el mensaje está escrito para ser cierto en ambos: explica
        qué es esto, invita a crear y no afirma que no exista nada.
      */}
      <p className="font-medium">No hay nada en marcha</p>
      <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
        Esta es la lista del equipo: todas las tareas del espacio, con quién las
        lleva y en qué estado están. Ahora mismo no hay ninguna pendiente ni en
        curso. Escribe un título arriba para poner algo en marcha.
      </p>
      <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm">
        ¿Buscas algo que ya está terminado? Filtra por «Hecho».
      </p>
    </div>
  )
}
