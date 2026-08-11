import Task from '#models/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { createTaskValidator, updateTaskValidator } from '#validators/task'

export default class TasksController {
  /**
   * La lista compartida completa: una sola, idéntica para todo el equipo, sin
   * filtro por responsable.
   *
   * Sin `orderBy` a propósito — no hay criterio de ordenación decidido y no se
   * inventa ninguno aquí. `preload` evita una consulta por fila.
   */
  async index({ serialize }: HttpContext) {
    const tasks = await Task.query().preload('assignee')

    return serialize(TaskTransformer.transform(tasks))
  }

  /**
   * Alta con el título como único dato obligatorio. Estado y responsable tienen
   * valor por defecto —`pendiente` y quien crea— y la propia petición puede
   * sobrescribir cualquiera de los dos, incluido dejar la tarea sin responsable
   * enviando `assigneeId: null`.
   */
  async store({ auth, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(createTaskValidator)
    const user = auth.getUserOrFail()

    const task = await Task.create({
      title: payload.title,
      status: payload.status ?? 'pendiente',
      assigneeId: 'assigneeId' in payload ? payload.assigneeId : user.id,
    })

    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }

  /**
   * Actualización parcial salvo en el título, que viaja siempre. Un campo que la
   * petición no menciona conserva su valor; vaciar el responsable se pide de
   * forma explícita con `assigneeId: null`.
   */
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const payload = await request.validateUsing(updateTaskValidator)

    task.title = payload.title
    if (payload.status !== undefined) task.status = payload.status
    if ('assigneeId' in payload) task.assigneeId = payload.assigneeId ?? null

    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
