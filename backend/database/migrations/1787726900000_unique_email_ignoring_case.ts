import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Segunda línea de defensa para la unicidad del email.
 *
 * El índice que trae la tabla compara byte a byte, así que `Ada@…` y `ada@…`
 * caben las dos. Hoy no ocurre porque el validador normaliza antes de escribir,
 * pero eso es disciplina: un seeder, un comando de ace o un controlador nuevo
 * que no pase por el validador reabren el defecto sin que nada avise.
 *
 * Este índice lo hace imposible para el alfabeto latino sin acentos, que es
 * donde `lower()` de SQLite funciona. Fuera de ahí sigue protegiendo el
 * validador, que sí normaliza Unicode completo. No es una garantía total, y por
 * eso se dice aquí en vez de dejarlo por supuesto.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(
        'create unique index if not exists users_email_nocase_unique on users (lower(email))'
      )
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('drop index if exists users_email_nocase_unique')
    })
  }
}
