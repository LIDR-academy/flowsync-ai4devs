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
 * - sin filtro y sin nada que enseñar, que es el espacio recién estrenado;
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
      <p className="font-medium">Aquí no hay nada todavía</p>
      <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
        Esta es la lista del equipo: todas las tareas del espacio, con quién las
        lleva y en qué estado están. Escribe un título arriba y crea la primera.
      </p>
      {/*
        La vista por defecto deja fuera las hechas, así que también se queda a
        cero cuando el equipo lo ha terminado todo. Sin esta línea, ese caso se
        leería como un espacio vacío.
      */}
      <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm">
        ¿Buscas algo que ya está terminado? Filtra por «Hecho».
      </p>
    </div>
  )
}
