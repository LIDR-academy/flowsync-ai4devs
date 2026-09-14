# Matriz de trazabilidad

> Qué criterio tiene prueba y cuál no. Rama `feat/sesion-5-guardarrailes`, al día a 2026-09-13. Escrita el 2026-08-26 sobre `s4/start`; las cifras de abajo son las de hoy, y lo que cambió desde entonces está fechado donde cambió.
>
> La cadena que se traza es **ticket → historia → criterio de aceptación → escenario de la spec viva → prueba → código**. El primer eslabón, en §0. El ancla es la spec viva de `openspec/specs/`: mientras esté al día, lo que cuelga de ella también.
>
> Este documento se escribe a partir de lo que existe en el repositorio, no de lo que se pretendía construir. Donde no hay prueba, dice que no la hay.

## Resumen

| Capability | Requisitos | Escenarios | Historias | Criterios | Pruebas | Cobertura de criterios |
|---|---:|---:|---:|---:|---:|---:|
| `auth` | 19 | 46 | — | — | 28 | parcial, ver §2 |
| `tasks` | 33 | 131 | 12 | 118 | 44 | 18 de 18 requisitos de sistema, ver §3 |
| transversal | — | — | — | — | 15 | 6 de forma de los errores, 2 de aislamiento de la base, 6 de nombres de regla (H-05) y 1 del documento OpenAPI servido (H-35) |

**Al empezar este trabajo la fila de `tasks` decía 0.** Las 20 pruebas que existían eran todas de `auth`, el andamiaje que venía con el repo. Los tres módulos anteriores se dedicaron a especificar la gestión de tareas, y de los 124 escenarios escritos no se verificaba ninguno.

La suite estaba en verde, y escondía tres defectos que la revisión adversarial destapó: la regla de vencimiento incumplía una de sus tres condiciones, un estado inventado en el filtro respondía `200` con lista vacía, y la lista filtraba el email de cada responsable. Los tres están corregidos y cubiertos. Con las que fijan la lista compartida, la creación, la tarea inexistente, los bordes de la fecha, el orden de validación y el orden de la lista, son las 44 pruebas de `tasks`.

Las transversales no cuelgan de ningún requisito de una capability y por eso van aparte: seis fijan que **ninguna respuesta de error revele internals** -es H-19, incluido un `500` real de la base de datos-, dos que la suite no pueda escribir sobre la base de desarrollo (ADR-0003), seis los nombres de regla que el frontend traduce (H-05) y una que el documento OpenAPI servido no se construya dos veces (H-35). Las seis nuevas de `auth` fijan que el email no distinga mayúsculas (H-11) y las tres nuevas de `tasks` que toda escritura devuelva lo persistido (H-14): los dos hallazgos estaban cerrados en `s3/start` y vivos aquí.

Sigue habiendo mucho hueco. Lo que cambia es que ahora está enumerado.

---

## 0 · Del ticket a la historia

El tablero es `LID` en Jira. **Manda el repositorio**: el tablero sigue el trabajo, no lo define ([`docs/backlog/README.md`](backlog/README.md)). Leído del tablero el 2026-09-13.

Los tickets se crearon en el Módulo 2 con nuestra numeración (`FS-10x`), antes de que el curso trajera su backlog con la suya (`E2-x`, `E3-x`). Por eso **la correspondencia de las historias sin descomponer es por contenido, no por identificador**, y donde no coinciden del todo se dice.

| Ticket | En el tablero | Historia del backlog | Criterios | Spec viva | Pruebas | Código |
|---|---|---|---|---|---|---|
| **LID-17** | FS-101 · Crear una tarea | [E2-1](backlog/E2-gestion-tareas/us-crear-tarea.md), con sus criterios en [E2-2](backlog/E2-gestion-tareas/us-titulo-obligatorio.md) | RF-5, RF-6 | [`tasks`](../openspec/specs/tasks/spec.md): creación, título, título largo | `creacion.spec.ts`, `lista.test.ts`, `lista.e2e.ts` | `tasks_controller.ts`, `validators/task.ts`, `pages/tasks-page.tsx` |
| **LID-19** | FS-103 · Asignar responsable al crear | [E2-3](backlog/E2-gestion-tareas/us-responsable-y-estado-por-defecto.md) | RF-7 | `tasks`: creación con solo el título | `creacion.spec.ts` | `tasks_controller.ts` |
| **LID-18** | FS-102 · Ver la lista del equipo | [E3-1](backlog/E3-actividad-equipo/us-lista-compartida.md) | RF-16, RF-17, RF-21, RF-23 | `tasks`: lista compartida, responsable | `lista_compartida.spec.ts`, `assignee.spec.ts`, `lista.e2e.ts` | `tasks_controller.ts`, `task_transformer.ts`, `task_assignee_transformer.ts` |
| **LID-20** | FS-105 · Cambiar el estado en dos clics | [E2-4](backlog/E2-gestion-tareas/us-cambiar-estado.md) | RF-8, RF-9 | `tasks`: tres estados, cambio de estado | `filtro.spec.ts`, `lista_compartida.spec.ts`, `lista.e2e.ts` | `task_statuses_controller.ts`, `components/task-item.tsx` |
| **LID-5** | FS-118 · Fecha de vencimiento y tareas vencidas | [FS-118](backlog/E2-gestion-tareas/us-fechas-vencimiento.md), y la pantalla de [E2-5](backlog/E2-gestion-tareas/us-abrir-tarea.md) | RF-13, RF-14, RF-15 | `tasks`: vencimiento, día de referencia, tarea suelta | `vencimiento.spec.ts` | `models/task.ts`, `task_due_dates_controller.ts`, `pages/task-page.tsx` |
| **LID-11** | FS-142 · Filtrar la lista por estado | [FS-142](backlog/E2-gestion-tareas/us-filtrar-por-estado.md) | RF-20, RF-21 | `tasks`: acotar, filtro vacío, estado inexistente | `filtro.spec.ts` | `validators/task.ts`, `components/task-filter.tsx` |
| **LID-21** | FS-104 · Reasignar el responsable | [E2-7](backlog/E2-gestion-tareas/us-reasignar-responsable.md) | RF-10 | ninguna | ninguna | **No construido** |
| **LID-22** | FS-106 · Corregir el título | [E2-6](backlog/E2-gestion-tareas/us-editar-titulo.md) | RF-11 | ninguna | ninguna | **No construido** |
| **LID-23** | FS-107 · Retirar una tarea de la lista activa | [E2-10](backlog/E2-gestion-tareas/us-borrar-tarea.md) | RF-12 | ninguna | ninguna | **No construido.** No coinciden del todo: el ticket dice retirar, la historia dice borrar |
| **LID-3** | Implementar login en el frontend | Épica E1, sin historias en el backlog | RF-1 a RF-4 | [`auth`](../openspec/specs/auth/spec.md) entera | §2 | §2 |

**Sin ticket**: [E3-2](backlog/E3-actividad-equipo/us-lista-viva.md), la lista que se actualiza sola, que no está construida. `LID-2` es un duplicado de `LID-3` con el mismo título.

**Las subtareas** de `LID-5` (`LID-6` a `LID-10` y `LID-24`) y de `LID-11` (`LID-12` a `LID-16` y `LID-25`) heredan la fila de su historia: cada una es una capa de la misma cadena, y su descomposición está en el fichero de la historia.

---

## 1 · Antes de la matriz: tres historias que no son historias

La cadena empieza en la historia, así que un error ahí se propaga a todo lo que cuelga. Tres ficheros de `docs/backlog/` no describen una historia de usuario sino un criterio de aceptación de otra:

| Fichero | Qué es en realidad | De qué historia |
|---|---|---|
| `us-titulo-obligatorio.md` | Criterio de aceptación | `us-crear-tarea` |
| `us-responsable-y-estado-por-defecto.md` | Criterio de aceptación | `us-crear-tarea` |
| `us-abrir-tarea.md` | Superficie, no valor entregable | Llega con `us-editar-titulo` y `us-fechas-vencimiento` |

Se reconocen por dos señales. Ninguno entrega valor desplegable por sí solo: «no permitir crear tareas sin título» no es algo que se pueda soltar en producción y demostrar. Y `us-abrir-tarea.md` declara literalmente **«Traza: ninguna directa»**, que es la confesión de que no nace de un requisito sino de una pantalla.

El efecto sobre esta matriz es concreto: inflan el recuento de historias de 9 a 12 y reparten los criterios de crear tarea entre tres ficheros, de modo que ninguno de los tres se lee entero. **No se han borrado**, porque el backlog es el registro de lo que se decidió; quedan marcados aquí y en `docs/backlog/README.md`.

---

## 2 · `auth` · 19 requisitos, 46 escenarios, 28 pruebas

Fue la única capability con verificación automática hasta el 2026-08-26, cuando llegaron las pruebas de `tasks`.

| Requisito de la spec viva | Pruebas | Código |
|---|---|---|
| Registro de una cuenta nueva | `signup.spec.ts` · registrarse devuelve la cuenta y un token que ya sirve | `new_account_controller.ts` |
| Validación de los datos de registro | `signup.spec.ts` · contraseña corta, confirmación que no coincide, email mal formado, y los tres a la vez devuelven un error por campo | `validators/user.ts` |
| Un email, una sola cuenta | `signup.spec.ts` · un email ya registrado no crea una segunda cuenta | `validators/user.ts` |
| El nombre puede quedar vacío | `signup.spec.ts` · una cuenta puede quedarse sin nombre | `validators/user.ts` |
| La contraseña nunca sale | `signup.spec.ts` · la contraseña nunca sale en la respuesta | `user_transformer.ts` |
| Inicio de sesión | `login.spec.ts` · con las credenciales correctas se emite un token que autentica | `access_tokens_controller.ts` |
| Un fallo de acceso no revela si la cuenta existe | `login.spec.ts` · un email desconocido responde igual que una contraseña equivocada | `access_tokens_controller.ts` |
| Validación previa a comprobar credenciales | `login.spec.ts` · un email mal formado se rechaza antes de comprobar credenciales | `validators/user.ts` |
| Consulta del perfil propio | `session.spec.ts` · el perfil devuelve la cuenta del token presentado | `profile_controller.ts` |
| Protección de los recursos privados | `session.spec.ts` · sin cabecera de autorización, y token inventado | `start/kernel.ts` |
| Cierre de sesión | `session.spec.ts` · cerrar sesión invalida el token usado, y responde envuelto en `data` | `access_tokens_controller.ts` |
| Forma de las respuestas de la API | `session.spec.ts` · toda respuesta de éxito de auth va envuelta en data y solo en data | `providers/api_provider.ts` |
| Sesiones simultáneas independientes | `session.spec.ts` · cerrar una sesión no cierra las demás | `access_tokens_controller.ts` |
| Rutas públicas | `session.spec.ts` · el registro y el login siguen siendo públicos | `start/routes.ts` |
| Iniciales derivadas del nombre | `initials.spec.ts` | `models/user.ts` |

### Lo que en `auth` sigue sin prueba

| Requisito | Por qué no la tiene |
|---|---|
| Los 8 requisitos de pantalla (entrada a la aplicación, errores en castellano, envío en curso, la sesión sobrevive a recargar, rutas según el estado, salir de la aplicación) | Solo se observan en navegador. **Dos tienen prueba desde el 2026-09-13**, en `frontend/e2e/sesion.e2e.ts`: «Recuperación de una sesión que ya no vale» (token revocado, H-37) y «Aviso cuando el servidor no está disponible» (servidor caído al arrancar, H-38). Los otros seis, sin prueba |

> **La validación acumulada salió de esta tabla el 2026-09-12.** Estaba aquí como el único hueco de `auth` sin excusa: las tres pruebas de validación del registro mandan un solo campo malo cada una, así que seguían en verde si la respuesta traía solo el primer error. Ahora `signup.spec.ts` manda tres a la vez y exige los tres, cada uno con su campo.
>
> Se vio fallar con un `errorReporter` de VineJS que se queda con el primer error: **3 de 82 en rojo**. Y ese número dice algo que la tabla no sabía. Las otras dos caídas son de `nombres_de_regla.spec.ts`, cuyo payload de alta también manda tres campos malos a la vez: desde que se cerró H-05 el hueco **ya estaba mordido, por accidente**. No constaba en ningún sitio, no comprobaba a qué campo va cada error, y habría desaparecido en silencio el día que alguien partiera ese payload en tres para aislar los nombres.

---

## 3 · `tasks` · 33 requisitos, 131 escenarios, 44 pruebas

La spec se parte sola por sujeto: **18 requisitos empiezan por «El sistema SHALL»** y **15 por «La interfaz SHALL»**. La cuenta de cobertura se hace sobre los 18, porque los otros 15 solo se observan en pantalla y no son un hueco que las pruebas de API puedan llenar. Cuando se escribió no había runner de navegador; desde el 2026-09-13 lo hay, y lo que cubre está en §3.2.

**18 de 18 requisitos de sistema tienen al menos una prueba.** El decimoctavo es «Una petición mal formada se rechaza antes de buscar nada», añadido el 2026-09-02 al cerrar H-21 con [ADR-0006](adr/0006-validar-antes-de-resolver.md): lo cubren las cuatro pruebas de `orden_de_validacion.spec.ts`.

> El reparto que decía 18 y 14 era mío y estaba mal, en el sentido cómodo. Salía de dos errores que se cancelaban: contaba «Aviso ante una fecha que no vale» como observable por API cuando su texto dice «La interfaz SHALL explicar el problema junto al propio campo», y dejaba fuera de la cuenta escenarios de «Una sola vista de tareas» que sí están cubiertos. Lo destapó la tercera revisión adversarial.

### 3.1 · Reglas de dominio y contrato

| Requisito de la spec | Prueba | Código |
|---|---|---|
| Creación de una tarea con solo el título | `creacion.spec.ts` · un título basta, y el responsable lo pone el servidor | `TasksController.store`, `createTaskValidator` |
| Ninguna tarea sin título | `creacion.spec.ts` · vacío y solo espacios | `createTaskValidator` |
| Aviso ante un título demasiado largo | `creacion.spec.ts` · 200 pasa, 201 se rechaza y no se guarda recortado | `createTaskValidator` |
| Una sola lista compartida del espacio | `lista_compartida.spec.ts` · mismo conjunto, con y sin filtro, y el orden acordado: desde el 2026-09-13 (PA-3), sin acotar, lo que está en curso va primero aunque sea más antiguo | `TasksController.index`, `DEFAULT_LIST_STATUSES` en `models/task.ts` |
| Lo que cada tarea muestra de su responsable | `assignee.spec.ts` · conjunto cerrado de campos, en lista y en tarea suelta | `task_assignee_transformer.ts` |
| Tres estados fijos | `filtro.spec.ts` · el cambio de estado tampoco admite valores fuera del conjunto | `TASK_STATUSES` en `models/task.ts`, `updateTaskStatusValidator` |
| Cambio de estado de cualquier tarea | `lista_compartida.spec.ts` · una tarea ajena se cambia igual, y no se reasigna; `filtro.spec.ts` · una tarea marcada como hecha por error se recupera desde el filtro. **Hasta el 2026-09-13 ninguna prueba cambiaba una tarea desde `done`**: el escenario «Vuelta atrás desde hecho» estaba sin cubrir en un requisito que esta tabla contaba como cubierto, porque cuenta requisitos y no escenarios | `task_statuses_controller.ts` |
| Las tareas exigen sesión | `errores.spec.ts` · las **siete** rutas protegidas sin credencial, más `creacion.spec.ts` | `.use(middleware.auth())` en `start/routes.ts` |
| Fecha de vencimiento opcional | `vencimiento.spec.ts` y `creacion.spec.ts` · nace sin fecha, y sin fecha no vence | migración `add_due_date_to_tasks_table.ts` |
| Fijar, cambiar y retirar la fecha de vencimiento | `vencimiento.spec.ts` · aplazar, retirar, una fecha ya pasada que se acepta y vence en la misma respuesta, y una fecha imposible que se rechaza conservando la anterior; `lista_compartida.spec.ts` · sobre una tarea ajena | `task_due_dates_controller.ts`, `setTaskDueDateValidator` |
| Cuándo una tarea está vencida | `vencimiento.spec.ts` · las tres condiciones y el borde estricto | `Task.isOverdueOn` en `models/task.ts` |
| El día de referencia lo pone quien mira | `vencimiento.spec.ts` · obligatorio, y validado contra el calendario | `taskReferenceDayValidator` |
| Consulta de una tarea suelta | `vencimiento.spec.ts`, `assignee.spec.ts`, `inexistente.spec.ts` | `TasksController.show`, `task_detail_transformer.ts` |
| La lista no lleva el vencimiento | `vencimiento.spec.ts` · ni `dueDate` ni `isOverdue` en la lista | `task_transformer.ts`, separado de `task_detail_transformer.ts` |
| Acotar la lista por estado | `filtro.spec.ts` · cada estado devuelve el suyo, y acotar es solo lectura | `listTasksValidator`, `TasksController.index` |
| Un filtro válido sin resultados es una lista vacía legítima | `filtro.spec.ts` | `TasksController.index` |
| Un estado que no existe se rechaza, no se responde vacío | `filtro.spec.ts` · se distingue de no encontrar nada | `listTasksValidator` con `vine.enum` |
| Una petición mal formada se rechaza antes de buscar nada | `orden_de_validacion.spec.ts` · un estado inventado o una fecha imposible sobre una tarea que no existe dan `422`, no `404` | los tres controladores validan antes de resolver el id ([ADR-0006](adr/0006-validar-antes-de-resolver.md)) |

Los ficheros de código son de `backend/app/`: controladores en `controllers/`, validadores en `validators/task.ts`, transformers en `transformers/`.

Los tres escenarios «Tarea inexistente», que viven repartidos entre tres de esos requisitos, los cubre `inexistente.spec.ts`: las tres rutas rechazan con la forma de error del proyecto y sin revelar internals.

### 3.2 · Lo que sigue sin cubrir, y por qué

**Los 15 requisitos de pantalla**: la pantalla de la lista, el espacio sin tareas, crear desde la lista, cambiar el estado desde la propia fila, la pantalla de una tarea, poner y quitar la fecha desde ahí, la señal de tarea vencida, no tener fecha no se penaliza, el control para acotar la lista, el filtro en la dirección de la lista, una lista sin filas que no significa siempre lo mismo, lo que sale de la vista no se pierde, una sola vista sin señales de presencia, el aviso al intentar crear sin un título válido, y el aviso ante una fecha que no vale.

Es un hueco declarado, no una omisión. **Desde el 2026-09-13 hay runner de navegador**, Playwright en `frontend/e2e/`, y cubre a propósito muy poco: los casos que ninguna otra prueba veía.

> **Dos de estos requisitos tienen prueba desde ese día, en parte.** «Crear una tarea desde la lista»: dónde entra la recién creada lo fija `lista.test.ts` en Vitest y `lista.e2e.ts` en pantalla. «Cambiar el estado desde la propia fila»: que la fila no salte hasta la siguiente carga lo fija `lista.e2e.ts`. El resto de esos dos requisitos, y los otros trece, siguen sin prueba.

> **Ese hueco se cerró el 2026-09-02.** Decía aquí que «Las tareas exigen sesión» solo tenía prueba sobre `POST /api/v1/tasks`. Al mirarlo era mayor y de otra forma: la prueba se llamaba «sin credencial, en todas las rutas protegidas» y su lista traía **tres de las siete**, todas de lectura. Ahora recorre las siete, y meter en la lista una ruta que no exige sesión la tumba.

## 4 · Criterios marcados `[PROPUESTO]`

De los 118 criterios, **27 llevaban la marca `[PROPUESTO]`**: no derivan del PRD, sino que cubren huecos detectados al redactarlos.

**El 2026-09-13 se contrastaron los 20 de historias construidas** contra la spec viva, el código y las pruebas: **16 quedan `[VALIDADO]`**, cada uno con la evidencia escrita debajo, y **uno de ellos reformulado**, el CA-17 del filtro, porque decía «cuando recargo» y lo construido conserva el filtro al recargar su dirección, que es lo que exige CA-9. Al validar CA-13 de fechas apareció que ninguna prueba mandaba una fecha pasada por la API; ahora `vencimiento.spec.ts` lo hace.

| Historia | Validados | Siguen propuestos | Por qué siguen |
|---|---:|---:|---|
| `us-fechas-vencimiento` | 7 | 1 | CA-18 depende de reasignar (E2-7) |
| `us-filtrar-por-estado` | 5 | 3 | CA-11, CA-12 y CA-14 dependen de la lista viva (E3-2) |
| `us-abrir-tarea`, `us-crear-tarea`, `us-titulo-obligatorio`, `us-lista-compartida` | 1 cada una | 0 | |
| `us-borrar-tarea`, `us-reasignar-responsable`, `us-lista-viva`, `us-editar-titulo` | 0 | 7 | Historias sin construir |

Quedan **11 propuestos**, todos de algo que no existe todavía.

Importa para la trazabilidad porque **una prueba escrita contra un criterio propuesto fija como contrato algo que nadie ha aprobado**. Y conviene decirlo: en vencimiento y filtro las pruebas llegaron **antes** que la validación. No fijaron nada sin aprobar porque se escribieron contra la spec viva, que ya los recogía; la validación del 2026-09-13 lo que hace es ratificar que la spec y el backlog dicen lo mismo.

Al escribir pruebas, la regla es: primero los criterios que sí derivan del PRD; los propuestos, solo después de validarse.

---

## 5 · Qué hacer con esto

Por orden de lo que más protege:

1. Extender las pruebas de navegador a los requisitos de pantalla que siguen sin prueba. El runner está desde el 2026-09-13; lo que falta es decidir cuáles merecen su coste en CI, empezando por los que protegen algo que ya se rompió una vez.
2. Validar los 11 criterios `[PROPUESTO]` que quedan cuando se construya su historia, antes de escribir pruebas contra ellos.
3. Corregir en el backlog las tres historias que son criterios, para que la cadena no arranque torcida.

Lo que **no** se propone: perseguir un porcentaje de cobertura. La métrica de esta matriz es qué escenario de la spec está cubierto, no qué línea se ejecuta.
