# Los informes de la sesión del mentor

Aquí están los informes (`report.html`) de los comandos de evals que lanza el mentor en la sesión, **guardados tal cual salieron**. Sirven para comparar con los tuyos: abre uno en el navegador y mira cómo se lee, no qué número da.

> ⚠️ **Cada informe es UNA ejecución, no un contrato.** El agente no es determinista: con el mismo comando, tu informe traerá otras cifras, otro reparto entre ensayos y a veces otro desenlace. Lo que se repite es la forma de lo que ves, y por eso este archivo **no repite ninguna cifra**: están dentro de cada informe, con su fecha.

Los informes se guardan aquí, y no en `evals/results/`, porque esa carpeta está en `.gitignore`: los que generes tú no se versionan.

| Informe | Comando de la sesión | Qué mide |
|---|---|---|
| `comando-03-commit-skill.html` | 3 | Si el agente usa la skill de `commit`, con su línea base |
| `comando-05-regla-y-linea-base-sonnet.html` | 5 | La regla del `CLAUDE.md` y su línea base sin regla, tres ensayos cada una, con Sonnet |
| `comando-05-ter-sin-ablation-none.html` | 5-ter | El mismo caso sin `--ablation none`: la herramienta quita el plugin, no el `CLAUDE.md` |
| `comando-06-regla-y-linea-base-opus.html` | 6 | Lo mismo que el 5, con Opus |
| `comando-07-grader-flojo.html` | 7 | Un grader que da verde sin medir nada |
| `comando-10-sonda-git.html` | 10 | Qué hace `git` dentro del entorno aislado de un ensayo |
| `comando-11-juez-sonnet.html` | 11 | El juez sobre tres ensayos de Sonnet |
| `comando-12-juez-opus.html` | 12 | El mismo juez sobre tres ensayos de Opus |
| `comando-13-regla-reescrita.html` | 13 | Volver a medir con la regla reescrita |
| `comando-15-guardarrail.html` | 15 | El guardarraíl, con el plugin y sin él |

No hay informe del comando 9: se corta con `Ctrl+C` en cuanto sale el aviso de la herramienta, y no llega a haber resultado.

Los informes de los comandos 3, 5, 5-ter, 6 y 7 son del ensayo del director con Claude Code 2.1.278. Los de los comandos 10, 11, 12, 13 y 15 se lanzaron después, con la 2.1.282, sobre esta misma suite.
