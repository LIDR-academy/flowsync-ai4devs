# El revisor de CI: lo que falta para que funcione de verdad

[`.github/workflows/revisor.yml`](../.github/workflows/revisor.yml) está commiteado, pero un
workflow no se configura solo. Esto es lo que queda fuera del repositorio, en orden.

## 1. El secreto `ANTHROPIC_API_KEY`

El workflow lee la credencial de `secrets.ANTHROPIC_API_KEY`. Hoy **el repositorio no tiene
ningún secreto de Actions definido**, así que tal cual está el job arrancaría y fallaría al
autenticarse.

1. Sacar una clave de la [consola de Anthropic](https://console.anthropic.com/) → *API keys*.
2. En GitHub: *Settings → Secrets and variables → Actions → New repository secret*, con el
   nombre exacto `ANTHROPIC_API_KEY`.

Hace falta ser administrador del repositorio. Desde la CLI:

```bash
gh secret set ANTHROPIC_API_KEY --repo LIDR-academy/flowsync-ai4devs
```

Ojo con el coste: cada push a un PR abierto dispara una revisión, y cada revisión consume
tokens de esa cuenta. `--max-turns 25` acota cuánto puede trabajar una sola revisión, pero no
cuántas revisiones se lanzan.

## 2. La GitHub App de Claude (opcional, pero conviene)

Sin ella, la acción publica los comentarios con el token del workflow y aparecen firmados por
`github-actions[bot]`. Con ella, aparecen como `claude[bot]` y el token es de la App, de vida
corta y con su propio ámbito.

Se instala desde Claude Code en el terminal:

```bash
claude
/install-github-app
```

También requiere ser administrador del repositorio. Si no se instala, el workflow **igual
funciona**: no es un bloqueo, es una diferencia de identidad y de token.

## 3. Comprobar que Actions puede ejecutarse

En *Settings → Actions → General*: que los workflows estén permitidos y que
*Workflow permissions* no esté en un modo que impida los permisos que el job declara
(`contents: read`, `pull-requests: write`). El job los pide explícitamente, así que basta con
que la organización no los bloquee.

## 4. La primera ejecución hay que mirarla

Abrir un PR de prueba y comprobar tres cosas: que el job arranca, que **publica comentarios en
el PR** y no solo texto en el registro, y que los comentarios inline caen en la línea correcta.
Si los hallazgos aparecen en el log pero no en el PR, casi siempre es que faltan permisos o que
la acción no pudo usar las herramientas de comentario.

## 5. Los PR desde un fork, en un repositorio público

`LIDR-academy/flowsync-ai4devs` **es público**. Esto importa, porque un PR que llega desde un
fork **no va a recibir revisión**, y no por un fallo de configuración: hay dos barreras
independientes, y arreglar una no levanta la otra.

**Barrera 1 — los secretos no viajan a los forks.** GitHub no expone los secretos del
repositorio a un workflow disparado por `pull_request` desde un fork. `secrets.ANTHROPIC_API_KEY`
llega vacío y la acción no puede autenticarse. Es una decisión de diseño de GitHub: si los
secretos viajaran, cualquiera podría robarlos abriendo un PR con un workflow modificado. Por lo
mismo, el `GITHUB_TOKEN` de un PR desde un fork es de **solo lectura**, así que aunque hubiera
clave, tampoco podría publicar comentarios.

**Barrera 2 — la acción exige permiso de escritura.** `claude-code-action` comprueba que quien
dispara la ejecución tenga acceso de escritura al repositorio, y si no lo tiene se detiene antes
de arrancar Claude. Quien envía un PR desde un fork normalmente no lo tiene.

Consecuencia práctica en este repo: las ramas que viven **dentro** del repositorio (`feat/...`,
`alumno/...`) sí se revisan; los PR desde forks externos, no. Merece la pena saberlo antes de
que alguien reporte "el revisor no ha comentado mi PR" como si fuera un bug.

Si hiciera falta cubrir también los forks, las salidas son estas, y ninguna es gratis:

| Opción | Qué implica |
|---|---|
| **No cubrirlos** (lo que hay hoy) | Los alumnos empujan ramas al propio repositorio en vez de a un fork. Cero riesgo añadido. |
| `pull_request_target` | El workflow corre con los secretos del repositorio base. **Nunca** hacer checkout del head del PR en la raíz del workspace: eso ejecuta código de un desconocido con acceso a los secretos. El patrón seguro es checkout de la base en la raíz y del head en un subdirectorio, pasándolo con `--add-dir`. |
| `workflow_run` + `allowed_non_write_users` | Levanta la barrera 2 a propósito. La propia documentación de la acción lo marca como riesgo alto: hay que pasar `github_token: ${{ secrets.GITHUB_TOKEN }}`, mantener los permisos al mínimo y restringir las herramientas. |

Las dos últimas abren la puerta a *prompt injection*: el contenido del PR lo escribe alguien de
fuera y Claude lo lee. No tocarlas sin entender el intercambio.

## Lo que este workflow no hace

- No bloquea el merge: los hallazgos son comentarios, no un check obligatorio. Si se quiere que
  frene un PR, hay que marcarlo como *required status check* en la protección de rama — y
  pensarlo dos veces, porque haría que un fallo de la API de Anthropic bloqueara el merge.
- No arregla nada ni commitea: solo comenta.
- No sustituye al pase de `adversarial-reviewer` que pide `CLAUDE.md` al cerrar una unidad de
  trabajo. Es una red adicional, más superficial y automática.
