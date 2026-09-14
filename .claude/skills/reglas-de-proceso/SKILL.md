---
name: reglas-de-proceso
description: Las reglas de proceso de FlowSync con su historia, su modo de fallo y qué las ejecuta. Leer antes de commitear, abrir un PR, saltar de rama o añadir una comprobación.
---
# Reglas de proceso, con su porqué

El resumen de una línea por regla está en `AGENTS.md`. Aquí está la versión larga: de dónde sale cada una, qué costó no tenerla y qué la ejecuta hoy. Se saca de `AGENTS.md` el 2026-09-13 porque un fichero de instrucciones largo diluye las reglas que importan; el texto es el mismo que vivió ahí desde el Módulo 5.

> Cada regla lleva su **modo de fallo**, porque es lo que decide dónde tiene que vivir.
> Lo que falla ruidoso puede quedarse escrito aquí: se nota solo. Lo que falla en silencio hay que bajarlo a algo que lo ejecute, o se cumplirá lo justo para que dejes de comprobarlo. Y lo que no se puede comprobar se dice, en vez de fingir que se cumple.
>
> **El modo de fallo es una propiedad de la regla y se declara aquí. Si la regla se cumple o no es otra cosa, es empírico, y va en [`docs/auditoria-reglas-de-proceso.md`](docs/auditoria-reglas-de-proceso.md).**

### Ciclo de trabajo

- La rama es por unidad de trabajo, no por petición. Antes de tocar código, mira en qué rama estás: si ya es una rama de trabajo —cualquiera que no sea `main` ni una `sN/*`—, sigue en ella en vez de crear otra. Solo desde `main` o desde una `sN/*` se crea una nueva (`git checkout -b feat/<slug>`). Nunca commitear directo en `main` ni en una `sN/*`: **lo impide `.githooks/pre-commit`**, que activa el `npm install` de `backend/` o de `frontend/` (script `prepare`, que pone `core.hooksPath`). Lo prueba `scripts/probar-hook-rama.mjs` en CI.
- El commit sí es por petición: al cerrar cada una, usar la skill `/commit`.
- Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el contrato y el README de esa capability al día. **Sí hay fichero que generar** desde [ADR-0007](docs/adr/0007-el-contrato-se-genera-se-versiona-y-se-vigila-la-deriva.md): `npm run openapi:generate` escribe `docs/api/openapi.json`, y `openapi:check` pone la build en rojo si se olvida. Se commitea también el diff regenerado de `.adonisjs/`; el README es `docs/capabilities/<nombre>/README.md`.
- `gh pr create` (con una descripción completa de los cambios en el cuerpo del PR) y el pase del subagente `adversarial-reviewer` sobre ese PR van **una sola vez, al terminar la unidad de trabajo**, no al cerrar cada petición. El review adversarial es lo último, antes de dar la unidad por terminada.
- **Se verifica por código de salida, nunca por la última línea impresa** (R-06). · *Fallo silencioso.*
  `npm test; echo $?`, no `npm test | tail -1`: una tubería devuelve el código de su último comando. Pasó tres veces: un `tail -1` que se comió el error del lint, el `$?` de un `tail` al comprobar `openapi:check` ([ADR-0007](docs/adr/0007-el-contrato-se-genera-se-versiona-y-se-vigila-la-deriva.md)), y `gh run list` leyendo solo sus veinte filas por defecto ([H-24](docs/hallazgos.md)).
  **En los workflows lo comprueba el verificador**: todo `run:` con tubería declara `set -o pipefail`, porque Actions usa `bash -e` sin él. Lo que se ejecuta en local sigue siendo criterio.
- **Al saltar a una rama nueva del curso, los hallazgos cruzan y se comprueban uno a uno** (R-07). · *Fallo silencioso: costó nueve defectos vivos.*
  `docs/hallazgos.md` viaja con el proyecto, no con la rama. Lo primero en la rama nueva es traerlo y ejecutar `node scripts/mutaciones.mjs`: cada `NO APLICA` o `SOBREVIVE` es un arreglo que no cruzó, y se registra antes de tocar nada. Lo que no está en el catálogo se comprueba a mano, entrada a entrada. Una tabla dio por cerrados tres hallazgos sin mirarlos ([H-22](docs/hallazgos.md)). El procedimiento completo, al final de `docs/hallazgos.md`.

### Calidad del cambio

Siete reglas, y ninguna viene del curso. Las **seis primeras** son las que renelo aplica en sus proyectos, y viven en `~/.claude/CLAUDE.md` y `~/OPINIONS.md`, heredadas por todos ellos sin que ninguno las declare: se copian aquí para poder **contrastarlas contra un repositorio de verdad**, que es el ejercicio del Módulo 5. La **séptima** no viene de ningún fichero: sale de la cicatriz de este repositorio.

- **Un bug no se cierra sin reproducirlo.** · *Fallo silencioso.*
  Primero se reproduce en un entorno E2E lo más parecido posible a como lo vive el usuario final, y se confirma que el arreglo ataca el problema real y no el síntoma.
  Todo bug arreglado deja detrás una prueba que lo reproduce.
  Nadie nota que no se reprodujo: el bug se cierra igual y el commit se ve idéntico.
  **La mitad de «deja una prueba» la comprueba CI desde el 2026-09-12** (`scripts/fix-con-prueba.mjs`): un commit `fix:` que no toque una prueba ni `scripts/verificar-docs.mjs` pone la build en rojo. Si la prueba no puede ser un fichero -un arreglo de CI que se verifica viéndolo en rojo y en verde-, el mensaje lleva una línea `Sin-prueba: <motivo>`. Lo que no es un arreglo no va como `fix:`. La otra mitad, reproducirlo antes, sigue sin rastro. Es [H-36](docs/hallazgos.md).

- **Al índice se va por nombre.** · *Fallo silencioso, pero auditable.*
  `git add <fichero>`, nunca `git add -A` ni `git add .`. Lo que entra en un commit se decide, no se barre.
  El commit lo registra para siempre, aunque nadie lo mire.

- **Los hooks no se saltan.** · *Fallo ruidoso.*
  Nada de `--no-verify`. Si un hook falla, se investiga la causa.
  Saltarlo convierte la comprobación en decorado, y es un acto deliberado que hay que teclear.
  Hasta el 2026-09-12 no había hooks y la regla no protegía nada. Ahora sí: `--no-verify` es la única forma de commitear en `main` o en una `sN/*` pese a `.githooks/pre-commit`, o con un asunto que no sea `tipo(ámbito): qué` pese a `.githooks/commit-msg` (desde el 2026-09-13; lo prueba `scripts/probar-hook-mensaje.mjs`).

- **Todo atajo tomado por velocidad se escribe como deuda técnica.** · *Fallo silencioso, y el que más decae.*
  Explícito, con su motivo, en el sitio donde alguien lo vaya a leer. Un atajo sin registrar deja de ser una decisión y pasa a ser cómo funciona el sistema.

- **Un lint en rojo, un test que falla o uno flaky se arreglan aunque no los hayas causado.** · *Fallo silencioso.*
  Es la más fácil de contrastar contra un repositorio en vivo, y la que más rápido se erosiona: cada excepción hace la siguiente más barata.

- **La documentación desactualizada es peor que no tenerla.** · *No se puede comprobar automáticamente.*
  Se documenta cuando aporta valor -ADR, integraciones, variables de entorno, supuestos de seguridad, modos de fallo- y nunca como ritual.
  Ninguna comprobación sabe si un documento sigue siendo útil. Solo sabe si sigue coincidiendo con el código, que es otra cosa y es lo que hace `scripts/verificar-docs.mjs`.

- **Una comprobación cuenta cuando se la ha visto fallar.** · *Fallo peor que silencioso: da una garantía que no existe.*
  Toda comprobación que se añada -al verificador, a CI, a la suite- se demuestra **mutando el código a propósito** y viendo que se pone en rojo. Si no se ha visto fallar, no cuenta como comprobación: cuenta como una segunda regla escrita, y encima con la apariencia de estar ejecutada.
  No es una precaución teórica. Siete revisiones adversariales seguidas encontraron el verificador en verde sobre mutaciones reales, siempre por el mismo motivo: la mutación con la que se había probado cada comprobación era la que esa comprobación ya cubría por construcción.
  Y el 2026-09-09 volvió a pasar, con la regla ya escrita: dos comprobaciones nuevas nacieron leyendo el código **con los comentarios dentro**, así que un comentario las satisfacía. Es [H-29](docs/hallazgos.md), y lo encontró el revisor en CI, no una persona. La advertencia estaba treinta líneas más arriba en el mismo fichero.
  Viene de [ADR-0004](docs/adr/0004-la-documentacion-se-verifica-no-se-regenera.md), donde estaba escrita como consecuencia de una decisión y no como regla de proceso. Se sube aquí porque es lo que sostiene la columna «Qué la ejecutaría» de la auditoría: sin ella, esa columna es una lista de comprobaciones que nadie sabe si muerden.
  **Desde el 2026-09-12 lo ejecuta CI**: `scripts/mutaciones.mjs` reintroduce defectos que ya existieron y exige que la comprobación que dice cubrir cada uno se ponga en rojo **nombrando ese motivo**, no por otro. Falla también si una mutación ya no se aplica porque el código cambió. **Al añadir una comprobación, se añade su entrada al catálogo**: lo que no está en él vuelve a depender de haberlo mirado a mano. Y ese mismo día el catálogo se cazó a sí mismo: un `\b` convertido en un carácter invisible por el escapado de un script de ajuste hacía que ninguna línea de fallo casara.
