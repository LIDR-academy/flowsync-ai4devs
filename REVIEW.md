# REVIEW.md

Calibración para quien revisa este repo (el subagente `adversarial-reviewer`
y el workflow `claude-code-review.yml`). Solo para revisiones — cómo
escribir código va en `CLAUDE.md`.

## Qué es grave aquí

- Contradice un scenario de `openspec/specs/<capability>/spec.md`: la spec
  es la fuente de verdad de comportamiento, no el código ni el nombre de la
  función.
- Expone datos que un transformer no debería exponer, o una ruta se salta
  la auth que debería llevar.
- Rompe la regla de proceso de `CLAUDE.md`: un cambio en rutas,
  controladores, validadores o transformers sin el documento OpenAPI y el
  README de esa capability al día en el mismo commit.
- Un test en verde que no ejerce el comportamiento que dice cubrir.

Todo lo demás — nombres, estructura interna, estilo, micro-rendimiento sin
evidencia de que importa, robustecer un caso que ningún scenario o user
story pide — es sugerencia, no hallazgo.

## Tope de sugerencias menores

Máximo 5 por revisión, cada una con su evidencia. A partir de la sexta, no
las sigas listando: una línea con la cuenta ("y 4 sugerencias menores más
sobre nombres, en `task_transformer.ts` y `tasks_controller.ts`").

## Dónde no reportar

No repitas lo que ya vigila otra comprobación del repo:

- Estilo o formato → `npm run lint` / `npm run format`.
- Tipos → `npm run typecheck`.
- El documento OpenAPI desactualizado → `npm run openapi:check` /
  `.github/workflows/openapi-check.yml`.
- `database/schema.ts` o `.adonisjs/` desincronizados → se regeneran solos
  al arrancar o correr tests; no es un hallazgo, es no haber arrancado nada.
- Los tests de `tasks`/`auth` fallando por `UNIQUE constraint` en
  `users.email`: es la fuga de fixtures entre suites ya documentada en
  `CLAUDE.md`, no un hallazgo nuevo — salvo que el cambio revisado rompa
  algo distinto.

Si algo de esto falla, que falle la comprobación que le toca.

## Evidencia, no nombre

Para afirmar que algo se comporta de una manera, cita `archivo:línea` de
donde lo viste. "el transformer expone el email" sin la línea no vale: el
nombre puede mentir, o ya estar corregido. Si no lo has leído, no lo
afirmes.
