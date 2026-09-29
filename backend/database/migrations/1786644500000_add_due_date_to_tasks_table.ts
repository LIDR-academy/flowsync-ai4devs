import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Nulable, y sin valor por defecto: no tener fecha es el estado normal de
      // una tarea, no un dato a medio rellenar. Las tareas que ya existen se
      // quedan sin fecha, que es un valor válido.
      table.date('due_date').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('due_date')
    })
  }
}
