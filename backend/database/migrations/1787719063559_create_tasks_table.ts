import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title').notNullable()

      /**
       * El conjunto cerrado de estados lo impone la validación, no la columna.
       * Ver design.md D1: un enum de base de datos convertiría en migración
       * una decisión de producto que puede cambiar.
       */
      table.string('status').notNullable()

      table
        .integer('assignee_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
