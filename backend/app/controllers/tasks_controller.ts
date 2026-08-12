import Task, { DEFAULT_TASK_STATUS } from '#models/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { createTaskValidator, updateTaskStatusValidator } from '#validators/task'

export default class TasksController {
  /**
   * La lista compartida del equipo: una sola, la misma para todos, sin filtrar
   * por quién pregunta.
   */
  async index({ serialize }: HttpContext) {
    const tasks = await Task.query()
      .preload('assignee')
      /**
       * SQLite guarda las marcas de tiempo con resolución de segundo, así que
       * dos tareas creadas en el mismo segundo empatarían. El desempate por id
       * mantiene el orden estable entre consultas.
       */
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * Crea una tarea con solo el título. Nace a nombre de quien la crea y en
   * `pending`: el validador no acepta responsable ni estado, así que si vienen
   * en el cuerpo se descartan.
   */
  async store({ request, auth, serialize }: HttpContext) {
    const { title } = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    /**
     * El estado se fija aquí y no se deja al DEFAULT de la columna: el modelo
     * recién creado no conoce los valores que pone la base de datos, y la
     * respuesta saldría sin `status`.
     */
    const task = await user.related('tasks').create({ title, status: DEFAULT_TASK_STATUS })

    /**
     * Ya tenemos al responsable en memoria: se engancha a la relación en vez de
     * volver a pedirlo con un `load`.
     */
    task.$setRelated('assignee', user)

    return serialize(TaskTransformer.transform(task))
  }

  /**
   * Cambia el estado de cualquier tarea, propia o ajena, sin permisos ni
   * confirmación. No toca el título ni el responsable.
   */
  async updateStatus({ params, request, serialize }: HttpContext) {
    const { status } = await request.validateUsing(updateTaskStatusValidator)

    const task = await Task.findOrFail(params.id)
    task.status = status
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
