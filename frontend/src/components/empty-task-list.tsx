/**
 * El espacio vacío se explica: quien llega el primer día entiende qué es esto
 * en vez de encontrarse una lista en blanco que parece un fallo.
 */
export function EmptyTaskList() {
  return (
    <div className="py-10 text-center">
      <p className="font-medium">Todavía no hay ninguna tarea</p>
      <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
        Esta es la lista del equipo. Todo el mundo ve lo mismo, así que anotar
        en qué andas es la forma de que nadie tenga que preguntártelo.
      </p>
      <p className="text-muted-foreground mt-3 text-sm">
        Escribe un título arriba para crear la primera.
      </p>
    </div>
  )
}
