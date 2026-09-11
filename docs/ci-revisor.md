# CI: revisor adversarial de PRs con Claude Code

`.github/workflows/claude-review.yml` lanza al agente `adversarial-reviewer`
(`.claude/agents/adversarial-reviewer.md`) sobre cada pull request (abierto,
actualizado, reabierto o que sale de borrador), usando la acción oficial
[`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action).
Publica sus hallazgos como comentarios en el propio PR. El workflow por sí
solo no es suficiente para que esto funcione: faltan pasos que solo puede dar
alguien con acceso de administrador al repositorio.

## Pasos manuales pendientes

1. **Instalar la [Claude GitHub App](https://github.com/apps/claude)** en este
   repositorio. El workflow no le pasa un `github_token` propio, así que la
   acción publica los comentarios autenticándose como esta app instalada, con
   su propio token — no con el `GITHUB_TOKEN` del job (por eso el bloque
   `permissions:` del workflow puede quedarse en solo lectura). Sin la app
   instalada, la acción no tiene forma de escribir en el PR.
2. **Añadir el secreto de credencial** al repositorio (Settings → Secrets and
   variables → Actions). Hay dos caminos posibles — ver la sección siguiente —
   pero hay que elegir uno y guardarlo con el nombre exacto que espera el
   workflow.
3. **Fusionar este workflow a la rama por defecto.** GitHub sí evalúa
   `.github/workflows/claude-review.yml` tal como llega en la propia rama del
   PR que lo introduce (los triggers `pull_request` leen el fichero del lado
   propuesto), así que el primer PR que lo añade ya se autoevalúa. Pero hasta
   que ese PR se fusione, el resto de PRs no lo ven: el fichero solo existe en
   esa rama.
4. **Verificar el nombre del secreto tras el paso 2.** Si se guardó como
   `CLAUDE_CODE_OAUTH_TOKEN` pero se dejó el workflow apuntando a
   `ANTHROPIC_API_KEY` (o al revés), la acción arranca pero la primera llamada
   a la API falla — ver el aviso en la sección de credenciales.

## En qué se va el dinero

Cada ejecución consume dos cosas distintas:

- **Minutos de GitHub Actions**, porque el job corre en un runner alojado por
  GitHub. Facturación y límites: la
  [documentación de billing de GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions).
- **Tokens del modelo.** El workflow fija `--model sonnet --effort medium` en
  `claude_args`, acotado además a `--max-turns 40` y a un `timeout-minutes: 10`
  a nivel de job. Se eligió Sonnet en vez de Opus, y `medium` en vez de un
  esfuerzo mayor, porque una revisión adversarial de un diff de PR es una
  tarea bien acotada (leer el diff, contrastarlo contra
  `openspec/specs/`, comentar) — no necesita el razonamiento más caro
  reservado para diseño o refactors grandes, y el tope de 40 turnos ya limita
  cuánto puede iterar por PR. Para cambiarlo, edita las líneas `--model` y
  `--effort` en `claude-review.yml` (valores de esfuerzo válidos:
  `low`, `medium`, `high`, `xhigh`, `max`, `ultracode`; dependen del modelo).
  Precio actual por tokens: la
  [página oficial de precios de la API de Claude](https://claude.com/platform/api) —
  no se cita una cifra aquí porque cambia y nadie actualizaría este documento
  cuando lo haga. Si el secreto usado es un token de suscripción
  (`CLAUDE_CODE_OAUTH_TOKEN`), esos tokens consumen la suscripción de Claude
  de quien generó el token en vez de facturarse por separado.

## Credencial: dos caminos

No son intercambiables: cada uno usa una entrada distinta de la acción y un
secreto con nombre distinto. Cruzarlos — guardar una clave de API bajo el
nombre que el workflow lee como token de suscripción, o viceversa — no da un
error explicando el problema: la acción arranca sin quejarse y falla recién
en la **primera llamada** a la API, con un error de autenticación que no dice
"la credencial no es del tipo que esperabas".

### 1. Token de suscripción (el que usa este workflow por defecto)

- Se genera en local, con la sesión de Claude Code ya autenticada contra tu
  cuenta de pago (Pro, Max, Team o Enterprise): `claude setup-token`.
- Se guarda como secreto del repositorio con el nombre `CLAUDE_CODE_OAUTH_TOKEN`.
- El workflow lo consume en la entrada `claude_code_oauth_token`:
  ```yaml
  claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
  ```
- Es el camino ya cableado en `claude-review.yml`. Ten en cuenta que el token
  queda atado a la suscripción de quien corrió `claude setup-token`: si esa
  persona pierde acceso a la suscripción, el workflow deja de funcionar.

### 2. Clave de API de la consola

- Se obtiene en la [Claude Console](https://platform.claude.com).
- Se guarda como secreto del repositorio con el nombre `ANTHROPIC_API_KEY`.
- Para usarla, cambia en `claude-review.yml` la línea `claude_code_oauth_token`
  por:
  ```yaml
  anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
  ```
- Tiene sentido sobre todo si se quiere separar el gasto de este workflow de
  la suscripción de una persona concreta, o compartir la misma credencial
  entre varios repositorios de una organización.

## PRs propuestos desde un fork en un repositorio público

Si este repositorio es público, GitHub no expone los secretos del repositorio
a los workflows disparados por un pull request que viene de un fork: ni
`CLAUDE_CODE_OAUTH_TOKEN` ni `ANTHROPIC_API_KEY` llegan a esa ejecución. En la
práctica, el workflow se dispara igualmente para un PR desde un fork, pero la
acción no tiene credencial con la que llamar al modelo y esa ejecución falla
sin publicar ningún comentario. La revisión automática solo funciona de
verdad para PRs propuestos desde ramas de este mismo repositorio.
