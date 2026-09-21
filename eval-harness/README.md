# `assets/suite-evals` — la suite de evals del Módulo 8

Viaja en la rama **`s8/start-setup`** del repo del alumno, ya montada en `eval-harness/`: el mentor no copia nada en clase, y el alumno tiene después el mismo entorno. Se lanza desde su raíz (`eval-harness/`).

⚠️ **Tiene que vivir un nivel por debajo de la raíz del proyecto.** `fixture-repo.sh` toma el árbol de FlowSync de la carpeta de arriba. Y no la copies una segunda vez dentro del mismo repo: `claude plugin eval .` recorre las subcarpetas, encuentra todas las copias y **mide cada caso una vez por copia** (medido el 2026-09-21 con tres copias: 12 ejecuciones y 623 s donde tocaban 4, y tres filas `commit-skill` que el informe no distingue).

## Qué hay

| Ruta | Para qué |
|---|---|
| `.claude-plugin/plugin.json` | Las tres líneas que convierten el harness en una unidad que la herramienta puede **cargar y descargar**. Sin esto no hay línea base automática |
| `skills/commit/SKILL.md` | Copia de la skill del harness de FlowSync: es lo que mide la Demo 1 |
| `evals/commit-skill/` | **Demo 1.** Hay un cambio en staging: ¿usa la skill? Fixture autocontenido |
| `evals/regla-doc/` | **Demo 2.** Añade un endpoint: ¿actualiza el README de la capability, como manda el `CLAUDE.md`? |
| `evals/regla-doc-sin-harness/` | La **línea base** del caso anterior: lo mismo, sin sembrar el `CLAUDE.md` |
| `evals/sonda-git/` | **Demo 3.** Comprueba qué hace `git` dentro del entorno aislado |
| `fixture-repo.sh` | Monta el repo sobre el que corre cada ensayo de los casos de la Demo 2 |

## Qué se usa en vivo y qué no

| caso | en la sesión |
|---|---|
| `commit-skill` | **Demo 1**: se lanza primero y, mientras corre, se abren sus archivos para explicar la anatomía |
| `sonda-git` | **Demo 3** |
| `regla-doc-sin-harness` | la **línea base** del encargo de la Demo 2: el mismo caso sin sembrar el `CLAUDE.md` |
| `regla-doc` | 🛟 **no se lanza: es la red.** La Demo 2 **genera** su caso en vivo (`tarea-alumno`) con el PROMPT 1. Si la generación se atasca delante de la clase, este es el mismo caso ya escrito: cambia `--case tarea-alumno` por `--case regla-doc` y sigue |

⚠️ **`regla-doc` viene sin su `graders/readme-al-dia.md`**, porque en la versión anterior del guion se escribía en vivo. Si tiras de la red, créalo con esto:

```markdown
---
type: regex
target: { source: file, path: docs/capabilities/tasks/README.md }
pattern: "DELETE[^|]*/tasks"
arm: both
---
```

## Dos avisos antes de lanzar nada

1. **`--scaffold` es una bandera de seguridad.** Ejecuta `fixture-repo.sh` como tú, fuera del entorno aislado. Léelo antes de pasarla.
2. **`git` funciona en el fixture y NO dentro del ensayo.** El fixture corre en tu máquina; el agente trabaja en un entorno aislado donde `git` falla (es el contenido de la Demo 3). Por eso ningún grader de esta suite comprueba nada de `git`.
