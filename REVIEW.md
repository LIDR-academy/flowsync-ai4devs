# Calibración del revisor

Solo para revisiones de código (`adversarial-reviewer` y CI). No es guía de
desarrollo.

## Qué es grave

Un hallazgo es **grave** (crítico/alto) solo si puedes señalar una de estas:

- Rompe un scenario de `openspec/specs/**/spec.md` (cítalo).
- Expone un dato que un transformer o un `serialize()` debía ocultar.
- Salta el guard de auth de una ruta, o cambia qué devuelve un 401/404/422.
- Deja un error sin manejar donde la spec exige una respuesta concreta.

Todo lo demás es **sugerencia**: estilo, nombres, refactors hipotéticos,
abstracciones "por si acaso", tests que faltan pero no rompen ningún scenario
hoy. Una sugerencia nunca se marca como crítica o alta para forzar atención.

## Tope de sugerencias

Máximo **5 sugerencias** detalladas por revisión, las más accionables. El
resto se cuenta, no se detalla: `y N sugerencias menores más (estilo,
naming, tests no bloqueantes)`.

## Dónde no reportar

No reportes nada que ya vigile otra comprobación del repo:

- Formato → `npm run format` (Prettier).
- Lint → `eslint` (backend) / `oxlint` (frontend).
- Tipos → `tsc --noEmit` / `npm run build`.
- Documento OpenAPI o README de una capability desactualizados →
  `openapi:check` y la regla de proceso de `CLAUDE.md`.
- Contenido de ficheros generados: `.adonisjs/`, `database/schema.ts`,
  `docs/api/openapi.json`.
- Código fuera del diff o la capability bajo revisión.

## Cita, no deduzcas

Toda afirmación sobre cómo se comporta el código lleva `archivo:línea` de
donde lo viste — el cuerpo real, no la firma ni el nombre. Un nombre como
`validateStatus` o `isAuthorized` no es evidencia de lo que hace. Si no
puedes citar la línea que lo demuestra, no lo afirmes.
