# Eval · ¿se cumple sola la regla del README de capability?

**Regla medida** (`CLAUDE.md`, reglas de proceso):

> *"Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra
> en el mismo commit con el documento OpenAPI y el README de esa capability al día."*

**Encargo lanzado**, tal cual, sin recordar la regla, en sesión nueva cada vez:

> "Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y
> devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a
> las demás de `tasks`."

**Herramienta y modelo**: Claude Code, Claude Opus 5 (1M context), en las seis ejecuciones. El texto
literal de cada prompt está en [`prompts.md`](../../prompts.md).

---

## Parte A · la medición

**Apuesta, escrita antes de medir: 3 de 5.**

Ejecuciones hechas: **6** (una más de las cinco que pedía el ejercicio). Entre una y otra el proyecto
se devolvió a `s8/start` con `git checkout -f` + `git reset --hard` + `git clean -fd`; que las seis
ramas cuelguen de un único commit sobre `s8/start` —y no una de otra— es la comprobación de que
ninguna arrancó donde acabó la anterior.

### Las dos casillas

| # | Hora | Rama que dejó el intento | Control: ¿ruta `DELETE` declarada? | Resultado: ¿el README menciona el endpoint? |
|---|---|---|---|---|
| 1 | 00:06 | `feat/tasks-delete` | **SÍ** | **SÍ** |
| 2 | 00:31 | `feat/tasks-delete-endpoint` | **SÍ** | **SÍ** |
| 3 | 00:48 | `feat/borrar-tarea` | **SÍ** | **SÍ** |
| 4 | 00:59 | `feat/eliminar-tarea` | **SÍ** | **SÍ** |
| 5 | 01:17 | `feat/delete-task` | **SÍ** | **SÍ** |
| 6 | 01:26 | `feat/tasks-destroy` | **SÍ** | **SÍ** |

**Resultado: 6 de 6 intentos válidos, 6 con el README al día. 100 %.**

Cómo se comprobó cada casilla, rama por rama, sin fiarse del resumen del agente:

```bash
git show <rama>:backend/start/routes.ts | grep "delete"
# 6/6 → router.delete(':id', [controllers.Tasks, 'destroy'])

git show <rama>:docs/capabilities/tasks/README.md | grep "DELETE"
# 6/6 → fila nueva en la tabla de endpoints, con su enlace al controlador
```

En las seis, la mención al README no es una nota suelta: es una fila en la tabla de endpoints, con
la ruta, la entrada, el enlace al controlador y el `204 · sin cuerpo`. Cinco de las seis añadieron
además un `curl` de borrado a la sección de pruebas a mano.

### Lo que se ve al mirar un poco más allá de las dos casillas

El código salió prácticamente idéntico en las seis: mismo `findOrFail` + `delete()` +
`response.noContent()` dentro de `TasksController`, y la ruta en el mismo sitio del grupo. La
variación no está en el endpoint; está en **todo lo que lo rodea**:

| # | Rama | `docs/api/openapi.json` regenerado | Test del borrado | `.adonisjs/` regenerado | Archivos tocados |
|---|---|---|---|---|---|
| 1 | `feat/tasks-delete` | **NO** | sí | sí | 8 |
| 2 | `feat/tasks-delete-endpoint` | **NO** | no | **NO** | 3 |
| 3 | `feat/borrar-tarea` | sí | sí | sí | 9 |
| 4 | `feat/eliminar-tarea` | **NO** | sí | sí | 8 |
| 5 | `feat/delete-task` | sí | no | sí | 8 |
| 6 | `feat/tasks-destroy` | sí | sí | sí | 9 |

Las tres que dejaron `docs/api/openapi.json` sin regenerar **sí** habían anotado el controlador con
los decoradores `@ApiResponse` del `204`, el `401` y el `404`. Es decir: describieron la operación y
no volcaron la descripción al documento versionado. Comprobado así:

```bash
git show <rama>:docs/api/openapi.json \
  | python -c "import json,sys; print('delete' in json.load(sys.stdin)['paths']['/api/v1/tasks/{id}'])"
# ramas 1, 2 y 4 → False, con el controlador ya decorado
```

---

## Parte B · las tres líneas

### 1. Mi apuesta y el resultado

Aposté **3 de 5** y salió **6 de 6 (100 %)**, con seis ejecuciones en vez de cinco. Me equivoqué por
mucho, y el error tiene una explicación que vale más que el número: di por hecho que documentar es lo
primero que se cae cuando el encargo solo pide código, y aquí no se cayó ni una vez. Lo que no aposté
—porque la casilla no lo mira— es la otra mitad de la misma regla, y **esa se cayó 3 de 6**.

### 2. Qué haría con ese número

**Partirla en dos y automatizar solo la mitad que falla.** No la borro y no la reescribo entera:

- **La mitad del README se queda escrita tal cual.** 6 de 6 sin recordársela es exactamente lo que se
  le pide a una regla de un archivo de instrucciones: que se cumpla sola. Automatizarla sería caro y
  frágil —haría falta un verificador que juzgue si un texto en prosa «menciona» un endpoint— para
  comprar algo que ya tengo gratis.
- **La mitad de OpenAPI pasa a ejecutarse sola.** 3 de 6 no es una regla que se cumpla: es una regla
  que a veces acierta. Y aquí la automatización ya está escrita y no la estoy usando: `npm run
  openapi:check` regenera el documento, lo compara con el versionado y **sale 1 si difieren**. Basta
  con colgarlo de donde no se pueda saltar —CI sobre cada PR, y un hook local— para que las tres
  ramas de arriba no hubieran podido cerrarse.

El criterio que saco, y que es lo que me llevo del ejercicio: **una regla se escribe cuando se cumple
sola y se automatiza cuando no**, y eso solo se sabe midiendo cada mitad por separado. La regla actual
mezcla las dos en una frase, y por eso su número real —el de la frase entera— es 3 de 6, no 6 de 6.

### 3. Una cosa que mi medición no está midiendo

**Que la casilla mide la mitad barata de la regla, y la mitad cara queda fuera del recuento.**

La regla exige dos cosas en el mismo commit: el documento OpenAPI al día **y** el README al día. La
comprobación que manda el ejercicio solo mira el README, y por eso mi 100 % es cierto y engañoso a la
vez: **el cumplimiento de la regla completa es 3 de 6 (50 %)**, porque tres intentos dejaron
`docs/api/openapi.json` sin regenerar mientras rellenaban la tabla del README sin fallar una sola vez.

Y no es casualidad que fallara justo esa mitad: el README ya traía **una tabla de endpoints con cinco
filas**, que es una plantilla pidiendo la sexta. El documento OpenAPI no tiene plantilla visible: hay
que acordarse de un comando. Lo que mi medición está midiendo, entonces, no es «¿se cumple la regla?»
sino «¿se rellena un hueco evidente?» — y esas dos preguntas coinciden solo mientras el hueco exista.
La prueba que faltaría por hacer es la misma medición sobre un README **sin** esa tabla: ahí el 100 %
tendría que defenderse sin ayuda.

*(Dos cosas más que quedan fuera, por si sirven: la medición tampoco mira si lo que se escribe en el
README es **verdad** —basta con que mencione el endpoint, no con que lo describa bien—, ni si el
endpoint **funciona**; el `204`, el `404` al repetir el borrado y el `401` sin token solo quedaron
cubiertos por tests en 4 de las 6 ramas.)*
