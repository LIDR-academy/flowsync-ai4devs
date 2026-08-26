import { BaseSchema } from '@adonisjs/lucid/schema'
import { normalizeUserEmail } from '#validators/user'

/**
 * Normaliza los emails ya guardados (design.md D3).
 *
 * Sin esto, quien se registró como `Ada@…` deja de poder entrar en cuanto el
 * acceso normalice, porque su fila seguiría en mayúsculas.
 *
 * Se normaliza en JavaScript con **la misma función que usa el validador**, y
 * no con `lower()` de SQL. No es preferencia de estilo: `lower()` de SQLite
 * solo baja el ASCII, así que `JOSÉ@…` quedaría como `josÉ@…`, un valor que la
 * aplicación no genera nunca y con el que esa cuenta no podría volver a entrar.
 * Que la migración y el runtime normalicen igual tiene que ser imposible de
 * romper, no cuestión de acordarse.
 *
 * Si existieran dos cuentas que solo se diferencian en la normalización, esto
 * falla contra el índice único, y está bien que falle: son dos personas o una
 * duplicada, y unificarlas es una decisión con datos detrás que no puede tomar
 * una migración. La transacción deja la tabla intacta y la migración sin
 * registrar.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const cuentas = await db.from('users').select('id', 'email')

      for (const cuenta of cuentas) {
        const normalizado = normalizeUserEmail(cuenta.email)
        if (normalizado === cuenta.email) continue

        await db.from('users').where('id', cuenta.id).update({ email: normalizado })
      }
    })
  }

  /**
   * No hay vuelta atrás real: las mayúsculas originales no se guardan en ningún
   * sitio. Tampoco hacen falta, porque ningún comportamiento dependía de ellas.
   */
  async down() {}
}
