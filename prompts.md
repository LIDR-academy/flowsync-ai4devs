# Prompts

El mismo prompt, lanzado cinco veces, cada vez en una sesión nueva y con el proyecto limpio en
`s8/start`. No se le recordó la regla en ningún intento.

## Prompt 1 (intentos 1 a 5)

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** funcionó a la primera en los cinco intentos. La ruta quedó declarada y el README de
la capability al día en todos. `docs/api/openapi.json` no se regeneró en los intentos 2 y 4.

### Resumen de lo que respondió el agente

Guardé la respuesta de tres intentos. Todos terminaron en una rama `feat/…` nueva, con el commit
hecho por la skill `/commit` y sin PR (las reglas lo dejan para el final de la unidad de trabajo).

| Intento | Rama | Tests | Lo que añadió | Lo que avisó |
|---|---|---|---|---|
| 1 | `feat/delete-task` | 26 en verde (3 nuevos) | `destroy` + ruta, `delete.spec.ts` (204, 404, 401), `openapi.json`, `.adonisjs/`, README | `openapi:generate` falla en Windows; sacó el documento de `/api.json` |
| 4 | `feat/tasks-destroy` | 26 en verde | `destroy` + ruta, `destroy.spec.ts` (204, borrado real, 404, 401), `.adonisjs/`, README | Comprobó el endpoint en `/api.json`, pero **no escribió `openapi.json`** |
| 5 | `feat/tasks-delete-endpoint` | 27 en verde | `destroy` + ruta, `delete.spec.ts` (204, tarea ajena, 404, 401), `openapi.json`, `.adonisjs/`, README | `openapi:generate` falla; corrigió saltos de línea CRLF y rehízo el commit con amend |

Lo que se repite en los tres:

- **La spec no contempla borrar tareas.** Lo dejaron anotado en el README y ofrecieron proponer el
  requisito.
- **`npm run openapi:generate` y `openapi:check` fallan en esta máquina** (`Invalid URL`), también en
  `s8/start`. Cuando el agente regeneró el documento, fue con un apaño: pedir `/api.json` una sola vez
  al servidor recién arrancado, porque cada petición extra duplica el parámetro `id`.
- **Sin comprobación de permisos:** cualquier cuenta con sesión puede borrar cualquier tarea, igual
  que en el cambio de estado.
