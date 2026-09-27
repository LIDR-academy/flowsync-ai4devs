# FlowSync

Proyecto de práctica del curso: gestión de tareas en equipo. API en **AdonisJS 7 + SQLite** (`backend/`) y frontend en **React 19 + Vite** (`frontend/`).

Este es el sistema sobre el que trabajas en el Módulo 8. Léelo entero antes de empezar: además de cómo levantarlo, aquí está **el ejercicio y cómo se entrega**.

## Qué necesitas, y cómo compruebas que lo tienes

Una línea por requisito, con el comando que lo verifica y el síntoma de tenerlo mal.

- **Node 24** (la versión con soporte de largo plazo): `node -v` responde `v24.x`. Con Node 20, `make setup` muere con `ERR_UNKNOWN_FILE_EXTENSION ".ts"`; con la 22 arranca entre decenas de avisos `EBADENGINE`.
- **make**: `make --version`. Si falta, verás `command not found: make`.
- **git**: `git --version`. Si falta, verás `command not found: git`.
- **Claude Code**, instalado y con sesión iniciada: `claude --version` responde algo. No hace falta ninguna versión concreta para este ejercicio.

**Dónde funciona esto:** macOS y Linux tal cual. **En Windows, dentro del Subsistema de Windows para Linux (WSL, por sus siglas en inglés)**, y con **todo** hecho dentro: el clon, Node y `make`. Lo que instales en Windows no existe dentro de WSL. No sirve PowerShell, y el motivo se puede comprobar abriendo el `Makefile` de la raíz: sus atajos usan `cp`, `test` y `rm`, que son de shell de macOS y Linux.

## Arrancarlo

No hay `package.json` en la raíz. Los comandos de `npm` se ejecutan dentro de `backend/` y de `frontend/`, y el `Makefile` de la raíz ya lo hace por ti.

```bash
make setup   # solo la primera vez: instala deps, crea los .env, genera APP_KEY y migra
```

**Comprueba que vive antes de seguir**, o vas a depurar la medición cuando lo que falla es el proyecto:

```bash
(cd backend && npm test)    # tiene que terminar en verde
```

> 📌 **Los paréntesis no sobran.** Sin ellos te quedas dentro de `backend/`, y ahí no hay `CLAUDE.md`: el siguiente comando que lances parecerá que no encuentra el proyecto. Con ellos vuelves solo a la raíz.

## La capa de agente

Vive en la raíz y es **el material del ejercicio**, no un accesorio:

- [`CLAUDE.md`](CLAUDE.md), con la arquitectura del proyecto y, al final, la sección **Reglas de proceso**: lo que hay que hacer antes de tocar código, cuándo se commitea y qué va al cerrar el trabajo. **Es el archivo que hoy está en el banquillo.**
- [`AGENTS.md`](AGENTS.md), el mismo contenido para agentes que leen ese archivo.
- `.claude/`, con los subagentes y las skills del proyecto.

---

# El ejercicio

**Se hace antes del directo.** Son unos **45 minutos** y hay que ponerles un reloj.

Vas a medir, sobre este proyecto, si una regla que lleva meses escrita en el archivo de instrucciones del agente se cumple de verdad. Es el mismo encargo que se resuelve en el directo, con la misma regla y el mismo archivo de salida. Lo que pones tú son los prompts.

> 🚨 **Ve guardando cada prompt tal cual lo lanzas**, desde el primero. Al final se entregan, y reconstruirlos de memoria no vale: lo que se revisa es cómo lo pediste, no solo qué salió.

## Cómo funciona este módulo

Tres momentos, y conviene que los sepas antes de empezar:

1. **Lo intentas tú**, aquí, sobre este proyecto. Entregas lo que te salga, con lo que tenga.
2. **Lo ves resuelto en el directo.** El mentor hace esta misma medición sobre este mismo proyecto. Si no te salió, ahí ves que se puede y cómo.
3. **Lo replicas después**, con los prompts del mentor, que te llegan por escrito.

Por eso la entrega a medias no es un problema: **el paso 1 no se puntúa por completarlo**. Y por eso conviene mirar el directo sin teclear, porque lo vas a repetir con calma luego.

> ⚠️ **La inteligencia artificial no es determinista, y aquí eso no es un aviso legal: es el objeto de estudio.** Si repites el encargo y sale distinto, no lo has hecho mal. Es exactamente lo que vienes a medir. Y cuando repliques este recorrido con los prompts del mentor, tampoco te van a salir sus mismas palabras: lo que se repite es la forma del recorrido, nunca el texto.

> 💳 **Esto consume tu plan, y conviene saberlo antes de empezar.** Cada intento es **una sesión de agente completa** contra tu cuenta de Claude, y el ejercicio pide **cinco**. Es poco, y aun así merece que lo sepas antes que después. La costumbre que lo mantiene barato, y que vas a usar siempre: **no repitas un intento "por si acaso"** sin haber anotado el anterior.

## Parte A: la medición

La regla que vas a medir está en `CLAUDE.md`, en su sección de reglas de proceso, y dice literalmente esto:

> *"Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día."*

Lo que hay que averiguar es **en qué proporción de los intentos se cumple la parte del README**, con este encargo y no otro:

> **"Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`."**

Cinco pasos, y el orden importa:

1. **Apunta tu apuesta antes de medir nada.** ¿Cuántas veces de cinco crees que el README de la capability va a quedar al día? Escríbela; es media línea y es lo que hace que el resultado te diga algo.
2. **Lanza el encargo tal cual, en una sesión nueva.** Pégalo entero y **no le recuerdes la regla**: si hay que recordársela, ya sabes la respuesta y no hace falta medir nada.
3. **Comprueba dos cosas a mano cuando termine**, en este orden:
   - **El control**: ¿quedó declarada la ruta `DELETE`? Si no, el agente no hizo el trabajo, y entonces lo otro no significa nada: ese intento no cuenta.
   - **El resultado**: ¿menciona `docs/capabilities/tasks/README.md` el endpoint nuevo?
4. **Deja el proyecto exactamente como estaba**, o el intento siguiente no mide lo mismo. Son tres comandos y van juntos:

   ```bash
   git checkout -f s8/start            # vuelve a la rama de partida, descartando cambios
   git reset --hard upstream/s8/start  # deshace lo que el agente haya commiteado
   git clean -fd                       # borra los archivos nuevos que dejó
   ```

   Comprueba que funcionó: `git status -sb` tiene que responder **solo** la línea que empieza por `## s8/start`. Si aparece cualquier otra, todavía queda algo dentro.

5. **Repite hasta cinco veces** y anota las dos casillas de cada intento.

> ⚠️ **`git restore .` no basta, y esto es lo que más gente va a pillar, porque falla en silencio.** La regla de proceso que estás midiendo no es la única del archivo: ese `CLAUDE.md` también le pide al agente **crear una rama y commitear** al cerrar el trabajo. Si lo hizo, descartar cambios no deshace nada: `git status` te dice *limpio*, y sin embargo sigues en la rama del intento anterior, con su trabajo ya dentro. El segundo intento arrancaría desde donde acabó el primero, y los cinco números que te salgan no serían cinco medidas de lo mismo.
>
> Las ramas `feat/…` que vaya dejando cada intento puedes ignorarlas: no estorban. Lo que importa es desde dónde arrancas.

> ⏱️ **Sí, es repetitivo, y esa es la mitad de la lección.** Medir una regla significa exactamente esto: el mismo encargo, otra vez, contando.

> ⚠️ **Cuando suene el reloj, para. Aunque esté a medias.** Tres intentos leídos valen más que cinco a medio anotar, y decir cuántos hiciste es parte de la respuesta.

## Parte B: las tres líneas

En el mismo archivo, debajo de la medición. **Esta parte no se puede fallar**, y es la que hay que traer sí o sí: se responde igual de bien si la medición te salió redonda que si se te atascó a la mitad.

1. **Tu apuesta y el resultado.** Si no llegaste a las cinco ejecuciones, di cuántas hiciste.
2. **Qué harías con ese número**: borrar la regla, reescribirla, o convertirla en algo que se ejecute solo. Y por qué.
3. **Una cosa que tu medición no está midiendo.** Siempre hay una, y detectarla vale más que el propio número.

**El archivo de salida es `docs/evals/<tus-iniciales>.md`**, dentro del proyecto, con la parte A y la parte B. El directorio se crea con tu archivo.

---

# Cómo se entrega

**Es un pull request (PR, por sus siglas en inglés) desde tu fork.** Cinco pasos.

### 1. Forkea este repositorio

Con el botón **Fork** de arriba. 🚨 **DESMARCA la casilla que dice copiar solo la rama por defecto**: viene marcada. Sobre un clon directo no tienes permiso de escritura, y aquí vas a crear una rama y commitear.

```bash
git clone git@github.com:<tu-usuario>/flowsync-ai4devs.git
cd flowsync-ai4devs
git remote add upstream git@github.com:LIDR-academy/flowsync-ai4devs.git
git fetch upstream
git checkout -b s8/start upstream/s8/start
make setup
```

> 📌 La rama de partida se trae de `upstream`, no de tu fork: un fork es una foto del momento, y las ramas publicadas después no están ahí.

> 📌 Si te sale `Permission denied (publickey)`, es SSH y no el fork. La guía oficial está en `docs.github.com/es/authentication/connecting-to-github-with-ssh`.

### 2. Crea tu rama

```bash
git checkout -b evals-<tus-iniciales>
```

### 3. Haz el ejercicio

El archivo de la medición va en `docs/evals/`, con la Parte A y las tres líneas de la Parte B.

### 4. Rellena `prompts.md`

Está en la raíz, con la plantilla puesta. **Es obligatorio y es la mitad de lo que se revisa**: lo que se mira no es solo tu resultado, es cómo lo pediste. Un prompt por bloque, con el modelo y la herramienta que usaste.

### 5. Abre el pull request

Contra este repositorio. Con tu rama empujada, GitHub te ofrece el botón arriba.

```bash
git add docs/evals prompts.md
git commit -m "evals: la regla del README de capability, medida"
git push -u origin evals-<tus-iniciales>
```

## El plazo

**Antes del directo.** Lo que llegue a tiempo recibe feedback de tu TA antes de la sesión, que es el momento en que te sirve. Lo que llegue después **se marca como recibido pero no se revisa**: el feedback existe para que llegues al directo sabiendo dónde fallaste, y después de la sesión ya no puede hacer eso.

## Antes de conectarte, comprueba

- [ ] Estás en tu **fork**, en tu rama, y `git push` funciona.
- [ ] `claude --version` responde, y has iniciado sesión.
- [ ] `make setup` terminó y `(cd backend && npm test)` corre en verde.
- [ ] Existe tu archivo en `docs/evals/`, con la Parte A y las tres líneas.
- [ ] `prompts.md` está relleno, con modelo y herramienta en cada bloque.
- [ ] El pull request está abierto.

> La checklist completa para dejar el entorno listo está en la última lección del módulo asíncrono, «Ejercicio FlowSync».
