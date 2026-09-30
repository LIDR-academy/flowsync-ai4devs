<!-- Generado desde la lección de ejercicio del módulo: no se edita a mano. -->

# Ejercicio FlowSync: bloquea el dato que no debe salir y guarda el rastro

Es la última lección del módulo y la única que se hace con el portátil delante. Trae el setup del entorno, la tarea y cómo se entrega, todo en un sitio.

> 📌 **Ve guardando cada prompt tal cual lo lanzas**, desde el primero. Se entregan, y reescribirlos al final de memoria no sirve: lo que se revisa es **cómo lo pediste**, no la versión limpia que recuerdas. Hay un archivo esperándolos en el propio repositorio.

El ejercicio tiene cuatro partes: el inventario (A), el hook (B), probarlo con un dato que no debe entrar (C) y las tres líneas que entregas (D).

---

## 🔁 Cómo funciona este módulo

Hay tres momentos, y saberlos cambia cómo aprovechas cada uno.

**1. Lo intentas tú.** Sobre el proyecto de abajo, con tu agente y con el reloj puesto. Entregas lo que te salga, **con lo que tenga**. La entrega a medias no es un problema: este paso no se puntúa por completarlo, y lo que se discute en vivo son las cosas con las que te chocaste.

**2. Lo ves resuelto en el directo.** El mentor monta este mismo hook, con las mismas tres reglas y sobre este mismo proyecto. Si a ti no te salió, ahí ves que se puede y cómo. Por eso conviene **mirar sin teclear**: lo vas a repetir con calma después.

**3. Lo replicas.** Los prompts que use el mentor te llegan por escrito. Con ellos vuelves a tu entorno y rehaces el recorrido, que es donde se asienta.

> ⚠️ **En el paso 3 no esperes salidas idénticas, y no es un fallo tuyo.** La inteligencia artificial (IA) no es determinista: con el mismo prompt cambian la redacción del script, el orden en que escribe las reglas y hasta si el agente se niega antes de llegar al commit o deja que salte el hook. En la parte C las **dos** salidas posibles son igual de buenas, y saber cuál te tocó es parte de lo que se entrega. Lo que se repite es **la forma del recorrido**, no el texto.

---

## 🛠️ Deja el entorno listo

### 1. Comprueba lo que necesita tu máquina

Cinco cosas, cada una con el comando que dice si la tienes y el síntoma de tenerla mal. Compruébalas **antes** de clonar nada: fallan más tarde y con mensajes que no mencionan la causa. **No hace falta Docker en este módulo.**

- **Node.js 24 o superior**: `node -v`. El proyecto declara **24 como mínimo**. Medido: con Node 20 la instalación muere con un `Unknown file extension ".ts"` que no menciona la versión por ningún lado; con la 22 arranca entre avisos `EBADENGINE`. Se instala desde `https://nodejs.org`.
- **`make`**: `make --version`. Si no responde: en macOS viene con las herramientas de línea de comandos (`xcode-select --install`); en Linux, con el paquete `build-essential` o equivalente.
- **`git`**: `git --version`. Cualquier versión reciente vale.
- **`jq`**: `jq --version`. El hook que vas a montar lee su entrada con él, igual que el hook de Prettier que el proyecto ya lleva. Sin `jq`, el hook **falla en silencio y parece que no existe**. En macOS, `brew install jq`; en Linux y en WSL, el paquete `jq` de tu distribución.
- **Una cuenta de GitHub**: la entrega es un pull request desde tu propio fork hacia el repositorio del curso.

> 🖥️ **Dónde funciona esto, porque no es en todas partes igual.** En **macOS** y en **Linux**, tal cual. En **Windows**, **dentro de WSL** (*Windows Subsystem for Linux*, el subsistema de Linux para Windows), y esto no es una preferencia: los atajos del proyecto están escritos con órdenes de shell de macOS y Linux (`cp`, `test`, `rm`), así que **en PowerShell no funcionan**.
>
> Y la parte que se olvida: **todo tiene que estar dentro de WSL**, no solo el último comando. El clon, Node, `make` y `jq`. Lo que instales en Windows no existe dentro de esa terminal. Clona además dentro del sistema de ficheros de Linux (`~/…`) y no en `/mnt/c`, o la instalación de dependencias irá muy lenta.

### 2. Forkea y clona el proyecto

Se trabaja sobre **tu propio fork**, porque sobre el repositorio del curso no tienes permiso de escritura: la entrega es un pull request desde él hacia el del curso.

1. Entra en **https://github.com/LIDR-academy/flowsync-ai4devs** y pulsa **Fork**.
2. Clona **tu fork** y entra en la carpeta.
3. Añade el repositorio original como `upstream` y trae de ahí la rama de partida:

```bash
git remote add upstream https://github.com/LIDR-academy/flowsync-ai4devs.git
git fetch upstream
git checkout -b s9/start upstream/s9/start
```

> 🚨 **La rama de partida se trae de `upstream`, no de tu fork.** El formulario de Fork de GitHub trae marcada la casilla de copiar **solo la rama por defecto**, así que tu fork se lleva `main` y nada más. Un `git checkout s9/start` a secas moriría con un `did not match any file(s) known to git` que **no menciona al fork por ningún lado**. Y aunque desmarcaras la casilla, un fork es **una foto del momento**: no recibe las ramas que se publiquen después.

### 3. Instálalo y levántalo

No hay `package.json` en la raíz. Los comandos de `npm` se ejecutan dentro de `backend/` y de `frontend/`, y el `Makefile` de la raíz ya lo hace por ti.

```bash
make setup   # solo la primera vez: instala dependencias, crea los .env, genera la clave de la aplicación y migra
make start   # levanta backend y frontend a la vez; Ctrl-C para los dos
make help    # lista todos los atajos
```

`make start` **se queda corriendo en esa terminal**: para lo demás, abre otra. Para este ejercicio no hace falta tener el servidor levantado; sí hace falta que `make setup` haya terminado bien, porque el agente va a leer el proyecto entero.

Comprueba que cada pieza vive:

- **Backend** en `http://localhost:3333`. Desde otra terminal: `curl -s http://localhost:3333`.
- **Frontend** en `http://localhost:5173`. Ábrelo en el navegador.

### 4. Corre las pruebas del backend

Y la batería de pruebas del backend, una vez, antes de tocar nada. Es la mejor comprobación de que el entorno está bien montado:

```bash
(cd backend && npm test)
```

> 📌 **Los paréntesis no sobran.** Sin ellos te quedas dentro de `backend/`, y ahí no hay `CLAUDE.md`: el siguiente comando que lances parecerá que no encuentra el proyecto. Con ellos vuelves solo a la raíz.

### 5. Mira dos archivos que el agente carga solo

> 🔎 **Antes de empezar, mira dos archivos que el agente carga solo cada vez que arranca aquí:** el `CLAUDE.md` de la raíz y `.claude/settings.json`. Fíjate en que en el segundo ya hay un hook registrado, el que formatea el frontend, y en cómo lee su entrada. Es el modelo del que vas a montar.

### 6. Crea tu rama

Trabaja en **tu propia rama**, no en `s9/start`. Créala **antes del primer prompt** con este nombre:

```bash
git checkout -b bloqueo-<tus-iniciales>
```

Es la rama desde la que vas a entregar. Si el agente commitea en una rama suya, tráete esos commits a la tuya con `git merge <esa-rama>` antes de empujar.

---

## 📋 La tarea

**Monta un hook que impida que un secreto, el correo de una persona o un fichero `.env` entren al repositorio en un commit, que deje una línea escrita cada vez que actúe, y pruébalo pidiéndole al agente un dato que no debe entrar.**

Es el mismo encargo que se resuelve en el directo, con la misma unidad de trabajo y los mismos insumos. **Los prompts los escribes tú**, y son la mitad de lo que se entrega.

**La unidad de trabajo es una y está nombrada:** un hook de Claude Code llamado **`datos-que-no-salen`**, con **tres reglas** que están escritas más abajo y no se cambian, y **un registro** en `docs/seguridad/registro-de-bloqueos.md`. Es pequeño a propósito: lo que se estudia no es el script, es qué deja escrito cuando actúa y qué no puede ver.

> ✋ **Y el corte es fijo: el ejercicio termina con el hook montado y probado.** Lo que viene después se ve resuelto en el directo, y lo que se compara allí es **tu registro con el de la clase**.

### 🅰️ Parte A: el inventario, antes de tocar nada

Pídele al agente que haga el inventario de qué es dato personal o secreto en este proyecto, **y de qué lee él** para trabajar aquí. Tres listas: las tablas y columnas que guardan datos de una persona identificable (que lo lea en las migraciones, no que lo suponga) y los ficheros con ejemplos de correos o nombres; los ficheros que llevan o pueden llevar claves, tokens o contraseñas, estén o no en el repositorio; y **lo que él ha leído o leería por defecto** para hacer un cambio en el backend (el fichero de instrucciones del repositorio, la configuración del harness, los ficheros de entorno, la base de datos local), diciendo de cada uno si su contenido sale de tu máquina cuando trabaja contigo. Sin cambiar ningún archivo.

La tercera lista es la que importa, y es la que nadie hace. Léela despacio: es tu propia máquina contestando la primera pregunta del módulo.

### 🅱️ Parte B: el hook, en dos piezas

Pídeselo al agente. **Las restricciones son estas, y no son negociables**, porque son las mismas con las que se resuelve en el directo. Pásaselas:

- **Pieza 1**: un hook de Claude Code en **`.claude/hooks/datos-que-no-salen.sh`**, registrado en `.claude/settings.json` como **`PreToolUse`** con el matcher **`Bash`**, junto al que ya hay. Lee el JSON (*JavaScript Object Notation*, el formato de texto en que la herramienta le pasa los datos) de la entrada estándar con `jq` (el comando viene en `.tool_input.command`), como hace el hook de Prettier. `set -uo pipefail`.
- **Solo actúa si el comando contiene `git commit`.** Con cualquier otro comando sale con 0 sin decir nada.
- **Mira las líneas añadidas** de lo que va a entrar: el diff preparado (`git diff --cached`). Y si el mismo comando también hace `git add`, además los cambios sin preparar y los archivos nuevos sin seguimiento, porque en ese caso todavía no están en el índice.
- **Tres reglas, y solo estas tres:**
  1. Una clave con forma reconocible: `AKIA` seguido de 16 caracteres (Amazon Web Services, AWS), `sk-ant-` (Anthropic), `ghp_` o `github_pat_` (GitHub), `AIza` seguido de 35 caracteres (Google), `xoxb-`/`xoxp-`/`xoxa-` (Slack), un bloque `-----BEGIN ... PRIVATE KEY-----`, o una línea `APP_KEY=` con valor.
  2. Una dirección de correo cuyo dominio **no** sea `example.com`, `example.org`, `example.net` ni `github.com`. La lista es corta a propósito: los ejemplos y las pruebas de este proyecto ya usan `example.com`, que es un dominio reservado para eso.
  3. El fichero `.env` (ese nombre exacto, en cualquier carpeta) entre lo que entra. Los `.env.example` no cuentan.
- **Si encuentra algo:** sale con **código 2**, escribe por la salida de error qué regla saltó, en qué archivo, y que se sustituya el dato por uno inventado. Y añade **una línea** a **`docs/seguridad/registro-de-bloqueos.md`** con la fecha y hora en UTC (tiempo universal coordinado) en formato ISO 8601, la palabra BLOQUEADO, la regla y el archivo. **Nunca el valor encontrado**: un registro que repite el dato es otra copia del dato. Si el registro no existe, lo crea con una cabecera de una línea.
- **Si no encuentra nada,** sale con 0 y no escribe nada.
- **Pieza 2**: un bloque corto en el `CLAUDE.md` del repositorio, en su sección de reglas de proceso, que diga que ese hook existe, qué tres cosas bloquea, que cuando bloquea **no se desactiva ni se salta** (se sustituye el dato por uno inventado y se vuelve a intentar), y que el registro se commitea con el resto: es la evidencia. `AGENTS.md` no se toca: que mire antes qué es.

Y que lo pruebe antes de darlo por hecho: un archivo temporal con un correo de `gmail.com`, `git add`, un intento de commit. Tiene que salir con 2 y dejar su línea en el registro. Después, fuera el archivo temporal. **La línea se queda**: es la primera evidencia de que el hook existe.

> 📖 **Glosario exprés**
>
> - **Hook `PreToolUse`**: una comprobación que la herramienta lanza por su cuenta **antes** de ejecutar una acción del agente (aquí, antes de cada comando de terminal). Si sale con código 2, la acción no se ejecuta y el mensaje de error le llega al agente.
> - **Diff preparado**: lo que ya está marcado para entrar en el siguiente commit (`git add`). Lo que está cambiado pero no preparado no entra, y por eso el hook lo mira solo cuando el mismo comando lo prepara.
> - **Dominio reservado**: `example.com`, `example.org` y `example.net` existen precisamente para escribir ejemplos sin señalar a nadie. Un correo con ese dominio no es de una persona.

### Parte C: probarlo con un dato que no debe entrar

Ahora pídele al agente **a propósito lo que el proyecto no quiere**: que añada a `docs/capabilities/tasks/README.md`, en la sección de cómo probar a mano contra el servidor real, un ejemplo de `curl` que obtenga el token con la cuenta de pruebas de **Ana Pérez: correo `ana.perez@gmail.com`, contraseña `secreto123`**. Que lo escriba **tal cual, sin cambiar ningún dato, y que cierre con un commit**.

El correo es inventado, y eso es lo que hace bueno el ejemplo: el hook no sabe si Ana Pérez existe. Sabe que `gmail.com` no está en la lista.

Mira qué hace el agente. Puede que el hook salte y el agente sustituya el correo y vuelva a intentarlo; puede que lea la regla del `CLAUDE.md` y se niegue antes de llegar al commit. **Las dos salidas son buenas**, y son distintas: en la primera actuó la pieza 1; en la segunda, la pieza 2. Si pasa lo segundo, pídele que lo intente igual, para ver la primera.

Y después, léelo con tus ojos:

```bash
cat docs/seguridad/registro-de-bloqueos.md
```

> 🔀 **No te asustes si el agente se lleva el trabajo a otra rama.** El propio proyecto le prohíbe commitear en una rama de partida, así que en cuanto tenga algo que guardar creará una rama nueva y commiteará ahí sin pedírtelo. Es el proyecto haciendo lo que se le mandó, no un descuido. `git branch` y `git log --oneline` te enseñan dónde está todo. Y tiene un efecto que despista: después, `git status` sale limpio aunque acaben de escribirse cuatro archivos. **Lo que dice la verdad aquí es el registro.**

### Parte D: las tres líneas

Van en un archivo llamado `HALLAZGOS.md`, en la raíz del proyecto, junto a `prompts.md`. La rama ya lo trae con los tres puntos puestos: escribe una línea debajo de cada uno.

1. **Qué regla saltó en tu prueba, y la línea literal que dejó el registro.** Sin el dato: si tu línea lleva el correo dentro, eso también es un hallazgo, y de los buenos.
2. **Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.** El inventario de la parte A te da candidatos. Es la pregunta interesante del ejercicio: un script solo ve lo que se decide mirando el texto, y saber qué queda fuera es la mitad del asunto.
3. **De qué dudaste**, o qué no pudiste comprobar.

**El entregable no es tener el hook perfecto: son las tres líneas.** Una parte B a medias con las tres líneas escritas vale más que lo contrario, porque lo que se discute en el directo es dónde te chocaste.

### Cómo saber que la has hecho bien

- **El registro tiene al menos una línea fechada, y no lleva el dato dentro.** Si tu línea repite el correo, eso es otra copia del dato: apúntalo, que es un hallazgo de los buenos.
- **El hook sale con 0 y en silencio ante cualquier comando que no sea `git commit`.** Pruébalo con un `git status` a través del agente: si también canta, está mirando de más.
- **Las tres listas de la parte A las sacó de las migraciones y de los ficheros, no de su memoria.** Abre una y compruébalo tú: si nombra una columna que no existe, se la inventó.
- **La segunda línea nombra algo concreto que el hook no puede cazar**, y no *«datos personales en general»*. Un script solo ve lo que se decide mirando el texto.
- **No hay ni un archivo modificado** que no sea el hook, su registro, el `CLAUDE.md` y lo que pediste en la parte C. Si hay más, el agente se puso a arreglar por su cuenta.

> Entrégalo con lo que tenga.

---

## 📤 Cómo se entrega

1. Entrega desde la rama `bloqueo-<tus-iniciales>` que creaste al dejar el entorno listo, no desde `s9/start`.
2. **Guarda tus prompts en `prompts.md`, en la raíz.** Ese nombre y esa ubicación no son negociables: es lo que lee la herramienta que revisa las entregas. El repositorio ya lo trae con su plantilla puesta. **Cada prompt va en su propio bloque de código**, con el modelo y la herramienta que usaste.
3. Empuja tu rama a tu fork (`git push -u origin bloqueo-<tus-iniciales>`) y abre el **pull request (PR, por sus siglas en inglés) desde tu fork hacia el repositorio del curso** (`github.com/LIDR-academy/flowsync-ai4devs`; comprueba que el repositorio base que te propone GitHub es ese y no tu fork), con `HALLAZGOS.md` (tus tres líneas, en la raíz del proyecto), `prompts.md` y el registro de bloqueos dentro.

### El plazo

**El plazo es antes del directo.**

---

## 📚 Si vas justo de tiempo

Prioriza la lección sobre **por qué un prompt no es una consulta sino una transferencia de datos**, que es la que sostiene todo el ejercicio, y la que trata **por qué cumplir no es no hacerlo mal sino poder demostrar qué pasó**: esa es literalmente la del registro que vas a montar. Las otras tres se siguen bien en vivo.

El resto del material de apoyo está en la **lección de recursos de este módulo**, y es opcional.

---

## ✅ Antes de conectarte, comprueba

- [ ] Estás en la rama de partida, sobre **tu fork**, y `git push` funciona.
- [ ] `node -v` responde `v24` o más, y `make --version` y `jq --version` responden, en la terminal donde trabajas (en Windows, la de WSL).
- [ ] `make setup` terminó bien y `(cd backend && npm test)` corrió una vez.
- [ ] **El hook salta**: el intento de commit con un correo de fuera sale con código 2 y deja su línea.
- [ ] **Traes `HALLAZGOS.md`**, en la raíz del proyecto y con sus tres líneas, y el registro de bloqueos versionado.
- [ ] **`prompts.md` está relleno**, con modelo y herramienta en cada bloque.
- [ ] **Tu rama se llama `bloqueo-<tus-iniciales>` y el pull request está abierto contra el repositorio del curso.**

> Trae el archivo tal como quedó, sin maquillarlo: lo que le falta es la mitad de lo interesante.

---

## 🚀 Y después, si quieres llevártelo al trabajo

Probar el mismo hook en un proyecto de otro stack. Esta parte es **opcional**: no se entrega, no cuenta para el plazo y no hace falta para nada de lo anterior. Sirve para comprobar algo que un solo proyecto no te puede enseñar: **qué del hook viaja a otro proyecto y qué no**.

Necesitas tener en tu máquina el repositorio **`blog-ai`**: el servicio de búsqueda semántica y de respuestas sobre un blog, escrito en Python. Es un proyecto que sí lleva un modelo de lenguaje dentro, y **no trae ningún hook ni `CLAUDE.md`**. Si no lo tienes clonado, sáltate esta sección.

1. **Copia el hook** a una carpeta `.claude/hooks/` de ese proyecto y pídele al agente que lo registre en su `.claude/settings.json` con el mismo bloque `PreToolUse` y matcher `Bash` que usa FlowSync. Es un script de shell que lee el comando y el diff: no sabe en qué lenguaje está escrito el proyecto.
2. **Antes de probar, apunta qué crees que hará** el hook con cada uno de estos cuatro casos, y por qué regla:
   - un archivo con un correo de `gmail.com`;
   - un `.env` (en ese proyecto está ignorado por git, así que hace falta forzarlo con `git add -f`);
   - una línea `BASE_DE_DATOS_URL=postgresql://admin:S3cr3t@localhost:5432/x`, con una contraseña dentro de la dirección de conexión;
   - una línea `OLLAMA_API_KEY=abc123def456`, una clave sin la forma de las que reconoce la regla 1.
3. **Prueba los cuatro con un `git commit`** (siempre `git add` de un archivo temporal y, al terminar, fuera el archivo) y compara con lo que habías apuntado.

Lo que sale con las tres reglas de arriba **tal cual**, porque el script no es una IA y no varía: los dos primeros casos los bloquea; los dos últimos **pasan sin decir nada**. Pruébalo también con esa misma dirección de conexión en un servidor con nombre de dominio (`bd.miempresa.com` en vez de `localhost`): sale bloqueada, pero **por la regla del correo**, porque `admin:S3cr3t@bd.miempresa.com` tiene la forma de una dirección. Acierta por un motivo equivocado.

La conclusión es material para la segunda línea de la parte D: **el hook viaja, lo que decide si un dato es secreto no**. Un script solo ve lo que se decide mirando el texto, y cada proyecto tiene sus propios secretos con una forma que el otro no tiene.

---

## 🎯 Qué te llevas del Módulo 9

**El modelo mental**: que un prompt no es una consulta, es una transferencia de datos, y que lo que decide si puedes mandar algo no es cuánto vale para tu empresa sino de quién es y a dónde va. Que la casilla de riesgo de un producto la decide el uso y no la tecnología, y que la parte del reglamento que ya te aplica es la que casi nadie ha mirado. Que el código generado falla por omisión, no con ruido, y que quien lo acepta confía más, así que la pregunta con la que se revisa deja de ser «¿esto está bien?» y pasa a ser «¿qué no está aquí?». Que el ataque no entra por donde escribes tú sino por lo que el agente lee, y que contra eso lo que existe es bajar el daño, empezando por el radio de acción. Y que cumplir no es no hacerlo mal: es poder demostrar después qué pasó, con una evidencia que existía en el momento y que dice, además, lo que dejaste fuera.

**Lo que queda en el proyecto**: un hook en `.claude/hooks/` que impide que un secreto con forma reconocible, el correo de una persona o un fichero `.env` entren al repositorio en un commit, con su línea en `.claude/settings.json`. Un bloque en el `CLAUDE.md` del repositorio que dice que existe y que no se desactiva. Un registro en `docs/seguridad/` con al menos una línea fechada que no repite ningún dato, versionado con el resto. Un fichero de hallazgos con tus tres líneas. Y el registro de tus prompts, con la forma exacta en que se lo pediste, que es lo que vas a poder comparar con lo que se use en clase.
