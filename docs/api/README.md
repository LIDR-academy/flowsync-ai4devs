# Contrato de la API

`openapi.json` es el documento OpenAPI de FlowSync. **Está generado: no se edita a mano.**

Lo construye el propio código desde el router (`backend/start/routes.ts` y los controladores), igual
que lo hace el servidor para servirlo en `/api.json`.

```bash
cd backend
npm run openapi:generate   # regenera docs/api/openapi.json
npm run openapi:check      # falla si el fichero versionado no coincide con el código
```

`openapi:check` solo compara: no reescribe el fichero versionado. Cuando no coinciden, enumera qué
partes del documento sobran, faltan o han cambiado, y termina con código de salida 1.

Si tocas rutas, controladores, validadores o transformers, regenera y commitea el resultado en el
mismo commit (ver las reglas de proceso de [`CLAUDE.md`](../../CLAUDE.md)). El trabajo de CI
[`openapi-check.yml`](../../.github/workflows/openapi-check.yml) corre `openapi:check` en cada pull
request y en cada push a `main`, así que si se te olvida, el PR se pone en rojo.
