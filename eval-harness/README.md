# `assets/suite-evals` — la suite de evals del Módulo 8

Viaja en la rama **`s8/start-setup`** del repo del alumno, ya montada en `eval-harness/`: el mentor no copia nada en clase, y el alumno tiene después el mismo entorno. Se lanza desde su raíz (`eval-harness/`).

⚠️ **Tiene que vivir un nivel por debajo de la raíz del proyecto.** `fixture-repo.sh` toma el árbol de FlowSync de la carpeta de arriba. Y no la copies una segunda vez dentro del mismo repo: `claude plugin eval .` recorre las subcarpetas, encuentra todas las copias y **mide cada caso una vez por copia** (medido el 2026-09-21 con tres copias: 12 ejecuciones y 623 s donde tocaban 4, y tres filas `commit-skill` que el informe no distingue).

## Qué quita la herramienta, y qué no

`--ablation` solo sabe quitar **el plugin**: esta carpeta, con su `plugin.json`. Aquí el plugin lleva **la skill** (`skills/`) y **el hook** del guardarraíl (`hooks/`). **El `CLAUDE.md` no puede ir dentro de un plugin**, y cada ensayo corre aislado, sin ningún `CLAUDE.md` que no le siembres tú. Por eso cada pieza se mide sin ella de una forma:

| Pieza | Dónde vive | Cómo se consigue el «sin» | Casos |
|---|---|---|---|
| Skill | en el plugin | automático: `--ablation` quita el plugin (columnas `WITH` / `W/OUT`) | `commit-skill` |
| Regla del `CLAUDE.md` | en el repo | a mano: dos casos, el fixture siembra el `CLAUDE.md` (`1`) o no (`0`), y `--ablation none` | `tarea-alumno` y `tarea-alumno-sin-claude-md` |
| Hook | en el plugin | automático otra vez | `guardarrail-readme` |

## Qué hay

| Ruta | Para qué |
|---|---|
| `.claude-plugin/plugin.json` | Las tres líneas que convierten el harness en una unidad que la herramienta puede **cargar y descargar**. Sin esto no hay línea base automática |
| `skills/commit/SKILL.md` | Copia de la skill del harness de FlowSync: es lo que mide la Demo 1 |
| `evals/commit-skill/` | **Demo 1.** Hay un cambio en staging: ¿usa la skill? Fixture autocontenido |
| `evals/regla-doc/` | 🛟 **La red de la Demo 2**: el mismo caso que se genera en vivo, ya escrito. Añade un endpoint: ¿actualiza el README de la capability, como manda el `CLAUDE.md`? |
| `evals/tarea-alumno-sin-claude-md/` | La **línea base** de la Demo 2: el mismo encargo, sin sembrar el `CLAUDE.md`. Se llama así para que `--case 'tarea-alumno*'` lance en una sola tanda el caso generado en vivo **y** su línea base |
| `evals/trampa-grader-flojo/` | **Demo 3, trampa 1.** El mismo encargo con un grader del README que busca `/tasks`, que ya está en el README antes de empezar: **sale en verde siempre**. Roto a propósito |
| `evals/sonda-git/` | **Demo 3.** Comprueba qué hace `git` dentro del entorno aislado |
| `evals/juez-aviso-doc/` | **Demo 4.** Un grader `llm` sobre la respuesta final: ¿avisa de cómo quedó el README? Para calibrar el juez contra una persona |
| `evals/guardarrail-readme/` | **Demo 5.** El mismo encargo con `EVAL_GUARDARRAIL=1` en su `prompt.md`, que activa el hook. Se lanza **con** la comparación automática (sin `--ablation none`) |
| `hooks/hooks.json` + `hooks/readme-al-dia.sh` | **El guardarraíl de la Demo 5**: un hook `Stop` que no deja terminar si un verbo HTTP de `backend/start/routes.ts` no aparece en ningún README de `docs/capabilities/`. **Sin `EVAL_GUARDARRAIL=1` no hace nada**, para no alterar las demás demos, que cargan este mismo plugin. Necesita el bit de ejecución |
| `fixture-repo.sh` | Monta el repo sobre el que corre cada ensayo de los casos de la Demo 2 |

## Qué se usa en vivo y qué no

| caso | en la sesión |
|---|---|
| `commit-skill` | **Demo 1**: se lanza primero y, mientras corre, se abren sus archivos para explicar la anatomía |
| `trampa-grader-flojo` | **Demo 3**, trampa 1 |
| `sonda-git` | **Demo 3**, trampa 3 |
| `juez-aviso-doc` | **Demo 4**, con Sonnet y con Opus |
| `guardarrail-readme` | **Demo 5**, con el plugin y sin él |
| `tarea-alumno-sin-claude-md` | la **línea base** de la Demo 2: **se lanza siempre**, junto al caso generado, con los dos modelos |
| `regla-doc` | 🛟 **no se lanza: es la red.** Es el mismo caso que la Demo 2 **genera** en vivo (`tarea-alumno`) con el PROMPT 1, ya escrito. Si la generación se atasca delante de la clase, lanza `--case regla-doc` y después `--case tarea-alumno-sin-claude-md`, con las mismas banderas: pierdes solo que salgan en la misma tabla |

✅ **Los tres casos de la regla llevan el mismo encargo, literal**, que es el que el PROMPT 1 le pide al caso generado. Hasta el 2026-09-21 la línea base y la red lo llevaban sin tildes y con comillas de código, y la red además **no tenía el grader del README**: lanzada tal cual salía al **100%**, un verde que no medía la regla.

## Dos avisos antes de lanzar nada

1. **`--scaffold` es una bandera de seguridad.** Ejecuta `fixture-repo.sh` como tú, fuera del entorno aislado. Léelo antes de pasarla.
2. **`git` funciona en el fixture y NO dentro del ensayo.** El fixture corre en tu máquina; el agente trabaja en un entorno aislado donde `git` falla (es el contenido de la Demo 3). Por eso ningún grader de esta suite comprueba nada de `git`.
