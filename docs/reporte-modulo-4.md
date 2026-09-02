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
| Pruebas de `auth` | 20 | 26 |
| Pruebas de `tasks` | **0** | 38 |
| Pruebas de frontend | 0 | 28 |
| Requisitos de sistema de `tasks` con prueba | 0 de 17 | **17 de 17** |
| Defectos encontrados | 0 (no se sabía de ninguno) | 9, de los que 7 quedaron cerrados |
| Documentos que contrastan contra el código | 0 | 15 comprobaciones en CI |

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

Lo que sostiene todo eso no son los documentos, es [`scripts/verificar-docs.mjs`](../scripts/verificar-docs.mjs), que **no genera: contrasta y falla**. Quince comprobaciones que corren en CI:

| Comprueba | Muerde si |
|---|---|
| El contrato cubre exactamente las rutas del código | Se añade una ruta sin documentarla, o se documenta una que no existe |
| La tabla de rutas de `CLAUDE.md` corresponde con el código | Esa tabla se queda atrás |
| Los estados documentados son los del dominio | Alguien añade o renombra un estado |
| La regla de vencimiento tiene sus tres condiciones, y la comparación es estricta | Se quita cualquiera, o un `<` se vuelve `<=` |
| El filtro está acotado al enum | Vuelve a ser una cadena suelta |
| El responsable no expone la cuenta | La lista vuelve al transformer que filtraba el email |
| Toda operación con un parámetro de ruta documenta su `404` | Se añade una ruta que resuelve un identificador sin documentar el rechazo |
| El rechazo por recurso inexistente sale con la forma del proyecto | El `404` vuelve al volcado de depuración del framework |
| El volcado de depuración va apagado | Se enciende a fuego, se ata al entorno, o se sobreescribe `isDebuggingEnabled` |
| Un error inesperado no devuelve su mensaje | Se deja de interceptar el `5xx` y vuelve el `{ message }` del framework, que en la base de datos es el SQL |
| Toda operación documenta el error que no estaba previsto | Una operación del contrato se queda sin su `500`, o deja de usar el esquema de errores del proyecto |
| La versión navegable dice lo mismo que el reporte | Un artefacto HTML se queda sin la tabla de arrastre, o declara un número de comprobaciones que ya no es |
| El reporte de cada módulo declara lo que arrastra | Un reporte se cierra sin esa tabla, con la tabla vacía, o con filas incompletas |
| Las pruebas no pueden escribir sobre la base de desarrollo | La elección por entorno se deshace o deja de aplicarse |
| Los documentos que el README enlaza existen | Un enlace apunta a un fichero que no está |

Las quince se verificaron mutando el código y comprobando que fallan. Dos de ellas habrían cazado H-15 y H-16 el día que se escribieron.

**Y dos de ellas dieron luz verde a mutaciones reales antes de endurecerse.** La quinta revisión encendió el volcado con `|| !app.inTest` y sustituyó la tabla de arrastre por la frase «esta vez no hace falta la tabla de Lo que se arrastra»: el verificador pasó las dos veces. Es la quinta pasada consecutiva en que la mutación con la que se probó una comprobación era la que esa comprobación ya cubría por construcción. Lo que ata el comportamiento es una prueba que lo provoca; el contraste sobre el texto del código es aviso temprano, no garantía.

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

Ahora sí: `tests/functional/tasks/lista_compartida.spec.ts` fija cuatro cosas -dos personas ven el mismo conjunto campo por campo, cada una ve la tarea de la otra con su responsable, una tarea ajena se consulta suelta igual que una propia, y ningún parámetro recorta la lista-. Verificado aplicando literalmente la instrucción del prework: **cuatro pruebas caen**. (Decía tres hasta el 2026-09-02, cuando la sexta revisión adversarial volvió a contarlas.)

Es la lección del módulo convertida en guardarraíl, que es lo único que sobrevive a que nadie se acuerde.

---

## 4 ter · El defecto que arrastramos desde el Módulo 3

De todo lo encontrado, uno tardó tres módulos y dos intentos en cerrarse, y es el que más enseña: **H-19, las respuestas de error revelan cómo está construido el sistema por dentro**.

| Cuándo | Qué pasó |
|---|---|
| Módulo 3 | `/verify` lo encuentra: un `PATCH` sobre una tarea inexistente devuelve la traza completa con rutas absolutas. Se diagnostica como hueco de la spec, se arregla el contrato y después el código |
| Módulo 3, el arreglo | `Task.find` más `response.notFound`. **Local a una ruta**, aunque el diagnóstico escrito en D12 ya decía que la causa era general: «el problema no era el tipo del error, sino que se lanzara» |
| Módulo 4, `s4/start` | La rama del curso resuelve identificadores con `findOrFail`, que lanza. El defecto reaparece idéntico en tres rutas |
| Módulo 4, al documentar | Se escriben tres `404` en el contrato con una forma que la API no devolvía. **El documento pasó a mentir en el mismo commit que pretendía hacerlo cierto** |
| Módulo 4, el arreglo | Normalizado en el manejador de excepciones, que es el sitio general que D12 ya había señalado |
| Módulo 4, cuarta revisión | Se evidencia que era más ancho: **cualquier** excepción no controlada salía con el volcado. Un `500` de SQLite devolvía el SQL ejecutado y rutas absolutas |
| 2026-09-02, primer cierre | ADR-0003 apaga el volcado en todos los entornos. **No bastaba** |
| 2026-09-02, quinta revisión | Con el volcado ya apagado, un `500` seguía devolviendo `{ message }`, y el `message` de un `SqliteError` **es el SQL**: el alta de una cuenta filtraba el `insert into users …` con el hash de la contraseña, sin sesión |
| 2026-09-02, cierre completo | El manejador intercepta todo `5xx` y responde una forma cerrada. Atado por una prueba que provoca un `500` real |

**Por qué sobrevivió tres módulos**: el primer arreglo fue local aunque el diagnóstico fuera general; cerrarlo del todo no era un arreglo sino una decisión; y «en producción no ocurre», lo que lo bajaba de prioridad cada vez que se miraba.

**Ese tercer motivo era falso**, y nadie lo comprobó hasta la quinta revisión. En producción `debug` es `false`, y `debug=false` es exactamente la configuración con la que se reprodujo la fuga del SQL. El argumento que lo despriorizó tres módulos no era una prioridad discutible: era un error de hecho.

**Cerrado el 2026-09-02** por [ADR-0003](adr/0003-el-volcado-de-depuracion-va-apagado.md). El volcado va apagado por defecto en todos los entornos. El falso dilema era perder el diagnóstico: `report()` sigue registrando el error completo en el log del servidor, así que cambia de sitio en vez de desaparecer. El arreglo fueron dos líneas; lo caro era decidirlo.

El recorrido completo, con la evidencia de cada paso, está en [`hallazgos.md`](hallazgos.md), sección «El defecto que arrastramos».

**Y volvió a pasar lo mismo en el commit que lo cerraba.** Apagar el volcado era la decisión correcta y se aplicó a una de las manifestaciones del defecto, no al sitio general. Es el patrón de D12 por tercera vez, esta vez con el diagnóstico delante. El sitio general era la costumbre de devolver el `message` de una excepción tal cual, y lo que lo cierra es no devolverlo nunca en un `5xx`.

---

## 4 quater · Lo que se arrastra

Tabla obligatoria en el reporte de cada módulo, desde ahora. Sirve para que nada se dé por resuelto porque se arregló en otra rama o porque el síntoma no se ve.

> **La primera versión de esta tabla incumplió su propia regla.** Marcaba H-11, H-13 y H-14 como cerrados porque lo estaban en `s3/start`, sin comprobarlos aquí. Los tres estaban vivos. Es H-22, y las filas de abajo son el resultado de comprobarlos uno a uno contra esta rama. La columna «Estado» dice ahora la rama, no un «Cerrado» a secas.

| # | Hallazgo | Desde | Estado en `s4/start` | Qué falta |
|---|---|---|---|---|
| H-18 | Changes archivados con verificaciones marcadas sin ejecutar | Módulo 3 (changes del curso) | **Abierto** | No se arregla con código. Una casilla marcada tiene que significar que se ejecutó algo |
| H-19 | Las respuestas de error revelan internals | Módulo 3 | **Cerrado el 2026-09-02** (ADR-0003, revisado el mismo día) | Nada. Se cerró en dos pasos: el primero no bastaba |
| H-11 | El email distingue mayúsculas | Módulo 3, cerrado en `s3/start` | **Estaba vivo aquí.** El arreglo no cruzó de rama | Nada. Portado el 2026-09-02 con seis pruebas |
| H-13 | Sesión caducada sin salida | Módulo 3, cerrado en `s3/start` | **Estaba vivo aquí.** El arreglo no cruzó de rama | Nada. Portado el 2026-09-02 |
| H-14 | `updatedAt` distinto según el endpoint | Módulo 3, cerrado en `s3/start` | **Estaba vivo aquí**, y en una escritura más que en `s3/start` | Nada. Portado el 2026-09-02 con tres pruebas |
| H-22 | La tabla de arrastre dio por cerrados tres hallazgos sin comprobarlos | Módulo 4, esta misma tabla | **Cerrado el 2026-09-02** | Nada. Las tres filas de arriba son su corrección |
| H-21 | El orden de validación difiere entre controladores | Módulo 4 | **Abierto** | Ningún escenario lo fija. Decidirlo antes de construir encima |
| — | «Las tareas exigen sesión» no tenía prueba en todas las rutas | Módulo 4 | **Cerrado el 2026-09-02** | Nada. Al mirarlo el hueco era mayor: la prueba decía «todas las rutas protegidas» y cubría **tres de siete**, todas de lectura. Ahora recorre las siete |
| — | Los 15 requisitos de pantalla sin verificar | Módulo 4 | **Declarado** | Un runner de navegador, si deja de ser un hueco aceptable |

**Y lo que hay que comprobar al saltar a `s5/start`**: esa rama todavía trae **H-15** y **H-16** sin arreglar. Están cerrados aquí y hay que portarlos, con sus pruebas, antes de construir nada encima.

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
| H-21 | El orden de validación difiere entre controladores | Ningún escenario lo fija. Conviene decidirlo antes de construir encima |

> H-19 estaba en esta tabla y salió de ella el 2026-09-02, cerrado por ADR-0003 y su revisión del mismo día. Lo que decía aquí -«en producción no ocurre»- resultó ser falso: ver la sección 4 ter.

Y los 15 requisitos de `tasks` que solo se observan en pantalla siguen sin prueba, porque el proyecto no tiene runner de navegador. Están enumerados por prioridad en la matriz, que es la diferencia entre un hueco conocido y una omisión.

> **El hueco de «las tareas exigen sesión» se cerró el 2026-09-02.** Decía aquí que solo había prueba sobre una de las cinco rutas. Al mirarlo, el problema era mayor y de otra forma: la prueba se llamaba «sin credencial, en todas las rutas protegidas» y su lista traía **tres de las siete**, todas de lectura. Las dos escrituras de tarea y el cierre de sesión no las miraba nadie, y el título daba por cubierto lo que no estaba. Ahora recorre las siete, y añadir a la lista una ruta que no exige sesión la tumba; comprobado.
