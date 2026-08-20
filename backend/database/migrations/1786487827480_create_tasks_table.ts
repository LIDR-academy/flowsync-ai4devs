import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      // Sin longitud máxima: el umbral de «demasiado largo» es una decisión de
      // producto sin tomar, y aquí no se inventa ninguno.
      table.text('title').notNullable()
      // El conjunto cerrado de estados lo impone el validador, no la base.
      table.string('status').notNullable().defaultTo('pendiente')
      table
        .integer('assignee_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
