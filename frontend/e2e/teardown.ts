import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * Deshace las tablas de la base de pruebas al terminar. Japa usa el mismo
 * fichero y da por hecho que parte vacío: una fila que dejaran estas pruebas
 * haría fallar sus aserciones sobre la lista entera.
 *
 * Con `--no-schema-generate`: sin él, el reset regenera `database/schema.ts`
 * desde una base sin tablas y deja vacío un fichero versionado del que tiran
 * todos los modelos. Pasó en la primera ejecución.
 */
export default function teardown() {
  execFileSync(
    'node',
    ['ace', 'migration:reset', '--force', '--no-schema-generate'],
    {
      cwd: fileURLToPath(new URL('../../backend', import.meta.url)),
      env: { ...process.env, NODE_ENV: 'test' },
      stdio: 'inherit',
    },
  )
}
