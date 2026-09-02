import Task from '#models/task'
import { updateTaskStatusValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'

export default class TaskStatusesController {
  /**
   * El estado es lo único mutable de una tarea en este momento, y por eso
   * tiene endpoint propio en vez de colgar de un update genérico: por ese
   * update acabarían colándose el título y el responsable, que son historias
   * que todavía no se han especificado.
   *
   * Cualquier persona con sesión puede cambiar el estado de cualquier tarea,
   * en cualquier dirección. No hay permisos por responsable ni transiciones
   * prohibidas: volver de «hecho» a «pendiente» es justamente lo que arregla
   * un clic dado por error.
   */
  async update({ params, request, serialize }: HttpContext) {
    // Validar antes de resolver (ADR-0004). Un 404 afirma «te entendí y no
    // existe», y esa afirmación no se puede hacer sobre una petición que no se
    // ha entendido.
    const { status } = await request.validateUsing(updateTaskStatusValidator)
    const task = await Task.findOrFail(params.id)

    task.status = status
    await task.save()

    return serialize(TaskTransformer.transform(await Task.releerConResponsable(task.id)))
  }
}
