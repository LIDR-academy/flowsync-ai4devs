# Medición de la regla del README de capability

**Regla medida** (`CLAUDE.md`, reglas de proceso):

> "Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra
> en el mismo commit con el documento OpenAPI y el README de esa capability al día."

**Qué se mide:** la parte del README. En qué proporción de los intentos
`docs/capabilities/tasks/README.md` menciona el endpoint nuevo.

**Encargo** (el mismo en los cinco intentos, cada uno en una sesión nueva y sin recordar la regla):

> Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y
> devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a
> las demás de `tasks`.

**Modelo y herramienta:** Claude Opus 5.5 en Claude Code.

## Parte A · la medición

**Apuesta (antes de medir):** 3 de 5 intentos dejarían el README al día.

Entre intentos, el proyecto se dejó limpio con `git checkout -f s8/start`,
`git reset --hard upstream/s8/start` y `git clean -fd`. Las cinco ramas salen directamente de
`s8/start`.

| Intento | Rama | Control: ruta `DELETE` declarada | Resultado: README menciona el endpoint |
|---|---|---|---|
| 1 | `feat/delete-task` | ✅ | ✅ |
| 2 | `feat/tasks-delete` | ✅ | ✅ |
| 3 | `feat/delete-task-endpoint` | ✅ | ✅ |
| 4 | `feat/tasks-destroy` | ✅ | ✅ |
| 5 | `feat/tasks-delete-endpoint` | ✅ | ✅ |

**Resultado:** 5 de 5 intentos válidos, y el README al día en los 5.

> **Observación fuera de la medición:** la otra mitad de la regla, el documento OpenAPI, no se
> cumplió siempre. En los intentos 2 y 4 el agente añadió los decoradores `@ApiResponse` en el
> controlador, pero no regeneró `docs/api/openapi.json`. Esa mitad quedó en 3 de 5.

## Parte B · las tres líneas

1. **Apuesta y resultado.** Mi apuesta fue 3 de 5. Se cumplieron 5 de 5, con las cinco ejecuciones
   hechas.

2. **Qué haría con ese número.** Por ahora no tocaría la regla. Un 5/5 con la regla puesta no me
   dice si es la regla la que consigue el resultado o si el modelo lo haría igual sin ella (ver el
   punto 3). El siguiente paso es medir la línea base: el mismo encargo, cinco veces, sin la regla en
   el `CLAUDE.md`.
   - Si sin la regla también sale cerca de 5/5, la borraría: ocupa sitio en el contexto sin aportar.
   - Si baja claramente, la regla funciona y la mantendría.
   - A la larga la convertiría en algo que se ejecute solo, porque una instrucción es una petición y
     no una garantía. La mitad del OpenAPI ya tiene un check (`openapi:check` en la CI) y aun así el
     agente la incumplió 2 de 5; sin ese check, el fallo habría pasado. El README no tiene nada
     equivalente. Un check que falle cuando cambian rutas o controladores de una capability y no
     cambia su README cubriría ese hueco.

3. **Una cosa que mi medición no mide.** Estas pruebas no miden la línea base. Así que no sabemos si,
   en los casos en que se actualiza el README, eso ocurre porque la regla existe o no.
