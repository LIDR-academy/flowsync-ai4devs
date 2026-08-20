import { ListChecksIcon } from 'lucide-react'

/**
 * Una lista sin filas no dice nada. Esto explica para qué sirve y remata con la
 * invitación a estrenarla; el formulario de creación vive justo encima.
 */
export function TasksEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <ListChecksIcon className="text-muted-foreground size-8" />
      <h2 className="font-medium">Todavía no hay ninguna tarea</h2>
      <p className="text-muted-foreground max-w-sm text-sm">
        Esta es la lista del equipo: una sola, la misma para todos. Aquí se
        anota el trabajo pendiente y se ve de un vistazo quién lleva qué y por
        dónde va.
      </p>
      <p className="text-sm">
        Escribe un título ahí arriba y crea la primera tarea.
      </p>
    </div>
  )
}
