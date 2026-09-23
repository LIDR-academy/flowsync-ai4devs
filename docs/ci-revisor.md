# El revisor de CI

Qué es: el workflow [`.github/workflows/revisor.yml`](../.github/workflows/revisor.yml) lanza
[la acción oficial de Claude Code](https://github.com/anthropics/claude-code-action) sobre cada pull
request y publica los hallazgos como comentarios en el propio PR —en línea sobre la línea concreta, y
un comentario de resumen— en vez de dejarlos en el registro de ejecución.

Este documento es lo que **no** está en el repositorio: los pasos manuales que hay que dar para que
funcione, en qué se va el dinero y los dos casos en los que el trabajo no revisa nada.

## Pasos manuales pendientes

Nada de esto se puede commitear; hay que hacerlo a mano en GitHub y en local.

1. **Dar de alta el secreto de la credencial.** Es lo único imprescindible. Los dos caminos, abajo.
2. **Que el workflow esté en la rama por defecto.** Un workflow que solo existe en una rama sí se
   ejecuta en los PR de esa rama, pero conviene mergearlo pronto: hasta entonces cualquier ajuste
   solo se prueba abriendo PR contra esa rama.
3. **Permitir que las Actions comenten en los PR.** En *Settings → Actions → General → Workflow
   permissions*, la opción «Allow GitHub Actions to create and approve pull requests» no hace falta,
   pero sí que el token del workflow pueda escribir: el workflow ya pide `pull-requests: write`, y
   una organización puede tener capado eso por política. Si los comentarios no aparecen y el
   registro dice `403`, es esto.
4. **Comprobarlo en un PR de verdad.** El primer PR es la única prueba real: aquí no se puede
   verificar que la acción arranca, solo que el YAML es válido.

La calibración del revisor es [`REVIEW.md`](../REVIEW.md), en la raíz: qué cuenta como hallazgo grave
aquí, el tope de sugerencias menores, dónde no reportar y la regla de citar `fichero:línea`. El prompt
del workflow la declara vinculante, así que **ajustar el tono del revisor se hace ahí, no en el YAML**:
si comenta de más, sobra o falta algo en `REVIEW.md`.

## La credencial: dos caminos que no se cruzan

Son dos mecanismos distintos, con **entrada distinta en la acción** y **nombre de secreto distinto**.
Elige uno.

### 1. Suscripción Pro/Max (el que usa este workflow)

```bash
claude setup-token     # en local, con tu sesión de Claude Code ya iniciada
```

Devuelve un token OAuth. Se guarda en *Settings → Secrets and variables → Actions → New repository
secret*:

| | |
|---|---|
| Nombre del secreto | `CLAUDE_CODE_OAUTH_TOKEN` |
| Entrada de la acción | `claude_code_oauth_token` |
| Qué consume | tu suscripción Pro/Max y sus límites de uso |

Es el camino por defecto aquí: si ya pagas la suscripción, el revisor no abre una factura nueva.

### 2. Clave de API de la consola

Se crea en la [consola de Claude](https://platform.claude.com/settings/keys) y empieza por `sk-ant-`.

| | |
|---|---|
| Nombre del secreto | `ANTHROPIC_API_KEY` |
| Entrada de la acción | `anthropic_api_key` |
| Qué consume | saldo de la API, facturado por tokens |

Para usarlo hay que cambiar **las dos cosas** en el workflow: la línea
`claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` pasa a ser
`anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}`.

> **Cruzarlos falla en la primera llamada y el error no lo explica.** Un token de `setup-token`
> puesto en la entrada `anthropic_api_key`, o una clave `sk-ant-` puesta en `claude_code_oauth_token`,
> se envía por el mecanismo equivocado: la acción arranca, hace su primera petición y muere con un
> error de autenticación genérico que no dice «has cruzado los caminos». Si el trabajo falla nada más
> empezar y el secreto «está bien puesto», comprueba **cuál de las dos entradas** lo está recibiendo.

## En qué se va el dinero

El revisor corre con **`--model sonnet`**: el alias del Sonnet vigente, el modelo intermedio de la
familia. Es la elección deliberada de este workflow, no un descuido.

**Por qué ese.** Una revisión de PR es leer un diff acotado y contrastarlo contra unas reglas
escritas. No es investigación abierta ni diseño. Sonnet lo hace bien y cuesta una fracción de lo que
cuesta Opus por token, y esto se dispara en **cada push a cada PR**, así que el coste se multiplica
por la actividad del repositorio, no por el número de revisiones que te apetezca hacer.

Los otros dos límites del gasto están en el mismo fichero y son distintos entre sí:

- `--max-turns 40` acota **el trabajo** de una revisión: cuántos turnos puede gastar el agente.
- `timeout-minutes: 10` acota **el reloj** del trabajo: si se atasca, se corta.
- `--effort medium` acota **cuánto razona** por turno.

**Precios.** No van escritos aquí a propósito: cambian, y una cifra copiada en un `.md` envejece sin
que nadie se entere. Las oficiales:

- API, por millón de tokens y por modelo: <https://claude.com/pricing#api>
  (desglose completo en <https://platform.claude.com/docs/en/about-claude/pricing>)
- Suscripciones Pro/Max: <https://claude.com/pricing>

**Cómo cambiar de modelo.** En `claude_args`, dentro de `.github/workflows/revisor.yml`:

```yaml
claude_args: |
  --model sonnet      # ← aquí
  --effort medium
  --max-turns 40
```

- `--model haiku` — más barato y más rápido; se le escapan cosas en diffs grandes.
- `--model opus` — para revisiones que de verdad lo pidan. Cuesta bastante más por token: mira los
  precios enlazados arriba antes de dejarlo puesto en un repositorio con tráfico.

Se puede subir el modelo sin subir la factura de todos los PR: deja `sonnet` en el workflow y lanza
las revisiones caras a mano cuando hagan falta.

## Cuándo el revisor no revisa

**PR desde un fork, en un repositorio público.** GitHub **no** expone los secretos del repositorio a
un workflow disparado por un `pull_request` que viene de un fork —es lo que impide que cualquiera
abra un PR y se lleve tus credenciales en un `echo`—, y además el `GITHUB_TOKEN` de ese trabajo es de
solo lectura, así que tampoco podría comentar. El revisor se quedaría sin credencial y el trabajo
fallaría con un error de autenticación que no tiene nada que ver con la causa real.

Por eso el trabajo lleva esta guarda:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

Un PR desde un fork **se salta el revisor limpiamente**, sin fallar. Este repositorio recibe PR desde
forks de alumnos, así que no es un caso hipotético: esos PR no se revisan automáticamente y hay que
revisarlos a mano, o volver a lanzar la revisión desde una rama interna.

Existe `pull_request_target`, que sí ve los secretos. **No se usa aquí**: ejecuta con permisos de
escritura y acceso a los secretos en el contexto del repositorio base mientras revisa código que ha
escrito un tercero. Para un repositorio de curso abierto a PR de alumnos, el intercambio no sale a
cuenta.

**PR en borrador.** Ojo: un draft **sí** se revisa. `opened` y `synchronize` se disparan igual en un
borrador; `ready_for_review` solo añade una revisión más al marcarlo como listo. Si no quieres gastar
revisiones en borradores, amplía la guarda del trabajo:

```yaml
if: >-
  github.event.pull_request.head.repo.full_name == github.repository
  && github.event.pull_request.draft == false
```
