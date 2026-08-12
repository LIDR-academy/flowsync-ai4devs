import { ListTodoIcon } from 'lucide-react'

/**
 * Lo que se ve antes de que exista la primera tarea: qué es esta lista y qué
 * hacer ahora, en vez de una zona vacía sin ninguna indicación.
 */
export function EmptyTaskList() {
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
    </div>
  )
}
