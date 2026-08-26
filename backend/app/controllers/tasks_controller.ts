import Task from '#models/task'
import { DEFAULT_TASK_STATUS } from '#models/task_status'
import { createTaskValidator, updateTaskValidator } from '#validators/task'
import TaskTransformer from '#transformers/task_transformer'
import type { HttpContext } from '@adonisjs/core/http'

/** Lo persistido, con el responsable, en una sola consulta. */
function releer(id: number) {
  return Task.query().where('id', id).preload('assignee').firstOrFail()
}

export default class TasksController {
  /**
   * La lista es única para todo el espacio y su contenido no depende de quién
   * la pide. Sin filtrar y sin ordenar: PA-3 no ha decidido ninguna regla de
   * orden, y elegir una aquí sería inventar una decisión de producto
   * (design.md D10).
   */
  async index({ serialize }: HttpContext) {
    const tasks = await Task.query().preload('assignee')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * El responsable y el estado inicial los pone el servidor, no la petición.
   */
  async store({ request, auth, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)

    const task = await Task.create({
      title,
      status: DEFAULT_TASK_STATUS,
      assigneeId: auth.getUserOrFail().id,
    })

    /**
     * Se relee lo persistido antes de serializar (design.md D5). El objeto en
     * memoria trae milisegundos y la base guarda con precisión de segundo, así
     * que sin esto la respuesta de escritura y la de la lectura siguiente
     * dirían valores distintos del mismo campo.
     *
     * Se relee y se trae el responsable en la misma consulta, no con
     * `refresh()` más `load()`, que son dos.
     */
    return serialize(TaskTransformer.transform(await releer(task.id)))
  }

  /**
   * Solo el estado es mutable. Cualquiera puede cambiar el de cualquier tarea:
   * los roles son planos y no hay permiso especial que comprobar.
   */
  async update({ params, request, response, serialize }: HttpContext) {
    const { status } = await request.validateUsing(updateTaskValidator)

    /**
     * Es la primera ruta del proyecto que resuelve un identificador venido del
     * cliente. `findOrFail` lanzaría un error del ORM que el manejador
     * renderiza con traza y rutas de fichero fuera de producción; aquí se
     * responde con la misma forma que el resto de errores del sistema.
     */
    const task = await Task.find(params.id)
    if (!task) {
      return response.notFound({
        errors: [{ message: 'No se ha encontrado la tarea' }],
      })
    }

    task.status = status
    await task.save()

    // Mismo motivo que en `store`: la escritura devuelve lo persistido.
    return serialize(TaskTransformer.transform(await releer(task.id)))
  }
}
