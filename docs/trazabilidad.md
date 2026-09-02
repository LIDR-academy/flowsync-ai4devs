# Matriz de trazabilidad

> Qué criterio tiene prueba y cuál no. Rama `s4/start`, 2026-08-26.
>
> La cadena que se traza es **historia → criterio de aceptación → escenario de la spec viva → prueba → código**. El ancla es la spec viva de `openspec/specs/`: mientras esté al día, lo que cuelga de ella también.
>
> Este documento se escribe a partir de lo que existe en el repositorio, no de lo que se pretendía construir. Donde no hay prueba, dice que no la hay.

## Resumen

| Capability | Requisitos | Escenarios | Historias | Criterios | Pruebas | Cobertura de criterios |
|---|---:|---:|---:|---:|---:|---:|
| `auth` | 19 | 45 | — | — | 26 | parcial, ver §2 |
| `tasks` | 32 | 124 | 12 | 118 | 38 | 17 de 17 requisitos de sistema, ver §3 |
| transversal | — | — | — | — | 7 | 5 de forma de los errores, 2 de aislamiento de la base |

**Al empezar este trabajo la fila de `tasks` decía 0.** Las 20 pruebas que existían eran todas de `auth`, el andamiaje que venía con el repo. Los tres módulos anteriores se dedicaron a especificar la gestión de tareas, y de los 124 escenarios escritos no se verificaba ninguno.

La suite estaba en verde, y escondía tres defectos que la revisión adversarial destapó: la regla de vencimiento incumplía una de sus tres condiciones, un estado inventado en el filtro respondía `200` con lista vacía, y la lista filtraba el email de cada responsable. Los tres están corregidos y cubiertos. Con las que fijan la lista compartida, la creación, la tarea inexistente y los bordes de la fecha, son las 38 pruebas de esta tabla.

Las siete transversales no cuelgan de ningún requisito de una capability y por eso van aparte: cinco fijan que **ninguna respuesta de error revele internals** -es H-19, incluido un `500` real de la base de datos- y dos que la suite no pueda escribir sobre la base de desarrollo (ADR-0001). Las seis nuevas de `auth` fijan que el email no distinga mayúsculas (H-11) y las tres nuevas de `tasks` que toda escritura devuelva lo persistido (H-14): los dos hallazgos estaban cerrados en `s3/start` y vivos aquí.

Sigue habiendo mucho hueco. Lo que cambia es que ahora está enumerado.

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

## 2 · `auth` · 19 requisitos, 45 escenarios, 26 pruebas

Es la única capability con verificación automática.

| Requisito de la spec viva | Pruebas | Código |
|---|---|---|
| Registro de una cuenta nueva | `signup.spec.ts` · registrarse devuelve la cuenta y un token que ya sirve | `new_account_controller.ts` |
| Validación de los datos de registro | `signup.spec.ts` · contraseña corta, confirmación que no coincide, email mal formado | `validators/user.ts` |
| Un email, una sola cuenta | `signup.spec.ts` · un email ya registrado no crea una segunda cuenta | `validators/user.ts` |
| El nombre puede quedar vacío | `signup.spec.ts` · una cuenta puede quedarse sin nombre | `validators/user.ts` |
| La contraseña nunca sale | `signup.spec.ts` · la contraseña nunca sale en la respuesta | `user_transformer.ts` |
| Inicio de sesión | `login.spec.ts` · con las credenciales correctas se emite un token que autentica | `access_tokens_controller.ts` |
| Un fallo de acceso no revela si la cuenta existe | `login.spec.ts` · un email desconocido responde igual que una contraseña equivocada | `access_tokens_controller.ts` |
| Validación previa a comprobar credenciales | `login.spec.ts` · un email mal formado se rechaza antes de comprobar credenciales | `validators/user.ts` |
| Consulta del perfil propio | `session.spec.ts` · el perfil devuelve la cuenta del token presentado | `profile_controller.ts` |
| Protección de los recursos privados | `session.spec.ts` · sin cabecera de autorización, y token inventado | `start/kernel.ts` |
| Cierre de sesión | `session.spec.ts` · cerrar sesión invalida el token usado | `access_tokens_controller.ts` |
| Sesiones simultáneas independientes | `session.spec.ts` · cerrar una sesión no cierra las demás | `access_tokens_controller.ts` |
| Rutas públicas | `session.spec.ts` · el registro y el login siguen siendo públicos | `start/routes.ts` |
| Iniciales derivadas del nombre | `initials.spec.ts` | `models/user.ts` |

### Lo que en `auth` sigue sin prueba

| Requisito | Por qué no la tiene |
|---|---|
| Los 8 requisitos de pantalla (entrada a la aplicación, errores en castellano, envío en curso, la sesión sobrevive a recargar, rutas según el estado, salir de la aplicación) | Solo se observan en navegador y no hay runner de navegador |
| Validación acumulada: varios campos inválidos a la vez devuelven todos los problemas | Verificable por API. **Hueco real, no justificado** |

---

## 3 · `tasks` · 32 requisitos, 124 escenarios, 38 pruebas

La spec se parte sola por sujeto: **17 requisitos empiezan por «El sistema SHALL»** y **15 por «La interfaz SHALL»**. La cuenta de cobertura se hace sobre los 17, porque el proyecto no tiene runner de navegador y los otros 15 no son un hueco que estas pruebas puedan llenar.

**17 de 17 requisitos de sistema tienen al menos una prueba.**

> El reparto que decía 18 y 14 era mío y estaba mal, en el sentido cómodo. Salía de dos errores que se cancelaban: contaba «Aviso ante una fecha que no vale» como observable por API cuando su texto dice «La interfaz SHALL explicar el problema junto al propio campo», y dejaba fuera de la cuenta escenarios de «Una sola vista de tareas» que sí están cubiertos. Lo destapó la tercera revisión adversarial.

### 3.1 · Reglas de dominio y contrato

| Requisito de la spec | Prueba |
|---|---|
| Creación de una tarea con solo el título | `creacion.spec.ts` · un título basta, y el responsable lo pone el servidor |
| Ninguna tarea sin título | `creacion.spec.ts` · vacío y solo espacios |
| Aviso ante un título demasiado largo | `creacion.spec.ts` · 200 pasa, 201 se rechaza y no se guarda recortado |
| Una sola lista compartida del espacio | `lista_compartida.spec.ts` · mismo conjunto, con y sin filtro, y el orden acordado |
| Lo que cada tarea muestra de su responsable | `assignee.spec.ts` · conjunto cerrado de campos, en lista y en tarea suelta |
| Tres estados fijos | `filtro.spec.ts` · el cambio de estado tampoco admite valores fuera del conjunto |
| Cambio de estado de cualquier tarea | `lista_compartida.spec.ts` · una tarea ajena se cambia igual, y no se reasigna |
| Las tareas exigen sesión | `errores.spec.ts` · las **siete** rutas protegidas sin credencial, más `creacion.spec.ts` |
| Fecha de vencimiento opcional | `vencimiento.spec.ts` y `creacion.spec.ts` · nace sin fecha, y sin fecha no vence |
| Fijar, cambiar y retirar la fecha de vencimiento | `vencimiento.spec.ts` · aplazar, retirar, y una fecha imposible que se rechaza conservando la anterior; `lista_compartida.spec.ts` · sobre una tarea ajena |
| Cuándo una tarea está vencida | `vencimiento.spec.ts` · las tres condiciones y el borde estricto |
| El día de referencia lo pone quien mira | `vencimiento.spec.ts` · obligatorio, y validado contra el calendario |
| Consulta de una tarea suelta | `vencimiento.spec.ts`, `assignee.spec.ts`, `inexistente.spec.ts` |
| La lista no lleva el vencimiento | `vencimiento.spec.ts` · ni `dueDate` ni `isOverdue` en la lista |
| Acotar la lista por estado | `filtro.spec.ts` · cada estado devuelve el suyo, y acotar es solo lectura |
| Un filtro válido sin resultados es una lista vacía legítima | `filtro.spec.ts` |
| Un estado que no existe se rechaza, no se responde vacío | `filtro.spec.ts` · se distingue de no encontrar nada |

Los tres escenarios «Tarea inexistente», que viven repartidos entre tres de esos requisitos, los cubre `inexistente.spec.ts`: las tres rutas rechazan con la forma de error del proyecto y sin revelar internals.

### 3.2 · Lo que sigue sin cubrir, y por qué

**Los 15 requisitos de pantalla**: la pantalla de la lista, el espacio sin tareas, crear desde la lista, cambiar el estado desde la propia fila, la pantalla de una tarea, poner y quitar la fecha desde ahí, la señal de tarea vencida, no tener fecha no se penaliza, el control para acotar la lista, el filtro en la dirección de la lista, una lista sin filas que no significa siempre lo mismo, lo que sale de la vista no se pierde, una sola vista sin señales de presencia, el aviso al intentar crear sin un título válido, y el aviso ante una fecha que no vale.

No hay runner de navegador en el proyecto y este trabajo no añade uno. Es un hueco declarado, no una omisión.

> **Ese hueco se cerró el 2026-09-02.** Decía aquí que «Las tareas exigen sesión» solo tenía prueba sobre `POST /api/v1/tasks`. Al mirarlo era mayor y de otra forma: la prueba se llamaba «sin credencial, en todas las rutas protegidas» y su lista traía **tres de las siete**, todas de lectura. Ahora recorre las siete, y meter en la lista una ruta que no exige sesión la tumba.

## 4 · Criterios marcados `[PROPUESTO]`

27 de los 118 criterios llevan la marca `[PROPUESTO]`: no derivan del PRD, sino que cubren huecos detectados al redactarlos y **siguen pendientes de validación**.

| Historia | Criterios propuestos |
|---|---:|
| `us-fechas-vencimiento` | 8 |
| `us-filtrar-por-estado` | 8 |
| `us-borrar-tarea` | 2 |
| `us-reasignar-responsable` | 2 |
| `us-lista-viva` | 2 |
| `us-abrir-tarea`, `us-crear-tarea`, `us-editar-titulo`, `us-lista-compartida`, `us-titulo-obligatorio` | 1 cada uno |

Importa para la trazabilidad porque **una prueba escrita contra un criterio propuesto fija como contrato algo que nadie ha aprobado**. Los dos con más carga, vencimiento y filtro, son justamente los que más código nuevo tienen detrás.

Al escribir pruebas, la regla es: primero los criterios que sí derivan del PRD; los propuestos, solo después de validarse.

---

## 5 · Qué hacer con esto

Por orden de lo que más protege:

1. Un runner de navegador, si en algún momento los 15 requisitos de pantalla dejan de ser un hueco aceptable. El de Vitest ya está, y cubre `lib/api.ts`; lo que falta es el que ve la pantalla.
2. La validación acumulada de `auth`, que es el único hueco de esa capability que no tiene excusa.
4. Validar o descartar los 27 criterios `[PROPUESTO]` antes de escribir pruebas contra ellos.
5. Corregir en el backlog las tres historias que son criterios, para que la cadena no arranque torcida.

Lo que **no** se propone: perseguir un porcentaje de cobertura. La métrica de esta matriz es qué escenario de la spec está cubierto, no qué línea se ejecuta.
