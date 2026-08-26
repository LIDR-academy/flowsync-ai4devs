# El revisor de CI

[`.github/workflows/revisor.yml`](../.github/workflows/revisor.yml) lanza un revisor de código
sobre cada cambio propuesto y publica lo que encuentra como comentarios en el propio PR:
uno en línea por hallazgo, anclado a fichero y línea, más un comentario de resumen.

**El fichero está commiteado pero todavía no funciona.** Faltan dos pasos manuales que no se
pueden hacer desde el repositorio, y hasta que no estén, cada run fallará al autenticarse.

---

## Pasos manuales pendientes

### 1. Instalar la app de GitHub de Claude

Instala la [Claude GitHub App](https://github.com/apps/claude) en este repositorio. La acción
se autentica como esa app —por eso el trabajo pide el permiso `id-token: write`— y es lo que
le permite comentar en el PR.

Hace falta acceso de administrador al repositorio. La app se instala con un único conjunto de
permisos que no se puede recortar; si en tu organización eso no pasa el filtro, la alternativa
es crear una app propia con solo *Contents*, *Issues* y *Pull requests* y pasarle su token por
el input `github_token`, según la [guía de setup de la
acción](https://github.com/anthropics/claude-code-action/blob/main/docs/setup.md).

### 2. Guardar la credencial como secreto del repositorio

En *Settings → Secrets and variables → Actions → New repository secret*. Hay dos caminos y el
workflow, tal y como está commiteado, espera el primero.

#### Camino A — token de suscripción (el que usa este workflow)

Disponible en los planes Pro, Max, Team y Enterprise. En local, con Claude Code instalado:

```bash
claude setup-token
```

Genera un token de larga vida atado a **tu** suscripción. Cópialo y guárdalo como secreto con
el nombre exacto:

```
CLAUDE_CODE_OAUTH_TOKEN
```

El workflow ya lo lee (`claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}`), así
que con esto no hay que tocar el fichero.

Lo que conviene saber antes de elegirlo: el token va contra la suscripción de quien lo generó,
no contra una cuenta del equipo. Si esa persona se va, cambia de plan o revoca el token, el
revisor deja de funcionar. Para un secreto compartido entre varios repositorios, la
documentación oficial recomienda el camino B justamente por esto.

#### Camino B — clave de API de la consola

Saca una clave en la [Claude Console](https://platform.claude.com) y guárdala como secreto:

```
ANTHROPIC_API_KEY
```

Con este camino sí hay que editar el workflow: cambia la línea de la credencial por

```yaml
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

La diferencia práctica no es solo de nombre: con el camino A el consumo se descuenta de la
suscripción, con el camino B se factura por token contra la cuenta de la consola.

### 3. Comprobar que funciona

Abre un PR cualquiera contra este repositorio y mira la pestaña *Actions*. Si el secreto no
existe o no vale, el trabajo falla en el paso de revisión con un error de autenticación.

---

## En qué se va el dinero

Cada ejecución gasta dos cosas distintas, y se facturan por separado:

| Recurso | Quién lo cobra | Dónde mirar el precio |
|---|---|---|
| Tokens del modelo | Anthropic (o tu suscripción) | [Precios de la API de Claude](https://claude.com/platform/api) |
| Minutos de runner | GitHub | [Billing de GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions) |

No hay cifras escritas aquí a propósito: cambian, y una cifra en un fichero envejece sin que
nadie se entere. Los enlaces son la fuente.

Con el **camino A** (token de suscripción) los tokens no generan factura por uso: salen del
plan, con sus propios límites de consumo. Con el **camino B** (clave de API) cada run se cobra
por tokens de entrada y de salida.

### Qué modelo usa, y por qué ese

```yaml
claude_args: |
  --model sonnet
  --effort medium
  --max-turns 40
```

**`--model sonnet`.** Es el modelo económico de la familia, y revisar un cambio propuesto es
justo el tipo de trabajo en el que se defiende: leer un diff, abrir los ficheros que toca y
contrastarlos contra una spec que ya está escrita. Es comparar, no diseñar. El coste de
equivocarse tampoco es alto: un revisor automático que se deja algo no rompe nada, lo revisa
igualmente una persona antes de mezclar.

**`--effort medium`.** El esfuerzo de razonamiento. Subirlo hace que piense más por turno, y
eso se paga en tokens de salida y en reloj.

**`--max-turns 40`.** El tope de trabajo: cuántas idas y vueltas puede dar antes de que se le
corte. Es el freno que evita que un PR grande se convierta en una factura grande. Va a la par
con la instrucción del prompt de no escribir ficheros intermedios: cada `> salida.txt` seguido
de su `Read` son dos turnos gastados en algo que ya venía en la salida del comando.

**`timeout-minutes: 10`.** El tope de reloj, independiente del anterior. Aunque le queden
turnos, a los diez minutos el trabajo se corta y deja de consumir minutos de runner.

**`concurrency` con `cancel-in-progress`.** Si llegan dos pushes seguidos al mismo PR, la
revisión del primero se cancela. Revisar un diff que ya no existe cuesta lo mismo que revisar
uno que sí.

### Cómo cambiarlo

Todo esto vive en el bloque `claude_args` del workflow, salvo el reloj:

- **Más profundidad:** `--model opus` y/o `--effort high`. Cuesta bastante más por run. Tiene
  sentido si el revisor está dejando pasar cosas de verdad, no por si acaso.
- **Más barato todavía:** `--model haiku`. Para un repo con PRs pequeños puede sobrar.
- **Menos tope:** baja `--max-turns`. Si ves que las revisiones se cortan a medias, súbelo
  antes de cambiar de modelo — puede ser un problema de presupuesto de turnos y no de
  capacidad.
- **Menos runs:** hoy revisa en `opened`, `synchronize`, `reopened` y `ready_for_review`.
  Quitar `synchronize` deja de revisar en cada push a la rama del PR, que es lo que más
  ejecuciones genera.

Los nombres de modelo y los valores de `--effort` (`low`, `medium`, `high`, `xhigh`, `max`)
salen de la [referencia del CLI](https://code.claude.com/docs/en/cli-reference).

---

## Cambios propuestos desde un fork

En un repositorio público, **GitHub no expone los secretos a un run disparado por un PR desde
un fork**. Es una defensa deliberada: si lo hiciera, cualquiera podría abrir un PR que se
lleve tu credencial.

Consecuencia directa: el revisor no puede funcionar en esos PRs. `secrets.CLAUDE_CODE_OAUTH_TOKEN`
llegaría vacío y el trabajo fallaría al autenticarse. Por eso el workflow lleva esta guarda:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

Con ella, en un PR desde un fork el trabajo aparece como *skipped* en vez de en rojo. Es la
diferencia entre «aquí no se revisa» y «aquí algo está roto», que no es lo mismo para quien
contribuye desde fuera.

Hay un segundo motivo, independiente del anterior: la acción comprueba que quien dispara el
run tenga permiso de escritura en el repositorio, y quien contribuye desde un fork
normalmente no lo tiene. Aunque el secreto llegara, ese filtro pararía el run igualmente.

**Qué hacer entonces con un PR de un fork.** Las opciones razonables, de menos a más riesgo:

1. Revisarlo a mano, que es lo que se hacía antes de que existiera este workflow.
2. Traer la rama al repositorio (`gh pr checkout` y empujarla como rama propia) y abrir un PR
   interno, que sí se revisa.
3. Usar el trigger `pull_request_target`, que sí ve los secretos. **No está puesto a
   propósito**: ese trigger ejecuta el workflow de la rama base pero con el código del fork
   delante, y darle una credencial a código que no controlas es exactamente el agujero que la
   restricción de GitHub existe para tapar.

Mientras este repositorio siga siendo el repo de un curso, donde los PRs salen de ramas
internas, esto no llega a notarse. Está escrito aquí para el día que sí.
