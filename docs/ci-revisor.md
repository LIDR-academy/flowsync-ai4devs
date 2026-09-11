# Revisor de PRs con Claude Code (CI)

`.github/workflows/claude-code-review.yml` lanza la [acción oficial
`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action)
sobre cada pull request. Lee `.claude/agents/adversarial-reviewer.md` (la
misma calibración que usa el subagente `adversarial-reviewer` en local:
objetivo adversarial, contraste contra `openspec/specs/`, hallazgos
priorizados con evidencia) y publica lo que encuentra actualizando un
comentario en el propio PR — no se queda solo en el log de la ejecución.

Es de solo lectura: `claude_args` le da únicamente `Read`, `Grep` y `Glob`
(`--allowedTools "Read,Grep,Glob"`); sin herramientas de escritura no puede
tocar el código, y sin `Read`/`Grep`/`Glob` no podría ni abrir su propio
fichero de calibración ni un solo archivo del cambio — cada intento contra
una herramienta que no tiene es un turno gastado sin avanzar. `--max-turns
40` acota cuántos de esos turnos puede gastar y `timeout-minutes: 10` acota
el reloj de todo el job, por si algo se cuelga.

Nota de seguridad de la propia acción: en un PR, `.claude/` (y por tanto
`adversarial-reviewer.md`) se restaura siempre desde la rama base antes de
arrancar a Claude, no desde la versión que trae el PR. Un PR no puede
alterar las reglas con las que se le revisa.

## Pasos manuales pendientes

Nada de esto se puede hacer desde el código del repositorio; son acciones
que solo puede completar quien tenga permisos de administrador sobre él.

1. **Instalar la GitHub App oficial de Claude**: <https://github.com/apps/claude>,
   sobre este repositorio (o la organización). Sin esto la acción no tiene
   forma de comentar en el PR aunque la credencial de Anthropic sea válida.
2. **Generar la credencial y guardarla como secreto del repositorio**
   (Settings → Secrets and variables → Actions). Ver la sección siguiente:
   hay dos caminos y no son intercambiables.
3. **Abrir un PR de prueba** una vez esté lo anterior hecho, para confirmar
   que el job corre, comenta y no falla por permisos — el resto de este
   documento explica qué esperar si ese PR viene de un fork.

Nada más: `.claude/agents/adversarial-reviewer.md` y `openspec/specs/` ya
existen en el repositorio, y el propio workflow ya pide exactamente los
permisos de `GITHUB_TOKEN` que necesita (`contents: read`, `pull-requests:
write`, `id-token: write`).

## La credencial: dos caminos, no intercambiables

### Camino 1 — suscripción (recomendado, primero)

Si quien mantiene el repo tiene un plan Pro o Max, genera el token en su
máquina:

```bash
claude setup-token
```

Guarda el valor como secreto del repositorio con el nombre
**`CLAUDE_CODE_OAUTH_TOKEN`**. La acción lo recibe por la entrada
**`claude_code_oauth_token`** — así es como está cableado hoy en
`claude-code-review.yml`.

### Camino 2 — clave de API de la consola

Genera una clave en la consola de Anthropic y guárdala como secreto con el
nombre **`ANTHROPIC_API_KEY`**. La acción la recibe por la entrada
**`anthropic_api_key`**. Para usar este camino en vez del primero, en
`claude-code-review.yml` hay que cambiar:

```diff
- claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
+ anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Por qué no son intercambiables

Cada entrada de la acción espera el formato de credencial de su propio
camino: un token de sesión OAuth no es una clave de API, y viceversa. Si el
nombre del secreto y la entrada no coinciden — por ejemplo, guardaste una
clave de API pero la guardaste con el nombre `CLAUDE_CODE_OAUTH_TOKEN`, o
cableaste `anthropic_api_key` pero el secreto que existe es
`CLAUDE_CODE_OAUTH_TOKEN` — el fallo no aparece al guardar el secreto ni al
abrir el PR: aparece en la primera llamada que la acción hace a la API, como
un error de autenticación genérico que no dice "cruzaste las credenciales".
Si el job falla ahí, lo primero a revisar es justo esto: que el nombre del
secreto que existe en el repositorio sea el mismo que la entrada que usa
`claude-code-review.yml`.

## En qué se va el dinero

- **Modelo**: `--model sonnet`. No es un nombre de modelo fijo sino un
  alias — se resuelve siempre al Sonnet vigente en el momento de la
  ejecución, así que no hace falta tocar el workflow cada vez que sale una
  versión nueva.
- **Por qué ese y no otro**: es una revisión de código con herramientas de
  solo lectura y un objetivo acotado (contrastar un diff contra unos
  scenarios y priorizar hallazgos), no generación abierta ni una tarea
  masivamente larga. Sonnet es el punto medio de la familia entre Opus
  (pensado para tareas más complejas, más caro) y Haiku (más barato pero
  con menos margen para seguir con precisión una calibración adversarial
  como la de `adversarial-reviewer.md`).
- **Cómo cambiarlo**: edita `--model` dentro de `claude_args` en
  `claude-code-review.yml`. Acepta los alias `sonnet`, `opus`, `haiku`,
  `fable`, o el nombre completo de un modelo concreto si se necesita fijar
  una versión exacta en vez de seguir al Sonnet vigente.
- **`--effort medium`**: cuánto razona Claude antes de responder en cada
  turno. Subirlo a `high`/`xhigh` cuesta más y tarda más; `low` es más
  barato pero revisa más superficialmente.
- **`--max-turns 40`**: cada `Read`/`Grep`/`Glob` que usa cuenta como un
  turno. Es un tope de gasto máximo por ejecución, no un coste fijo — una
  revisión sencilla puede terminar en muchos menos.
- **Precio real**: cambia con el tiempo, así que no lo copies aquí —
  consulta la página oficial:
  <https://platform.claude.com/docs/en/about-claude/pricing> (precio por
  token de la API) y <https://claude.com/pricing> (planes de suscripción,
  relevante si usas el camino 1).

## PRs desde un fork en un repositorio público

Este repo recibe habitualmente PRs desde forks de otros alumnos. En un
evento `pull_request` disparado desde un fork, GitHub **no** expone los
secretos del repositorio al job — `secrets.CLAUDE_CODE_OAUTH_TOKEN` (o
`ANTHROPIC_API_KEY`) llega vacío, sea cual sea el camino configurado. A eso
se suma que la propia acción exige que quien abrió el PR tenga acceso de
escritura al repositorio antes de hacer nada; la mayoría de quienes abren un
PR desde un fork no lo tiene.

En la práctica: el job se dispara igualmente, pero no llega a comentar nada
— falla (o la acción se detiene sola por falta de permisos del autor) antes
de gastar una sola llamada a la API. No hay secreto expuesto ni coste, pero
tampoco hay revisión para esas contribuciones externas.

Si en algún momento se quisiera revisar también los PRs de fork, la propia
acción documenta cómo (evento `pull_request_target`, que sí recibe los
secretos de la rama base) pero con matices de seguridad importantes sobre
qué se hace checkout — no está configurado así aquí, y cambiarlo es una
decisión aparte, no un ajuste menor de este workflow.
