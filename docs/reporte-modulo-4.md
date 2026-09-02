# Reporte del Módulo 4

> Verificación, trazabilidad y documentación viva sobre la rama del curso.
>
> Rama `s4/start` · 2026-08-26
>
> Versión navegable: [`artefactos/reporte-modulo-4.html`](artefactos/reporte-modulo-4.html), también publicada en https://claude.ai/code/artifact/d13b00f5-f166-4a63-8049-24efc22b5ded

## El titular

**La suite estaba en verde y escondía tres defectos, dos de ellos en la única regla de negocio del producto y en su filtro.** Los tres los destapó una revisión adversarial contrastada contra la spec viva, no una prueba.

| | Al empezar | Al terminar |
|---|---:|---:|
| Pruebas de `auth` | 20 | 20 |
| Pruebas de `tasks` | **0** | 35 |
| Requisitos de `tasks` observables por API con prueba | 0 de 18 | **18 de 18** |
| Defectos conocidos y abiertos | 0 (no se sabía de ninguno) | 3, anotados |
| Documentos que contrastan contra el código | 0 | 9 comprobaciones en CI |

---

## 1 · El priming, y por qué el ejercicio funcionó

El prework pide cazar un «casi correcto» propio. El que encontré no estaba en el código de producto sino en el arnés.

El curso aísla la base de datos de las pruebas con `withGlobalTransaction()` declarado **en cada fichero**, y el comentario de cabecera de `signup.spec.ts` explicaba por qué se eligió así: la conexión no tiene override por entorno, y vaciar la base se llevaría los datos de desarrollo.

Funciona mientras todos los ficheros lo declaren. Comprobé si el riesgo era teórico añadiendo un fichero de prueba **sin** el hook:

```
$ node ace test
 PASSED
Tests  21 passed (21)

$ select id, email from users   -- base de DESARROLLO
{ id: 6, email: 'fuga@sonda.test' }     <- la fila del test
{ id: 2, email: 'nuevo@flowsync.local' }
```

Veintiuna pruebas en verde y una fila de test escrita en la base con la que se estaba trabajando. Corregido en [ADR-0001](adr/0001-aislamiento-de-la-base-de-datos-en-pruebas.md): la conexión elige el fichero según el entorno, y los hooks por fichero se mantienen intactos para lo que sirven bien, aislar un caso de otro.

---

## 2 · Los tres defectos con la suite en verde

### H-15 · La regla de vencimiento comprobaba dos de sus tres condiciones

`Task.isOverdueOn()` miraba si hay fecha y si esa fecha pasó. No miraba el estado.

Una tarea en `done` con fecha del 12 de agosto, consultada el 26, devolvía `status: "done"` e `isOverdue: true` **en la misma respuesta**. En pantalla: una tarea cuya cabecera decía «Hecho» mostraba debajo, en rojo, que el plazo terminó y «la tarea sigue sin estar hecha».

Lo que hace este caso instructivo es el comentario que había justo encima del método:

> «Tres condiciones y ninguna más: hay fecha, esa fecha es anterior al día de referencia, y la tarea no está hecha.»

El comentario decía tres. El código hacía dos. Nada los ataba.

### H-16 · Un estado inventado en el filtro respondía 200 con lista vacía

`listTasksValidator` declaraba `status` como cadena suelta en vez de acotarlo al conjunto del dominio, así que un valor inventado llegaba al `where` y salía como lista vacía.

```
GET /api/v1/tasks?status=archivado     -> 200 {"data":[]}
GET /api/v1/tasks?status=in_progress   -> 200 {"data":[]}
```

Byte a byte idénticas. El requisito dice literalmente que pedir algo que no existe y no encontrar nada **tienen que ser distinguibles desde fuera**.

Otra vez el comentario prometía lo contrario: «Un estado inventado jamás sale por aquí como lista vacía».

Y arrastraba tres ramas del frontend escritas a propósito para ese `422` que no se ejecutaban nunca. Entrar en `/tasks?status=archivado` mostraba «No hay ninguna tarea en «archivado»», que además afirma algo falso.

### H-17 · La lista filtraba el email del responsable

`TaskTransformer` construía el responsable con `UserTransformer`, que incluye el email y las fechas de la cuenta. `TaskAssigneeTransformer` existe justo para evitarlo y lo explica en su propio comentario, pero solo lo usaba el detalle. La lista, que es la vista que todos abren, usaba el otro.

Una cuenta pidiendo la lista recibía el email de todas las demás.

---

## 3 · El patrón, que es el hallazgo de verdad

Los tres tienen la misma forma: **alguien escribió lo correcto en prosa y otra cosa en código, y nada comprobaba que coincidieran.**

Y hay una causa común documentada en el propio repositorio. `openspec/changes/archive/2026-08-13-add-task-list/tasks.md` contiene, **sin marcar**:

```
- [ ] 6.3 Verificar que ninguna respuesta de tareas incluye el email del responsable
```

El change se archivó igualmente. Su `design.md` había predicho el fallo con nombre y apellidos:

> «la regresión más probable, que el responsable acabe filtrando el email al cliente, no la va a detectar nada automático»

Ocurrió exactamente eso. Peor en el change del filtro: marca **`[x]`** la casilla «Verificar que un estado inventado devuelve 422 y no una lista vacía» sobre código que nunca lo ha hecho, y su diseño afirma que el validador declara `vine.enum(TASK_STATUSES).optional()`, que no era cierto.

Está anotado como **H-18** y queda abierto, porque no se arregla con código: mientras la verificación sea una afirmación de quien archiva, el archivo es una lista de buenas intenciones.

---

## 4 · Lo que se entrega

### Matriz de trazabilidad

[`docs/trazabilidad.md`](trazabilidad.md) recorre la cadena **historia → criterio → escenario → prueba → código** y dice, requisito a requisito, qué está cubierto y qué no.

El dato que la ordenaba al empezar: **0 de 124 escenarios de `tasks` verificados**, con las 20 pruebas existentes todas en `auth`. Tres módulos especificando la gestión de tareas y ninguna comprobación automática de ninguna de sus reglas.

También deja anotado que **tres de los doce ficheros del backlog no son historias** sino criterios de aceptación de otra, y que **27 de los 118 criterios siguen marcados `[PROPUESTO]`**, sin validar. Una prueba escrita contra un criterio propuesto fija como contrato algo que nadie ha aprobado.

### Documentación viva, y lo que impide que mienta

Arquitectura con diagramas, contrato OpenAPI, ADR y README, escritos a partir de lo que existe.

Lo que sostiene todo eso no son los documentos, es [`scripts/verificar-docs.mjs`](../scripts/verificar-docs.mjs), que **no genera: contrasta y falla**. Nueve comprobaciones que corren en CI:

| Comprueba | Muerde si |
|---|---|
| El contrato cubre exactamente las rutas del código | Se añade una ruta sin documentarla, o se documenta una que no existe |
| La tabla de rutas de `CLAUDE.md` corresponde con el código | Esa tabla se queda atrás |
| Los estados documentados son los del dominio | Alguien añade o renombra un estado |
| La regla de vencimiento tiene sus tres condiciones, y la comparación es estricta | Se quita cualquiera, o un `<` se vuelve `<=` |
| El filtro está acotado al enum | Vuelve a ser una cadena suelta |
| El responsable no expone la cuenta | La lista vuelve al transformer que filtraba el email |
| Toda operación que resuelve un id documenta su `404` | Se añade una ruta con `findOrFail` sin documentar el rechazo |
| Las pruebas no pueden escribir sobre la base de desarrollo | La elección por entorno se deshace o deja de aplicarse |
| Los documentos que el README enlaza existen | Un enlace apunta a un fichero que no está |

Las nueve se verificaron mutando el código y comprobando que fallan. Dos de ellas habrían cazado H-15 y H-16 el día que se escribieron.

**La primera versión del verificador daba luz verde mientras tres documentos afirmaban comportamientos que la API no tenía**, porque comprobaba lo fácil. Lo señaló la misma revisión adversarial, y es la lección más útil sobre este tipo de herramienta: un verificador que solo comprueba lo cómodo es peor que no tenerlo, porque da una garantía que no existe.

---

## 4 bis · El hallazgo que el prework anuncia y no es un bug

Contrastar el prework contra la transcripción del directo dejó el hallazgo más incómodo de los dos módulos, y no está en el código: está en el material de apoyo.

La lección asíncrona presenta tres hallazgos de ejemplo. Dos son reales y son exactamente H-15 y H-16. El tercero, marcado como **crítico**, es un IDOR: «el listado no filtra por el usuario autenticado y devuelve tareas de otros».

Y no se queda en anunciarlo. **Da la instrucción de arreglo**:

> «Arregla el hallazgo crítico: filtra las tareas por el usuario autenticado y añade un test que cubra el aislamiento por usuario.»

Aplicada al pie de la letra, esa instrucción **rompe el producto**. El requisito «Una sola lista compartida del espacio» dice que el contenido no depende de quién la consulta, y la aplicación existe precisamente para ver en qué anda el equipo.

La sesión en directo lo monta como el clímax de su tercera demo: abre ese material en pantalla, señala que el IDOR **no** aparece en el informe del revisor, y explica por qué no aparecer es lo correcto. De ahí sale la frase que resume el módulo: **el adversario no decide qué es un bug, lo decide la spec**.

**Lo grave era que nada lo fijaba.** Ningún escenario de `tasks` tenía prueba que cubriera «el contenido no depende de quién mira», así que aplicar la instrucción del prework dejaba la suite entera en verde.

Ahora sí: `tests/functional/tasks/lista_compartida.spec.ts` fija cuatro cosas -dos personas ven el mismo conjunto campo por campo, cada una ve la tarea de la otra con su responsable, una tarea ajena se consulta suelta igual que una propia, y ningún parámetro recorta la lista-. Verificado aplicando literalmente la instrucción del prework: **tres pruebas caen**.

Es la lección del módulo convertida en guardarraíl, que es lo único que sobrevive a que nadie se acuerde.

---

## 5 · Módulo 3 frente a Módulo 4

Los dos módulos atacan el mismo problema desde extremos opuestos.

| | Módulo 3 · OpenSpec | Módulo 4 · Verificación |
|---|---|---|
| Pregunta que responde | ¿Estamos construyendo lo correcto? | ¿Lo construido hace lo que dijimos? |
| Momento humano | Revisar el contrato **antes** del código | Refutar el resultado **después** del código |
| Artefacto que produce | La spec viva | La matriz de trazabilidad y las pruebas |
| Cómo falla si falta | Se construye bien lo que no era | Se cree construido lo que no está |

Lo que el Módulo 4 demuestra sobre el Módulo 3 es incómodo y vale el módulo entero: **la spec viva de `tasks` estaba bien escrita, con 32 requisitos y 124 escenarios, y el código la incumplía en tres sitios sin que nadie se enterara.** Especificar bien no verifica nada por sí solo.

Y al revés: los tres defectos se encontraron **porque** existía esa spec. Sin ella, la revisión adversarial no habría tenido contra qué contrastar; habría opinado sobre estilo. El escenario «La tarea no filtra datos de cuenta» es lo que convierte «el email va en la respuesta» de observación en incumplimiento.

Los dos módulos se necesitan. La spec da el criterio; la verificación comprueba que se cumple. Ninguno de los dos sustituye al otro, y el error de saltarse el segundo es exactamente el que produjo H-15, H-16 y H-17.

### La diferencia de método

En el Módulo 3 llegué a la trazabilidad por el lado del proceso: cada change declaraba qué escenarios quedaban sin cubrir. En el Módulo 4 se llega por el lado del producto: se recorre la spec entera y se pregunta, requisito a requisito, si algo lo comprueba.

El segundo encuentra lo que el primero no puede encontrar, porque el primero solo mira lo que un change tocó.

---

## 6 · Lo que queda abierto, y por qué

| # | Qué | Por qué no se cierra ahora |
|---|---|---|
| H-18 | Los changes se archivaron con verificaciones marcadas sin hacer | Es de proceso. Se arregla cambiando cómo se archiva, no tocando código |
| H-19 | Las respuestas de error devuelven traza, rutas y el SQL ejecutado | En producción no ocurre. Apagarlo cambia el comportamiento del framework para todo el equipo y merece su propia decisión |
| H-21 | El orden de validación difiere entre controladores | Ningún escenario lo fija. Conviene decidirlo antes de construir encima |

Y los 14 requisitos de `tasks` que solo se observan en pantalla siguen sin prueba, porque el proyecto no tiene runner de navegador. Dentro de lo cubierto queda un hueco real: «las tareas exigen sesión» solo tiene prueba sobre una de las cinco rutas. Están enumerados por prioridad en la matriz, que es la diferencia entre un hueco conocido y una omisión.
