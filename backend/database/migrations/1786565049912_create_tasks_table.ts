import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', 200).notNullable()
      table.enum('status', ['pending', 'in_progress', 'done']).notNullable().defaultTo('pending')

      /**
       * RESTRICT y no CASCADE: una tarea pertenece a la lista del equipo, no a
       * la cuenta que la creó. Borrar en cascada haría desaparecer trabajo del
       * equipo al dar de baja a una persona.
       */
      table
        .integer('assignee_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
