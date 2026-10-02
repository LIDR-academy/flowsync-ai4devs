<!-- Generado desde la lección de ejercicio del módulo: no se edita a mano. -->

# Ejercicio FlowSync: cambia el motor y averigua qué se ha perdido

Es la última lección antes del directo, y la que más se subestima. Trae el entorno que hay que dejar listo, la tarea y cómo se entrega. Todo está aquí y solo aquí.

> 🚨 **Ve guardando cada prompt tal cual lo lanzas, desde el primero.** No al final, no reconstruido de memoria. La mitad de lo que se revisa es **cómo lo pediste**, y eso no se puede recuperar después.

**Cambiar el motor de base de datos del proyecto, de SQLite a PostgreSQL en Docker, con dos bases separadas: una de desarrollo y otra de pruebas. Y después averiguar qué se ha perdido por el camino**, que es la parte que importa.

Es exactamente el mismo encargo que se resuelve en el directo, con la misma unidad de trabajo y los mismos insumos. Lo que no te damos son los prompts: esos los escribes tú.

Son dos partes técnicas y las tres líneas que entregas: en la A cambias el motor, en la B averiguas qué se ha perdido, y en la C escribes las tres líneas.

---

## 🔁 Cómo funciona este módulo

Hay tres momentos, y saberlos cambia cómo aprovechas cada uno.

**1. Lo intentas tú.** Sobre el proyecto de abajo, con tu agente y con el reloj puesto. Entregas lo que te salga, **con lo que tenga**. La entrega a medias no es un problema: este paso no se puntúa por completarlo, y lo que se discute en vivo son las cosas con las que te chocaste.

**2. Lo ves resuelto en el directo.** El mentor hace esta misma migración de motor, con las mismas restricciones y sobre este mismo proyecto. Si a ti no te salió, ahí ves que se puede y cómo. Por eso conviene **mirar sin teclear**: lo vas a repetir con calma después.

**3. Lo replicas.** Los prompts que use el mentor te llegan por escrito. Con ellos vuelves a tu entorno y rehaces el recorrido, que es donde se asienta.

> ⚠️ **En el paso 3 no esperes salidas idénticas, y no es un fallo tuyo.** La inteligencia artificial (IA) no es determinista: con el mismo prompt cambian los nombres de las variables, el orden de los servicios del fichero de Compose y hasta cuántos atajos deja en el Makefile. Lo que no cambia son las restricciones, que por eso van escritas. Lo que se repite es **la forma del recorrido**, no el texto.

---

## 🛠️ Deja el entorno listo

### 1. Comprueba lo que necesita tu máquina

Las herramientas se instalan en la lección anterior, que deja lista **la máquina**. Esta deja listo **el proyecto**, y empieza comprobando cuatro cosas. Pega esto en una terminal:

```bash
docker ps
node -v
make --version
git --version
```

Qué tiene que responder cada una, y **qué vas a ver si la tienes mal**, que es lo que de verdad ahorra tiempo:

- **`docker ps`** tiene que devolver una tabla de columnas, aunque esté vacía. Si responde `Cannot connect to the Docker daemon`, Docker está instalado pero **apagado**: ábrelo como cualquier otra aplicación. Es el fallo número uno y su mensaje es idéntico al de no tenerlo instalado.
- **`node -v`** tiene que devolver **`v24`** o superior. Es lo que pide el mapeador de base de datos de este proyecto, que declara ese mínimo en su propio paquete. **Medido sobre este proyecto:** con Node 20 la instalación muere con un `Unknown file extension ".ts"` que no menciona la versión de Node por ningún lado, y con Node 22 arranca pero avisando de que la versión no es compatible. Si te sale cualquiera de las dos cosas, es esto.
- **`make --version`** tiene que responder `GNU Make` y un número.
- **`git --version`** tiene que responder cualquier número reciente.

> 🪟 **En Windows esto va dentro de WSL, y no es opcional.** WSL es el *Windows Subsystem for Linux*, el Linux que corre dentro de Windows. El proyecto se levanta con `make`, que **no existe en Windows a secas**, y sus atajos usan órdenes de shell de macOS y Linux (`cp`, `test`, `rm`). En PowerShell no funcionan, y el error no dirá que el problema es el sistema operativo.
>
> **Haz todo dentro de WSL**: el clon, Node, `make` y los comandos de esta lección. Lo que instales fuera **no aparece** en esa terminal, y mezclar los dos entornos es la fuente número uno de *«a mí no me funciona»*. Y clona dentro del sistema de ficheros de Linux (`~/…`), no en `/mnt/c`, o la instalación irá muy lenta.
>
> ⚠️ **No damos por hecho que `make` venga con tu distribución de WSL**: comprueba `make --version` y, si no responde, instálalo con el gestor de paquetes de tu distribución.

### 2. Forkea y clona el proyecto

Se trabaja sobre **tu propio fork**, porque sobre el repositorio del curso no tienes permiso de escritura: la entrega es un pull request desde él hacia el del curso.

**1. Forkea el repositorio.** Entra en **https://github.com/LIDR-academy/flowsync-ai4devs** y pulsa **Fork**.

**2. Clona tu fork** y entra en la carpeta.

**3. Trae la rama de partida desde el repositorio original, no desde tu fork:**

```bash
git remote add upstream https://github.com/LIDR-academy/flowsync-ai4devs.git
git fetch upstream
git checkout -b s10/start upstream/s10/start
```

> 🚨 **Esa última línea es la que más se falla, y el error no te va a ayudar.** El formulario de Fork de GitHub trae marcada la casilla de copiar **solo la rama por defecto**, así que tu fork se lleva `main` y nada más. Un `git checkout s10/start` a secas muere con un `did not match any file(s) known to git` que **no menciona al fork por ningún lado**. Y aunque desmarcaras la casilla, un fork es **una foto del momento**: no recibe las ramas que se publiquen después. Traerla de `upstream` es inmune a las dos cosas.

### 3. Instálalo y levántalo

**Levanta el proyecto.** Desde la raíz:

```bash
make setup
make start
```

- **`make setup`** se ejecuta **una sola vez**: instala las dependencias de las dos partes del proyecto, crea los ficheros de configuración y prepara la base de datos. Tarda unos minutos la primera vez.
- **`make start`** levanta a la vez la parte de servidor y la parte de navegador, y **se queda ocupando esa terminal**. Se para con `Ctrl-C`, y para los dos a la vez.
- **`make help`** lista todos los atajos que trae el proyecto. Léelo: te va a hacer falta.

**Cómo compruebas que vive**, que no es lo mismo que «no ha dado error»:

- La parte de servidor responde en `http://localhost:3333`. Pruébala con `curl -s http://localhost:3333` desde otra terminal: tiene que devolver algo, no un error de conexión.
- La parte de navegador se abre en `http://localhost:5173`.

### 4. Corre las pruebas del backend

**Corre la batería de pruebas antes de tocar nada.** Es la mejor comprobación de que el entorno está bien montado, y además es tu línea de partida: necesitas saber que estaba en verde **antes**.

```bash
(cd backend && npm test)
```

> 📌 **Los paréntesis no sobran.** Sin ellos te quedas dentro de `backend/`, y ahí no hay `CLAUDE.md`: el siguiente comando que lances parecerá que no encuentra el proyecto. Con ellos vuelves solo a la raíz.

### 5. Crea tu rama

Trabaja en **tu propia rama**, no en `s10/start`. Créala **antes del primer prompt** con este nombre:

```bash
git checkout -b motor-<tus-iniciales>
```

Es la rama desde la que vas a entregar. Si el agente commitea en una rama suya, tráete esos commits a la tuya con `git merge <esa-rama>` antes de empujar.

---

## 📋 La tarea

### 🅰️ Parte A: cambia el motor

Pídele a tu agente que migre el proyecto de SQLite a **PostgreSQL corriendo en Docker**, con **dos** bases de datos: una de desarrollo y otra de pruebas.

**Las restricciones son estas, y no son negociables**, porque son las mismas con las que se resuelve en el directo. Pásaselas a tu agente:

- El fichero de Compose se llama **`compose.yaml`** y los dos servicios se llaman **`db`** y **`db-test`**.
- La imagen es **`pgvector/pgvector:pg17`**. Es la imagen oficial de PostgreSQL con la extensión de vectores ya dentro.
- Los puertos son **54410** para desarrollo y **54411** para pruebas. **No el 5432**: quien tenga un PostgreSQL suyo levantado se lo encontraría ocupado, y el error que vería no menciona a Docker por ningún lado.
- **La base de pruebas va en memoria, sin volumen.** Es efímera a propósito: una batería de pruebas que depende de lo que dejó la anterior no es una batería de pruebas.
- **Los dos servicios llevan comprobación de salud**, y el arranque espera a que estén sanos. La propia imagen avisa de que, la primera vez, crea la base y **no acepta conexiones mientras tanto**, y de que eso rompe a quien levanta varios contenedores a la vez.
- **Sin la clave `version:`** en el fichero de Compose: está obsoleta y Docker imprime un aviso.
- La batería de pruebas apunta a la otra base por su propio fichero de entorno, que el framework carga solo cuando el entorno es de pruebas.
- Y deja **atajos en el Makefile** para levantar las bases, pararlas, migrar **las dos** y correr las pruebas.

**Ninguna migración existente se toca.** Si tu agente propone cambiar una, párate y anótalo: es un hallazgo, y de los buenos.

### 🅱️ Parte B: averigua qué se ha perdido

Esta es la mitad que de verdad se revisa, y **se hace aunque la parte A se te haya quedado a medias**.

Cuando la batería de pruebas vuelva a estar en verde, **no des el trabajo por terminado**. Haz estas tres cosas y escribe lo que veas:

1. **Corre la comprobación de tipos** (`(cd backend && npm run typecheck)`) y di si está en verde o en rojo. Las dos respuestas son normales, y las dos enseñan algo.
2. **Mira el diff del fichero de tipos generado** (`backend/database/schema.ts`) entre la rama de partida y lo que tienes ahora. Puede salir con declaraciones cambiadas o **vacío**, y las dos salidas son normales. Si salen cambios, di qué declaraciones han cambiado de tipo y de qué a qué. Si sale vacío, busca **qué fija esos tipos** para que no cambien al cambiar de motor, porque vacío no quiere decir que no haya cambiado nada: quiere decir que lo que cambió no está en lo que el proyecto declara.
3. **Busca cómo decide el proyecto si una tarea está vencida** y léelo con lo que encontraste en el punto anterior delante. Hay un comentario en ese código que explica por qué la comparación funciona. Di si ese comentario sigue siendo verdad, y compruébalo con una tarea que ya debería estar vencida, no leyéndolo.

### Parte C: las tres líneas

**El entregable no es que la migración funcione: son las tres líneas.** Van en el fichero `HALLAZGOS.md` de la raíz. La rama de partida ya lo trae con los tres puntos puestos: escribe una línea debajo de cada uno.

1. **Cuántas filas cambian de valor** en tu cambio de esquema, medido con una consulta, y **en qué rama del árbol de reversibilidad** cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.
2. **Una cosa que la batería de pruebas no podía ver.** Si no encontraste ninguna, escribe qué buscaste y dónde.
3. **De qué dudaste**, o qué no pudiste comprobar. Esta es la que más sirve en el directo.

> 💡 **Y si te atascas, entrega igual.** Una parte A a medias con la parte B escrita vale más que una parte A perfecta sin ella. Lo que se discute en el directo son los choques, y quien no entrega es justo quien se queda sin ese rato.

### Cómo saber que la has hecho bien

- **Ninguna migración existente está tocada.** Míralo con `git diff` sobre esa carpeta: si hay cambios ahí, el agente reescribió el pasado y tu medida de qué se perdió ya no mide.
- **La base de pruebas no tiene volumen.** Si lo tiene, la segunda vez que corras la suite arrancará con lo que dejó la primera.
- **Los dos servicios esperan a estar sanos.** Bájalos y súbelos otra vez: si la primera migración falla por conexión rechazada, la comprobación de salud no está haciendo su trabajo.
- **La primera línea es un número que saliste a buscar**, no una estimación. Si escribiste *«pocas filas»*, falta la consulta.
- **Las tres líneas están escritas y son concretas.** La segunda vale incluso si es *«no encontré ninguna»*, siempre que diga qué buscaste y dónde.

> Entrégalo con lo que tenga.

---

## 📤 Cómo se entrega

1. Entrega desde la rama `motor-<tus-iniciales>` que creaste al dejar el entorno listo, no desde `s10/start`.
2. **Guarda tus prompts en un fichero `prompts.md` en la raíz del repositorio.** Ese nombre y esa ubicación no son negociables: es lo que lee la herramienta que revisa las entregas. La rama de partida ya lo trae con su plantilla puesta.
   - **Cada prompt va en su propio bloque de código**, con el modelo y la herramienta que usaste. Escribirlos en una línea suelta no sirve: un prompt real va de dos palabras a diez líneas, y sin delimitador no se sabe dónde acaba uno.
3. Empuja tu rama a tu fork (`git push -u origin motor-<tus-iniciales>`) y abre el **pull request desde tu fork hacia el repositorio del curso** (`github.com/LIDR-academy/flowsync-ai4devs`; comprueba que el repositorio base que te propone GitHub es ese y no tu fork), con `HALLAZGOS.md` y `prompts.md` dentro.

### El plazo

**El plazo es antes del directo.** Lo que llegue después no entra en la sesión, que es para lo que sirve.

---

## 📚 Si vas justo de tiempo

Prioriza la lección sobre **por qué una migración es el cambio que peor se deshace**, que es la que sostiene la parte B entera, y la que trata **por qué el agente no se inventa las columnas sino los valores**. Las cuatro sobre consultas complejas son obligatorias, pero ninguna parte de la tarea depende de ellas, así que pueden ir después de la entrega. Las cuatro de campos vectoriales son opcionales, y tienen su ampliación en la lección de recursos.

Y si el reloj aprieta de verdad, la prioridad es la **parte B**: se escribe igual de bien con la parte A a medias.

---

## ✅ Antes de conectarte, comprueba

- [ ] Estás en la rama de partida, sobre **tu fork**, y `git push` funciona.
- [ ] `docker ps` devuelve una tabla, `node -v` responde `v24` o más, y `make --version` responde.
- [ ] **Las dos bases levantan** en el 54410 y el 54411, y la suite del backend corre contra la de pruebas.
- [ ] Has corrido la comprobación de tipos **una vez** y tienes anotado lo que salió, en verde o en rojo.
- [ ] **Traes `HALLAZGOS.md`** con sus tres líneas, y el fichero de Compose dentro del cambio.
- [ ] **`prompts.md` está relleno**, con modelo y herramienta en cada bloque.
- [ ] **Tu rama se llama `motor-<tus-iniciales>` y el pull request está abierto contra el repositorio del curso.**

> Trae el archivo tal como quedó, sin maquillarlo: lo que le falta es la mitad de lo interesante.

---

## 🎯 Qué te llevas del Módulo 10

**El modelo mental**: que en esta capa los errores caros **no revientan**: un agente que se inventa el nombre de una columna se estrella al momento, y uno que se inventa un valor devuelve cero filas con la forma correcta y pasa cualquier revisión, porque revisar más despacio no arregla que falte el dato. Que una migración se clasifica por **cómo se deshace**, no por cómo está escrita, y que lo que sobrevive a un cambio de motor es lo que está **en** el esquema, mientras que lo que colgaba de la conexión se pierde sin que nada falle. Que una consulta compleja puede ejecutarse sin un error y estar mal: una unión que multiplica filas infla un total, un mes mal acotado pierde su último día, un marco de ventana por defecto acumula de más, y una consulta correcta puede ser la lenta, cosa que el plan de ejecución dice antes que producción. Y, si leíste las opcionales, que un campo vectorial es **una columna más** de una tabla que ya tienes, con su dimensión formando parte del tipo y su vector caducando en silencio cada vez que cambia el texto del que salió. Que un índice de vectores **no busca, adivina**, y que mezclado con un filtro de negocio devuelve menos filas de las que le pides sin decírselo a nadie. Que buscar por parecido no es una versión mejor de buscar, sino **otra pregunta**: responde a lo que el usuario no supo nombrar, y todo lo que sí sabe nombrar es un filtro, que es más barato y siempre igual. Y que los números de un vector **los produce alguien**, que puede ser tu propia máquina o puede ser un tercero que, en su capa gratuita, se reserva por escrito el derecho a leerlos.

**Lo que queda en el proyecto**: un fichero de Compose con dos bases de datos declaradas, la de pruebas efímera a propósito, y los atajos de `make` que las levantan, las migran y corren la batería contra la que toca. Un fichero de entorno de pruebas que apunta a la segunda. Una batería de veintitrés pruebas que sigue en verde sobre un motor distinto del que se escribió, sin que ninguna migración se haya tocado. Y un `HALLAZGOS.md` con tres líneas medidas por ti, que es lo que llevas al directo.

> 👥 **Qué te llevas según de dónde vengas.**
> - **Si eres dev**: una consulta que se ejecuta sin error no ha demostrado nada. Cuenta las filas antes y después de cada unión, acota las fechas con un límite que no se incluye, dale a cada ventana su desempate, y lee el plan antes de que lo lea producción. Y cada migración, antes de escribirla, se clasifica por cómo se deshace.
> - **Si vienes de producto o gestión**: un informe puede estar mal sin que nadie haya cometido ningún error visible, así que «lo hemos revisado» dice muy poco de una consulta. La pregunta útil es «¿contra qué número lo has cuadrado?».
> - **Si no tienes background técnico**: una base de datos no entiende lo que le preguntas: compara. Un número con la forma correcta no es por eso el número correcto.
