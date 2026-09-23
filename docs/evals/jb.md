# Medición: ¿el README de la capability queda al día?

## Parte A · la medición

**Regla medida** (`CLAUDE.md`, reglas de proceso):

> Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.

**Encargo**, lanzado tal cual en cinco sesiones nuevas desde `s8/start` limpio y sin recordar la regla (texto exacto en [prompts.md](../../prompts.md)).

**Apuesta, anotada antes de medir:** 3/5.


| Intento | Rama del agente                    | Control: ruta `DELETE` declarada | Resultado: README menciona el endpoint |
| ------- | ---------------------------------- | -------------------------------- | -------------------------------------- |
| 1       | `feat/tasks-delete`                | ✅                                | ✅                                      |
| 2       | `feat/delete-task`                 | ✅                                | ✅                                      |
| 3       | `feat/tasks-delete-endpoint`       | ✅                                | ✅                                      |
| 4       | `feat/tasks-destroy`               | ✅                                | ✅                                      |
| 5       | `feat/delete-task-endpoint-124853` | ✅                                | ✅                                      |


**Resultado: 5/5.** Los cinco intentos cuentan, porque todos declararon la ruta, y en los cinco el README recoge el endpoint (tabla de operaciones, `204` sin cuerpo y ejemplo con `curl`).

Comprobación hecha sobre los commits de cada rama, no sobre lo que contó el agente:

```bash
git show <rama>:backend/start/routes.ts | grep -n "router.delete"
git show <rama>:docs/capabilities/tasks/README.md | grep -n "DELETE"
```



## Parte B · las tres líneas

1. **Apuesta y resultado:** aposté 3/5 y salió 5/5.
2. **Qué haría con ese número:** reescribir la regla. La parte del README funciona tal cual (5/5), pero la regla dice que «no hay fichero que generar» para el OpenAPI, y es falso: existe `docs/api/openapi.json`. Esa frase hizo fallar al agente en el intento 1. Quitaría esa frase.
3. **Lo que mi medición no mide:** el documento OpenAPI, que es la otra mitad de la regla. En el intento 1 el agente no actualizó `docs/api/openapi.json`, así que midiendo la regla entera habría salido 4/5, no 5/5.

