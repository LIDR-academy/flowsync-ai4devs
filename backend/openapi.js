/*
|--------------------------------------------------------------------------
| Entrypoint JavaScript para el contrato versionado
|--------------------------------------------------------------------------
|
| Mismo patrón que `ace.js`: registra el hook de TypeScript y delega. Existe
| porque node no ejecuta el `.ts` directamente.
|
| No es un comando de ace a propósito. Ver la cabecera de `bin/openapi.ts`.
|
*/

import '@poppinss/ts-exec'

await import('./bin/openapi.js')
