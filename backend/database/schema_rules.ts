import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

/**
 * El estado de una tarea es uno de tres valores fijos. La columna es un `string`
 * en la base de datos, así que sin esta regla el esquema generado lo declararía
 * como `string` y el modelo aceptaría cualquier cosa. Aquí se estrecha al tipo
 * del dominio; la puerta en tiempo de ejecución la pone el validador.
 *
 * Ojo: una regla de columna sustituye por completo a la del tipo, no se fusiona
 * con ella, así que hay que repetir los decoradores.
 */
export default {
  tables: {
    tasks: {
      columns: {
        status: {
          tsType: `'pending' | 'in_progress' | 'done'`,
          imports: [],
          decorators: [{ name: '@column' }],
        },
        /**
         * La fecha de vencimiento es un día del calendario, no un instante. Sin
         * esta regla el esquema la declararía como `DateTime` de luxon, y decidir
         * si es «anterior a hoy» pasaría por normalizar horas y husos — que es
         * justo donde vive el día de más. Como texto ISO, `<` compara días.
         */
        due_date: {
          // Sin el `| null`: la nulabilidad la añade el generador por su cuenta
          // al leer la columna, y ponerlo aquí lo deja repetido.
          tsType: 'string',
          imports: [],
          decorators: [{ name: '@column' }],
        },
      },
    },
  },
} satisfies SchemaRules
