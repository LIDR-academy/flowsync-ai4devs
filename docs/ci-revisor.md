# El revisor de CI

[`.github/workflows/revisor.yml`](../.github/workflows/revisor.yml) lanza la
[acción oficial de Claude Code para GitHub Actions](https://github.com/anthropics/claude-code-action)
sobre cada pull request. El revisor lee su calibración de [`REVIEW.md`](../REVIEW.md) y publica los
hallazgos como comentarios en el propio PR.

> **Ojo con `REVIEW.md` en un PR.** La acción restaura `.claude/` y `CLAUDE.md` desde la rama base,
> pero `REVIEW.md` no está en esa lista: el revisor lee la versión que trae el pull request. Un
> cambio a `REVIEW.md` se aplica a su propia revisión, así que revisa a mano los PRs que lo toquen.

**Tal y como está commiteado, el trabajo no funciona todavía.** Le falta lo que no se puede meter en
un fichero: el secreto. Esto es lo que queda por hacer a mano.

## Pasos manuales pendientes

1. **Instalar la GitHub App de Claude** en el repositorio: <https://github.com/apps/claude>. La acción
   la usa para autenticarse contra GitHub y poder comentar. Requiere ser administrador del
   repositorio.
2. **Crear el secreto con la credencial** (Settings → Secrets and variables → Actions → New
   repository secret). Cuál, con qué nombre y con qué entrada, en la sección siguiente.
3. **Comprobarlo en un PR de verdad.** El primer PR después de crear el secreto es la prueba: si la
   credencial está mal, el trabajo falla en la primera llamada al modelo.
4. **Opcional: hacerlo obligatorio.** Si quieres que un PR no se pueda mergear sin revisión, añade
   `revisión adversarial` como required status check en la protección de rama de `main`. Ojo con
   esto y los forks: ver la última sección.

## La credencial: dos caminos que no se cruzan

Hay dos formas de pagar las llamadas del revisor. **Cada una usa una entrada distinta de la acción y
un secreto con un nombre distinto.** No son intercambiables.

### Camino 1 — tu suscripción (Pro o Max)

Es el que está puesto en el workflow. El token se genera en local, con la sesión que ya tienes:

```bash
claude setup-token
```

| | |
|---|---|
| Nombre del secreto | `CLAUDE_CODE_OAUTH_TOKEN` |
| Entrada de la acción | `claude_code_oauth_token` |
| Quién paga | Tu suscripción de Claude, contra sus límites de uso |

Ya está escrito así en el workflow, así que con crear el secreto basta.

### Camino 2 — clave de API de la consola

Una API key de <https://console.anthropic.com> (o [platform.claude.com](https://platform.claude.com)),
facturada por tokens consumidos.

| | |
|---|---|
| Nombre del secreto | `ANTHROPIC_API_KEY` |
| Entrada de la acción | `anthropic_api_key` |
| Quién paga | La organización de la consola, por uso |

Para cambiar a este camino hay que tocar **las dos cosas** en `revisor.yml`:

```yaml
# en vez de:
claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
# poner:
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### ⚠️ Cruzarlos falla, y falla mal

Meter un token de `claude setup-token` en el secreto `ANTHROPIC_API_KEY`, o una clave de API en
`claude_code_oauth_token`, **no da un error de configuración**: la acción arranca, instala todo,
prepara el contexto del PR y **revienta en la primera llamada al modelo** con un error de
autenticación que no dice que el problema sea que la credencial va por la entrada equivocada. Se
pierde el run entero persiguiendo un fantasma.

La regla, corta: **token de `setup-token` → `claude_code_oauth_token` → secreto
`CLAUDE_CODE_OAUTH_TOKEN`. Clave de API → `anthropic_api_key` → secreto `ANTHROPIC_API_KEY`.** Nunca
las dos a la vez.

## En qué se va el dinero

El coste del revisor es, esencialmente, **tokens de modelo**: los que lee (el diff del PR, la
calibración, los ficheros que abre) y los que escribe (los comentarios). El minutaje de GitHub
Actions es despreciable al lado.

### Qué modelo usa y por qué

El workflow fija en `claude_args`:

```
--model sonnet
--effort medium
--max-turns 40
```

- **`--model sonnet`** es la elección económica. Revisar un diff es una tarea acotada —leer, contrastar
  contra una spec, señalar— y no necesita el modelo más caro de la familia. Opus cuesta bastante más
  por token y el salto de calidad no compensa en una revisión que se lanza en *cada* push a *cada*
  PR.
- **`--effort medium`** limita cuánto razona antes de responder. Menos esfuerzo, menos tokens de
  pensamiento, menos factura.
- **`--max-turns 40`** es el tope duro: pase lo que pase, el revisor no encadena más de 40 turnos. Es
  el freno que impide que un PR raro se coma una tarde de presupuesto. Junto con
  `timeout-minutes: 10`, son dos topes independientes — uno cuenta turnos, el otro cuenta minutos.

### Cómo cambiarlo

Todo se toca en el bloque `claude_args` de
[`revisor.yml`](../.github/workflows/revisor.yml):

| Quiero… | Cambio |
|---|---|
| Revisiones más finas, pagando más | `--model opus`, o subir a `--effort high` |
| Gastar menos todavía | Bajar a `--effort low`, o pasar a un modelo más barato — `--model` acepta un alias (`sonnet`, `opus`, `fable`) o el nombre completo, p. ej. `claude-haiku-4-5-20251001`; el catálogo está en la [página de modelos](https://platform.claude.com/docs/en/docs/about-claude/models/overview) |
| Que se corte antes | Bajar `--max-turns` y/o `timeout-minutes` |
| Que revise menos PRs | Acotar el `on:` (por ejemplo, quitar `synchronize` para que solo revise al abrir el PR, no en cada push) |

### Los precios

**No los cito aquí a propósito.** Cambian, y una cifra escrita en un README envejece en silencio: nadie
vuelve a mirarla, y se toman decisiones con un número que dejó de ser cierto hace meses. Están en la
página oficial:

- Precio por token de cada modelo: <https://platform.claude.com/docs/en/about-claude/pricing>
- Planes de suscripción (para el camino 1): <https://claude.com/pricing>

## Pull requests desde un fork, en un repositorio público

Esto es importante si el repositorio es o se hace público.

**GitHub no expone los secretos del repositorio a un workflow disparado por un `pull_request` que
viene de un fork.** Es una protección deliberada: si lo hiciera, cualquiera podría abrir un PR con un
workflow modificado y llevarse tus credenciales
([documentación de GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)).
Además, la propia acción exige que quien la dispara tenga permiso de escritura en el repositorio, y
el autor de un PR desde un fork normalmente no lo tiene.

Resultado: sobre un PR de un fork, el revisor **no puede funcionar**. Sin el guardia que lleva el
workflow, fallaría con un error de autenticación confuso en cada PR externo. Por eso el trabajo lleva:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

Con eso, un PR desde un fork **se salta el trabajo limpiamente** en vez de pintarlo en rojo. Dos
consecuencias que conviene tener presentes:

- Las contribuciones externas **no se revisan automáticamente**. Alguien con acceso de escritura
  tiene que revisarlas, o volver a lanzar la revisión desde una rama del propio repositorio.
- Si conviertes este trabajo en un required status check, un PR desde un fork se quedará
  **esperando indefinidamente** a un check que nunca va a correr. Si necesitas las dos cosas,
  configura la protección de rama para no exigirlo en PRs externos, o revisa esos PRs a mano.

Existe la vía de `pull_request_target`, que sí ve los secretos, pero ejecuta con los permisos del
repositorio base sobre código que ha escrito un desconocido. **No la uses aquí sin leer antes** la
[guía de seguridad de la acción](https://github.com/anthropics/claude-code-action/blob/v1/docs/security.md)
y la de [GitHub Security Lab](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/).
