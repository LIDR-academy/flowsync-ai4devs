import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Normaliza los emails ya guardados (design.md D3).
 *
 * Sin esto, quien se registró como `Ada@…` deja de poder entrar en cuanto el
 * acceso normalice, porque su fila seguiría en mayúsculas.
 *
 * Si existieran dos cuentas que solo se diferencian en mayúsculas, esto falla
 * contra el índice único, y está bien que falle: son dos personas o una
 * duplicada, y unificarlas es una decisión con datos detrás que no puede tomar
 * una migración.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery('update users set email = lower(email) where email <> lower(email)')
    })
  }

  /**
   * No hay vuelta atrás real: las mayúsculas originales no se guardan en ningún
   * sitio. Tampoco hacen falta, porque ningún comportamiento dependía de ellas.
   */
  async down() {}
}
