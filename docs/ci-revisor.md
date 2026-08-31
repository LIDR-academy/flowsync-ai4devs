# El revisor de CI: qué falta, y en qué se va el dinero

`.github/workflows/revisor.yml` lanza [`anthropics/claude-code-action@v1`](https://github.com/anthropics/claude-code-action)
sobre cada pull request: lee la calibración del repositorio y el diff, y publica los hallazgos como
comentarios anclados a línea más un resumen. **Está escrito, pero no funciona todavía**: le faltan
dos pasos manuales que no se pueden commitear.

## Pasos manuales pendientes

1. **Instalar la app de GitHub de Claude** en el repositorio: <https://github.com/apps/claude>. Es el
   camino de autenticación por defecto de la acción; por eso el workflow ya pide `id-token: write`,
   con el que la acción intercambia un token OIDC por el de la app. Sin la app instalada, la acción
   falla al pedir permisos sobre el PR.
2. **Dar de alta el secreto de la credencial**, en *Settings → Secrets and variables → Actions → New
   repository secret*. Cuál, y con qué nombre exacto, depende del camino que elijas: los dos de
   abajo. Hace falta ser administrador del repositorio.

Nada más. El workflow no necesita variables de entorno, ni base de datos, ni instalar dependencias:
el revisor solo lee ficheros y comenta.

> Detalle a tener en cuenta: la acción detecta automáticamente un `.mcp.json` en la raíz del
> repositorio, y aquí hay uno que apunta al MCP de Atlassian. Ese servidor pide un OAuth interactivo
> que en CI no existe, y sus herramientas no están en `--allowedTools`, así que el revisor no puede
> usarlas. Si algún día ensucia el log, se le pasa `--strict-mcp-config` o se mueve el fichero.

## La credencial: dos caminos, y no se cruzan

### 1. Suscripción (Pro/Max) — el token que se genera en local

```bash
claude setup-token      # en tu máquina, con la sesión de tu suscripción
```

- **Nombre del secreto:** `CLAUDE_CODE_OAUTH_TOKEN`
- **Entrada de la acción:** `claude_code_oauth_token` ← es la que usa el workflow **hoy**
- **Factura:** ninguna por token. El uso consume los límites de tu plan
  ([planes](https://claude.com/pricing)).

### 2. Clave de API de la consola

Se crea en la consola de Anthropic (*API keys*).

- **Nombre del secreto:** `ANTHROPIC_API_KEY`
- **Entrada de la acción:** `anthropic_api_key` ← hay que **editar el workflow** para cambiar la
  línea de `claude_code_oauth_token` por esta
- **Factura:** por tokens consumidos, en la cuenta de la organización

### Cruzarlos no da un error que se entienda

Cada credencial se valida contra el esquema de autenticación de su entrada. Si metes una clave de
API en `claude_code_oauth_token` —o un token de `setup-token` en `anthropic_api_key`—, el trabajo
**falla en la primera llamada** con un error de autenticación que no dice que las hayas cruzado. El
nombre del secreto y el nombre de la entrada viajan juntos: si cambias uno, cambia el otro.

## En qué se va el dinero

El revisor corre con `--model sonnet --effort medium --max-turns 40` y `timeout-minutes: 10`, todo
en `claude_args` dentro de `.github/workflows/revisor.yml`.

- **Qué modelo:** `sonnet`. El alias lo resuelve el CLI al Sonnet vigente, así que no hay que tocar
  el workflow cada vez que sale una versión nueva.
- **Por qué ese:** es el escalón más barato que revisa código con criterio, y este trabajo lee y
  comenta, no escribe código. Sonnet cuesta bastante menos por millón de tokens que el escalón
  Opus; las cifras exactas, en la página oficial de precios (abajo) y no aquí, porque cambian y una
  cifra escrita en un documento envejece sin que nadie se entere.
- **Dónde se va el gasto:** en los tokens de entrada. Cada ejecución paga por lo que el revisor lee
  —la calibración, el diff y los ficheros que abre—, y eso crece con el tamaño del PR. Los tres
  frenos son `--max-turns 40` (cuántas idas y venidas), `--effort medium` (cuánto piensa en cada
  una) y `timeout-minutes: 10` (el reloj de pared, que corta el gasto pase lo que pase).
- **Cómo cambiarlo:** editando esas mismas banderas. `--model opus` para una revisión más severa y
  más cara; `--model haiku` para una más barata y más superficial; `--effort high` si prefieres que
  piense más antes de comentar; bajar `--max-turns` si los PR son pequeños y quieres acotar el gasto
  por ejecución.
- **Precios:** <https://platform.claude.com/docs/en/pricing>. Por el camino de suscripción no hay
  factura por token: el gasto se descuenta de los límites del plan (<https://claude.com/pricing>).

## Los pull requests desde un fork

En un repositorio público, **un PR desde un fork no ve los secretos del repositorio**: es una
protección de GitHub, no una configuración que se pueda relajar desde aquí. La credencial llegaría
vacía y el trabajo moriría en la primera llamada, así que el workflow lleva una guarda:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

Con ella, esos PR **se saltan limpiamente** en vez de aparecer en rojo por algo que su autor no puede
arreglar. Además, la propia acción solo se ejecuta para quien tiene permiso de escritura en el
repositorio, así que un PR de alguien de fuera tampoco la dispararía aunque hubiera secreto.

Consecuencia práctica: este repositorio recibe PR de forks de alumnos, y **esos no se revisan
solos**. Si hace falta revisar uno, se trae la rama al repositorio y se abre el PR desde dentro. El
patrón alternativo (`pull_request_target` o `workflow_run`, que sí ven los secretos) ejecuta con
código que no controlas y abre la puerta a la inyección de prompt; está documentado en la
[guía de seguridad de la acción](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)
y aquí se ha dejado a propósito sin montar.
