# Medición de una regla de proceso

## Parte A · La medición

### La apuesta

Registrada antes del intento 1: **5/5**. Es decir, que el README de `tasks` quedaría al día en los
cinco intentos.

### La regla medida

En `CLAUDE.md`, sección de reglas de proceso:

> «Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra
> en el mismo commit con el documento OpenAPI y el README de esa capability al día.»

De la regla se mide solo la parte del README.

### El encargo

El mismo texto en los 5 intentos, sin recordarle la regla al agente:

> «Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve
> 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de
> tasks.»

### Las dos casillas

| | Pregunta | Qué significa |
|---|---|---|
| **P1 · control** | ¿Quedó declarada la ruta `DELETE`? | Si no, el agente no hizo el trabajo y el intento no cuenta. |
| **P2 · resultado** | ¿Menciona `docs/capabilities/tasks/README.md` el endpoint nuevo? | Es la regla que se está midiendo. |

### Resultados

Comprobado con `git diff` en cada intento: la rama del intento contra `s8/start`, o contra el working
tree cuando no hubo commit. No se usó lo que el agente decía en su resumen.

| Intento | P1 · ¿ruta `DELETE`? | P2 · ¿menciona el endpoint? | ¿Cuenta? | Notas |
|:---:|:---:|:---:|:---:|---|
| 1 | ✅ | ✅ | Sí | Commit `4fa39cd` (`feat/borrar-tarea`). Agregó la fila, pero el README sigue diciendo «Las cinco operaciones» y no lista el `204`. |
| 2 | ✅ | ✅ | Sí | Commit `587e51f` (`feat/tasks-delete-endpoint`). Fila, conteo (cinco→seis) y códigos al día. |
| 3 | ✅ | ✅ | Sí | Commit `c79b47b` (`feat/tasks-delete-endpoint-2`). Fila, conteo y códigos al día. Además, añadió una fila en la tabla de trazabilidad con OpenSpec que señala que el endpoint no tiene requisito. |
| 4 | ✅ | ✅ | Sí | **Sin commit.** Fila, conteo y códigos al día en el working tree (`feat/delete-task`), pero el agente no cerró con `/commit`. Como no había commit, el reset lo borró: la evidencia queda en el transcript y en el `git diff` tomado antes del reset. |
| 5 | ✅ | ✅ | Sí | Commit `58d6b2a` (`feat/tasks-delete-endpoint-3`). Igual que el 1: fila sí; conteo y códigos, no. |
| **Total** | **5/5** | **5/5** | **5** | |

Con la casilla P2 tal como la define el enunciado («¿menciona el endpoint?»), la regla se cumplió en
**5 de 5**. Con la regla al pie de la letra («al día»), el README quedó coherente en **3 de 5**
(intentos 2, 3 y 4). Ver Parte B, línea 3.

### Condiciones de cada intento

- **Punto de partida.** Antes de cada intento, el proyecto volvió a su estado inicial:

  ```bash
  git checkout -f s8/start
  git reset --hard upstream/s8/start
  git clean -fd
  ```

- **Sesión nueva.** Cada intento se lanzó en una sesión nueva de Claude Code, así que ninguno arrastró
  el contexto de otro.
- **Configuración aislada.** Con `CLAUDE_CONFIG_DIR=~/.claude-aislado`, esa configuración excluye el
  `CLAUDE.md` global del usuario (`claudeMdExcludes`): el agente solo ve las instrucciones del
  proyecto. La memoria automática de esa configuración para este proyecto está vacía, así que tampoco
  pasó nada de un intento a otro por esa vía.
- **Modelo.** Sonnet 5, con esfuerzo high, en los cinco intentos.

---

## Parte B · Las tres líneas

### 1. La apuesta y el resultado

Aposté 5/5. Salió 5/5 según la casilla del enunciado, y 3/5 si «al día» se lee como README coherente.
Completé las cinco ejecuciones.

### 2. Qué haría con ese número

**La convertiría en algo que se ejecute solo, en la parte que se puede mecanizar:** un hook de
pre-commit que rechace el commit si toca rutas, controladores, validadores o transformers de una
capability sin tocar su README. La parte del OpenAPI ya funciona así (`openapi:check` en
`.github/workflows/openapi.yml`). La del README solo la vigila el revisor de Claude en CI
(`REVIEW.md`), que es probabilístico y revisa el PR entero, no cada commit.

No la borraría. Sin línea base (el mismo encargo sobre una copia del proyecto sin la regla en
`CLAUDE.md` ni en `AGENTS.md`, que la repite) no sé qué parte del resultado produce la regla. En dos
intentos el agente dijo que actualizaba el README «per the process rule»: eso indica que la lee, no
que sin ella dejaría de hacerlo. El hook también tiene un límite: comprueba que el README cambió, no
que quedó al día, así que los intentos 1 y 5 lo habrían pasado. Esa parte le sigue tocando al revisor.

### 3. Una cosa que esta medición no está midiendo

**Que el README quede al día. La casilla solo mira que mencione el endpoint.** P2 es más laxa que la
regla en dos puntos:

- **Mencionar no es estar al día.** Los intentos 1 y 5 agregaron la fila del `DELETE`, pero el README
  sigue diciendo «Las cinco operaciones están anotadas…» y no lista el `204`. P2 los da por buenos;
  la regla, no. Con la regla al pie de la letra, el resultado baja de 5/5 a 3/5.
- **No mira el commit.** La regla dice que el cambio «se cierra en el mismo commit». El intento 4
  dejó todo correcto en el working tree y no commiteó. P2 lo cuenta como cumplido, pero la unidad de
  trabajo nunca se cerró.

El 5/5 mide la casilla, no la regla.
