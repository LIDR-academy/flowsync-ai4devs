# Guía de replicación

> Cómo rehacer este recorrido desde cero, paso a paso, sin repetir los errores que costaron caro.
>
> El **qué pasó** está en [`recorrido-por-modulo.md`](recorrido-por-modulo.md). Esto es el **cómo hacerlo otra vez**.
>
> Los comandos están contrastados contra este repositorio, no escritos de memoria. Los que no se han ejecutado en esta máquina se marcan como tales.
>
> Última revisión: 2026-09-06.

## 0 · Lo que hace falta antes de empezar

| Qué | Versión | Comprobarlo |
|---|---|---|
| Node | 20.19 o superior. Aquí corre **24.14.0** | `node -v` |
| git | cualquiera reciente | `git --version` |
| GitHub CLI | autenticado | `gh auth status` |
| Claude Code | el agente que hace el trabajo | `claude --version` |
| OpenSpec | solo a partir del Módulo 3 | `openspec --version` |

**No hace falta Docker ni servidor de base de datos.** La persistencia es SQLite a través de `better-sqlite3`, y el fichero lo crea la primera migración.

En Windows, `make setup` y `make start` del README **no funcionan sin WSL**. Los equivalentes por servidor están en el paso 2 y son los que se han usado aquí.

## 1 · El mapa de ramas, que es lo que más confunde

Esto es lo primero que hay que entender, porque explica la mitad de los defectos del proyecto.

**Cada módulo arranca en `upstream/sN/start`, la rama del curso. No continúa donde tú lo dejaste.**

| Rama | Qué trae | Qué NO trae |
|---|---|---|
| `s1/start` | API de cuentas, frontend en blanco | Todo lo demás |
| `s2/start` | Lo mismo | Sigue sin `docs/` |
| `s3/start` | PRD y backlog **del curso** | Tu Módulo 2, tus hallazgos |
| `s4/start` | Tareas construidas **por otro camino**: 10 rutas, 32 requisitos | Tus pruebas de `tasks`, tus arreglos |
| `s5/start` | Contrato OpenAPI **generado** desde decoradores | Tu verificador, tu CI, tu runner de frontend |

La consecuencia, y es la lección más cara del proyecto: **un arreglo vive en una rama, no en el producto.** Nueve defectos ya cerrados volvieron vivos al llegar a `s5/start`. Por eso existe el paso 5 de esta guía, que es una lista de comprobación de salto de rama.

## 2 · Puesta en marcha, una sola vez

### Fork y remotos

```bash
gh repo fork LIDR-academy/flowsync-ai4devs --clone
cd flowsync-ai4devs
git remote -v
```

El fork tiene que quedar como `origin` y el repositorio del curso como `upstream`. Si están al revés:

```bash
git remote rename origin upstream
git remote rename fork origin
```

### Backend

```bash
cd backend
npm install
cp .env.example .env && node ace generate:key
node ace migration:run
```

La migración crea `tmp/db.sqlite3` **y regenera `database/schema.ts`**, que está autogenerado y no se edita a mano.

```bash
npm run dev     # http://localhost:3333
npm test        # 75 pruebas functional
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm test        # 28 pruebas de lib/api.ts
npm run lint    # oxlint, NO eslint
npm run build   # aquí vive el typecheck
```

### Un usuario para probar en pantalla

```bash
curl -X POST http://localhost:3333/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Rene Lopez","email":"rene@flowsync.test","password":"flowsync123","passwordConfirmation":"flowsync123"}'
```

`fullName` es `nullable`, no `optional`: **el campo tiene que viajar siempre**, aceptando `null` como valor. Omitirlo falla con 422. Era H-04, y es el tipo de detalle que cuesta una tarde si se descubre desde el formulario.

## 3 · El ciclo que se repite en cada módulo

No cambia de un módulo a otro. Es lo que hay que interiorizar.

| # | Paso | Por qué |
|---|---|---|
| 1 | **Rama por unidad de trabajo**, nunca commit directo en `main` ni en una `sN/*` | `git checkout -b feat/<slug>` |
| 2 | **Plan escrito antes de tocar código** | Negociar en el plan cuesta minutos; negociar en el PR cuesta un retrabajo |
| 3 | Implementar | |
| 4 | **Verificar por código de salida**, nunca por la última línea impresa | `npm test; echo $?` |
| 5 | `/commit` al cerrar **cada petición** | El commit es por petición, la rama por unidad de trabajo |
| 6 | `gh pr create` con descripción completa, **una vez** al cerrar la unidad | |
| 7 | **Revisión adversarial sobre el PR**, y es lo último | |
| 8 | **Anotar cada hallazgo en `docs/hallazgos.md`** | Un hallazgo arreglado y no anotado es un hallazgo que nadie puede contrastar después |

El paso 8 es el que más se salta y el que más caro sale. Está documentado dos veces en este repositorio: los hallazgos de S1 se perdieron como registro, y H-23 estuvo citado en dos ficheros durante tres días **sin entrada en el registro**.

## 4 · Módulo a módulo

### S1 · Priming

1. Rama desde `s1/start` con el arnés ya aplicado: `CLAUDE.md`, las skills de `.claude/skills/`, el subagente `.claude/agents/adversarial-reviewer.md` y el hook de formato de `.claude/settings.json`.
2. Elegir **una feature real**, no un ejercicio. Aquí fue la autenticación en pantalla sobre la API que ya existía.
3. Antes de escribir el plan, **contrastar el ticket contra la API en marcha**. El ticket decía «registro (email+password)» y el validador exige cuatro campos. Se comprobó con una petición real, no leyendo el código.
4. Construir, PR, revisión adversarial.

**El entregable visible es la feature. El entregable real es el arnés**, y la feature es cómo se comprueba que funciona.

### S2 · Spec-Driven Development

1. **Auditar el repositorio antes de escribir nada.** Salieron diez hallazgos sin tocar una línea. Es la forma más barata de encontrar cosas que hay.
2. PRD del MVP, alcance, y backlog con criterios de aceptación historia a historia.
3. **Crear `docs/hallazgos.md` aquí**, no después. Es el documento que va a sostener los tres módulos siguientes.
4. Anotar los **puntos abiertos** como tales, con identificador propio. Una decisión pendiente escrita es distinta de una decisión pendiente recordada.

Lo que hay que buscar a propósito: **el hueco que solo aparece al traducir requisitos a historias**. Aquí fue que dos requisitos daban por hecha una pantalla que ningún requisito creaba.

### S3 · OpenSpec

Instalarlo **fuera del repositorio primero**, porque `openspec init` dentro escribe ficheros antes de tiempo:

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

Luego, dentro del repo, `openspec init` eligiendo Claude Code. `openspec/specs/` y `openspec/changes/` nacen **vacías**: OpenSpec no lee el código para inventarse una spec.

El flujo, y el orden importa:

| Paso | Comando | Qué produce |
|---|---|---|
| 1 | `/opsx:propose <nombre>` | `proposal.md`, `specs/`, `design.md`, `tasks.md` |
| 2 | **Gate humano** | **Esto es el módulo**, no un trámite |
| 3 | `/opsx:apply <nombre>` | El código, acotado por grupos |
| 4 | `/opsx:archive <nombre>` | Fusiona el delta contra la spec viva |

Tres cosas que aquí se hicieron y merecen repetirse:

- **Aplicar en dos tiempos**, backend primero y frontend después, revisando en medio.
- **Los tests en un change aparte.** El proposal del curso los excluye a propósito; añadirlos como segundo delta demuestra el flujo delta por segunda vez.
- **Auditar el diff** al terminar: cero dependencias nuevas, cero componentes nuevos en `ui/`, ningún endpoint de más. Hay paquetes maliciosos que ciertos modelos sugieren de forma recurrente.

Y lo que el módulo pide de verdad: **salir sabiendo cuándo NO usarlo.** Escribir la spec de algo que ya existe es un antipatrón declarado por la propia documentación de OpenSpec. Se hizo una vez, a propósito, y encontró un defecto.

### S4 · Verificación

Es el módulo que no añade funcionalidad y cambia más el proyecto. En orden:

1. **Trazabilidad requisito a prueba**, en una tabla, con los huecos declarados. Un requisito sin prueba se escribe como tal; no se omite de la tabla.
2. **Cubrir lo que no tenía nada.** Aquí, la capability entera que S3 había construido y que la rama del curso traía con cero pruebas.
3. **Documentación que se contrasta**: `scripts/verificar-docs.mjs`, que compara documento contra código y **falla la build**. No regenera nada.
4. **CI**: `.github/workflows/verificacion.yml` con tipos, lint, pruebas de los dos lados y el verificador.
5. **Revisión adversarial contrastada contra la spec**, no contra el gusto.

**El paso que decide si todo lo anterior sirve**, y es R-14:

> **Toda comprobación que añadas, demuéstrala mutando el código a propósito y viendo que se pone en rojo.** Si no se la ha visto fallar, no cuenta como comprobación: cuenta como una segunda regla escrita, y encima con apariencia de estar ejecutada.

Siete revisiones adversariales seguidas encontraron el verificador en verde sobre mutaciones reales, **siempre por el mismo motivo**: la mutación con la que se había probado cada comprobación era la que esa comprobación ya cubría por construcción. Si vas a copiar una sola cosa de este módulo, que sea esta.

### S5 · Controles y guardarraíles

El modelo mental: **una regla escrita en un fichero es una petición, no una garantía.** Se cumple lo justo para que dejes de comprobarla, y entonces deja de cumplirse sin que nadie se entere.

1. **Listar todas las reglas que el repositorio declara.** Aquí salieron catorce.
2. Para cada una, declarar su **modo de fallo**, que se razona sin mirar nada: ruidoso, silencioso, o no comprobable. Lo ruidoso puede quedarse escrito; lo silencioso hay que bajarlo a algo que lo ejecute.
3. **Anotar la intuición antes de comprobar nada**, y anotar de quién es. Si al comprobar coincide, no sabrás si acertó la intuición o el modelo, salvo que lo hayas escrito antes.
4. **Rellenar el estado con evidencia**, contando casos. «Casi siempre» sin número es exactamente la respuesta que el ejercicio existe para desmontar.
5. Decidir qué hacer con cada regla: bajarla a una comprobación, reescribirla para que sea comprobable, o retirarla.

La tercera categoría es la que se olvida: **no se puede comprobar** no es un estado pendiente, es una propiedad de la regla. Ninguna comprobación sabe si un documento sigue siendo útil; sabe si sigue coincidiendo con el código, que es otra cosa.

## 5 · Al saltar de rama: la comprobación que costó nueve defectos

Hazla **antes** de dar por bueno nada. En este proyecto, el plan escrito antes de portar contaba seis defectos y eran nueve.

```bash
git fetch upstream
git checkout -b <trabajo> upstream/sN/start
```

Luego, en este orden:

1. **Traer el registro de hallazgos y recorrerlo entrada a entrada.**

   ```bash
   git checkout <rama-anterior> -- docs/hallazgos.md
   ```

   Cada entrada cerrada se comprueba **en el código de la rama nueva**, no se da por cerrada.

2. **Portar las pruebas y ejecutarlas.** Aquí está la parte que no se puede leer:

   ```bash
   cd backend && npm test; echo "salida=$?"
   ```

   Tres de los nueve defectos **solo aparecieron al ejecutar**. Uno lo encontró una prueba de aislamiento al fallar: la suite habría escrito sobre la base de desarrollo.

3. **Comprobar lo que no es código de producto y por eso nadie mira:**

   | Fichero | Qué pasa si no cruza |
   |---|---|
   | `.gitignore` | Lo que no debía subirse queda sin proteger |
   | `backend/.env.test` | Aquí vive `LOG_LEVEL=fatal`. Sin él, SQL y hashes de contraseña salen impresos en los logs públicos de CI **en cada ejecución verde** |
   | `package.json` del frontend | El runner de pruebas desaparece, y no lo notas porque **lo que falta es la herramienta que lo mediría** |
   | `scripts/`, `.github/` | Te quedas sin verificador y sin CI |

4. **Portar, no pisar.** Si la rama nueva llegó a lo mismo por otro camino, se porta el arreglo sobre su versión. Sustituir su fichero por el tuyo pierde lo que ellos hicieron mejor, y aquí pasó dos veces.

## 6 · Cómo saber que vas bien

Cuatro comandos, y se miran **por código de salida**:

```bash
cd backend && npm run typecheck && npm run lint && npm test; echo "backend=$?"
```

```bash
cd frontend && npm run lint && npm run build && npm test; echo "frontend=$?"
```

```bash
node scripts/verificar-docs.mjs; echo "docs=$?"
```

El verificador se lanza **desde la raíz** y necesita el backend instalado: pregunta las rutas a `node ace list:routes --json` en vez de parsear el fuente, porque parsearlas a mano falló tres veces.

```bash
openspec validate --specs; echo "specs=$?"
```

Lo que tiene que salir hoy en la rama del port: **75 pruebas de backend, 28 de frontend, 15 comprobaciones del verificador, y cuatro ceros.**

Los mismos cuatro corren en `.github/workflows/verificacion.yml` y **bloquean**. El revisor adversarial va en un workflow aparte y **no bloquea**, a propósito: un revisor no determinista que tumba la build se desactiva la primera vez que se equivoca con prisa, y entonces no queda ni revisor ni build.

## 7 · Los cinco errores que más caros salieron

Están todos documentados con su fecha y su commit. Si replicas el recorrido, estos son los que te vas a encontrar.

**1 · Creer que una suite en verde dice algo.** Veinte pruebas pasando convivían con tres defectos, dos de ellos en la única regla de negocio del producto. Lo que los destapó fue **contrastar el código contra la spec**, no ejecutarlo.

**2 · Probar una comprobación con la mutación que ya cubría por construcción.** Siete revisiones seguidas encontraron lo mismo. Es R-14, y su modo de fallo es el peor de los catorce: cuando falla, deja el trabajo **aparentemente hecho**.

**3 · Portar leyendo en vez de ejecutando.** Seis defectos se vieron leyendo; tres solo aparecieron al correr las pruebas en la rama nueva.

**4 · Cerrar un defecto por darlo por difícil de reproducir.** El defecto que más sobrevivió cruzó tres módulos y dos cierres. El argumento que lo despriorizó cada vez, «en producción no ocurre», resultó **falso**: `debug=false` es la configuración de producción, y es con la que se reprodujo la fuga.

**5 · Documentar un hallazgo en dos sitios y no en el registro.** H-23 estuvo citado en el verificador y en un README durante tres días sin entrada en `hallazgos.md`. Referencias colgando que hacen creer al lector que hay algo escrito donde no lo hay.

## 8 · Glosario mínimo

| Término | Qué significa aquí |
|---|---|
| **Spec viva** | `openspec/specs/`: el comportamiento que es contrato hoy. Distinta del backlog, que dice qué se pidió |
| **Change / delta** | Una propuesta de cambio sobre la spec viva, con sus requisitos marcados `ADDED`/`MODIFIED`/`REMOVED`. Al archivarse, se fusiona |
| **Gate humano** | Revisar los cuatro artefactos del change **antes** de que exista una línea de código |
| **Revisión adversarial** | Un subagente que lee el diff contrastándolo contra la spec, buscando lo que falla. No decide qué es un bug: lo deciden la spec y el contrato |
| **Verificador** | `scripts/verificar-docs.mjs`. Compara documentación contra código y falla la build. No genera nada |
| **Mutación** | Romper el código a propósito para ver si una comprobación se pone en rojo. Sin esto, la comprobación no cuenta |
| **Salto de rama** | Empezar un módulo en `upstream/sN/start` en vez de donde lo dejaste. Es el mecanismo que devuelve defectos ya cerrados |
| **Arrastre de hallazgos** | Recorrer `docs/hallazgos.md` entrada a entrada al cambiar de rama, comprobando cada cierre contra el código nuevo |
| **Modo de fallo de una regla** | Ruidoso (se nota solo), silencioso (hay que bajarlo a algo que lo ejecute) o no comprobable (se dice, en vez de fingir que se cumple) |

## 9 · Dónde está cada cosa

| Qué buscas | Dónde |
|---|---|
| Qué puede hacer el producto, historia a historia | [`alcance-funcional.md`](alcance-funcional.md) |
| Qué pasó en cada módulo, en orden | [`recorrido-por-modulo.md`](recorrido-por-modulo.md) |
| Los 23 hallazgos, con su índice por módulo | [`hallazgos.md`](hallazgos.md) |
| Qué requisito cubre qué prueba, y qué queda sin cubrir | [`trazabilidad.md`](trazabilidad.md) |
| Las decisiones, con sus alternativas descartadas | [`adr/`](adr/) |
| Las catorce reglas y su estado empírico | [`auditoria-reglas-de-proceso.md`](auditoria-reglas-de-proceso.md) |
| Qué se considera grave en una revisión, y cuánto cabe | [`../.github/calibracion-revision.md`](../.github/calibracion-revision.md) |
