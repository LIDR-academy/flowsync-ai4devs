# Matriz de trazabilidad

> Qué criterio tiene prueba y cuál no. Rama `s4/start`, 2026-08-26.
>
> La cadena que se traza es **historia → criterio de aceptación → escenario de la spec viva → prueba → código**. El ancla es la spec viva de `openspec/specs/`: mientras esté al día, lo que cuelga de ella también.
>
> Este documento se escribe a partir de lo que existe en el repositorio, no de lo que se pretendía construir. Donde no hay prueba, dice que no la hay.

## Resumen

| Capability | Requisitos | Escenarios | Historias | Criterios | Pruebas | Cobertura de criterios |
|---|---:|---:|---:|---:|---:|---:|
| `auth` | 19 | 45 | — | — | 20 | parcial, ver §2 |
| `tasks` | 32 | 124 | 12 | 118 | 30 | parcial, ver §3 |

**Al empezar este trabajo la fila de `tasks` decía 0.** Las 20 pruebas que existían eran todas de `auth`, el andamiaje que venía con el repo. Los tres módulos anteriores se dedicaron a especificar la gestión de tareas, y de los 124 escenarios escritos no se verificaba ninguno.

La suite estaba en verde, y escondía tres defectos que la revisión adversarial destapó: la regla de vencimiento incumplía una de sus tres condiciones, un estado inventado en el filtro respondía `200` con lista vacía, y la lista filtraba el email de cada responsable. Los tres están corregidos y cubiertos. Con las que fijan la lista compartida y la creación, son las 30 pruebas nuevas de esta tabla.

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

## 2 · `auth` · 19 requisitos, 45 escenarios, 20 pruebas

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

## 3 · `tasks` · 32 requisitos, 124 escenarios, 30 pruebas

Se agrupa por lo que hay que hacer y se ordena por lo que más cuesta si se rompe en silencio.

### 3.1 · Reglas de dominio

Se rompen sin que nada avise y sin que se note en pantalla hasta que es tarde. Es donde estaban los tres defectos.

| Requisito de la spec | Criterios | Código | Prueba |
|---|---|---|---|
| Cuándo una tarea está vencida | `us-fechas-vencimiento` CA-8 a CA-12 | `models/task.ts` | `vencimiento.spec.ts` · las tres condiciones, y el borde estricto |
| El día de referencia lo pone quien mira | `us-fechas-vencimiento` CA-13, CA-14 | `models/task.ts` | `vencimiento.spec.ts` · obligatorio y validado |
| Un estado que no existe se rechaza, no se responde vacío | `us-filtrar-por-estado` CA-9 | `validators/task.ts` | `filtro.spec.ts` · se distingue de no encontrar nada |
| Acotar la lista por estado | `us-filtrar-por-estado` CA-1 a CA-4 | `tasks_controller.ts` | `filtro.spec.ts` · cada estado devuelve el suyo |
| Lo que cada tarea muestra de su responsable | `us-lista-compartida` CA-5, CA-6 | `task_assignee_transformer.ts` | `assignee.spec.ts` · conjunto cerrado de campos |
| Tres estados fijos | `us-cambiar-estado` CA-1 | `validators/task.ts` | **ninguna** |
| Aviso ante una fecha que no vale | `us-fechas-vencimiento` CA-15 a CA-18 | `validators/task.ts` | parcial · solo el día de referencia |
| Ninguna tarea sin título | `us-titulo-obligatorio` CA-1 a CA-3 | `validators/task.ts` | **ninguna** |
| Aviso ante un título demasiado largo | `us-editar-titulo` CA-6, CA-7 | `validators/task.ts` | **ninguna** |

La regla de vencimiento es la única regla de negocio no trivial del MVP. Tenía tres condiciones y el código comprobaba dos: una tarea hecha con la fecha pasada llegaba marcada como vencida. El comentario encima del método ya prometía las tres.

### 3.2 · Contrato de la API sin verificar (prioridad alta)

| Requisito de la spec | Ruta | Prueba |
|---|---|---|
| Creación de una tarea con solo el título | `POST /api/v1/tasks` | **ninguna** |
| Una sola lista compartida del espacio | `GET /api/v1/tasks` | `lista_compartida.spec.ts` · dos personas ven el mismo conjunto, y ningún parámetro lo recorta |
| Consulta de una tarea suelta | `GET /api/v1/tasks/:id` | `vencimiento.spec.ts` |
| Cambio de estado de cualquier tarea | `PATCH /api/v1/tasks/:id/status` | parcial · solo dentro del vencimiento |
| Fijar, cambiar y retirar la fecha de vencimiento | `PUT /api/v1/tasks/:id/due-date` | `vencimiento.spec.ts` · aplazar |
| Acotar la lista por estado | `GET /api/v1/tasks?status=` | `filtro.spec.ts` |
| Las tareas exigen sesión | las cinco rutas | **ninguna** |
| Lo que cada tarea muestra de su responsable | `task_assignee_transformer.ts` | `assignee.spec.ts` |
| La lista no lleva el vencimiento | `task_transformer.ts` | `vencimiento.spec.ts` |

«Las tareas exigen sesión» sin prueba merece un párrafo aparte: es la única barrera entre los datos del espacio y cualquiera que pase por ahí, y un descuido en el middleware la abre sin que ninguna pantalla cambie de aspecto.

### 3.3 · Solo observable en pantalla (fuera del alcance de la suite)

Son 12 requisitos: la pantalla de la lista, el espacio sin tareas, crear desde la lista, cambiar el estado desde la propia fila, la pantalla de una tarea, poner y quitar la fecha desde ahí, la señal de tarea vencida, el control para acotar la lista, el filtro en la dirección de la lista, una lista sin filas que no significa siempre lo mismo, lo que sale de la vista no se pierde, y una sola vista sin señales de presencia.

No hay runner de navegador en el proyecto y este trabajo no añade uno. Quedan declarados como hueco conocido, no como omisión.

---

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

1. Lo que queda sin cubrir de §3.1: los tres estados fijos, el título obligatorio y el título excesivo.
2. «Las tareas exigen sesión», de §3.2. Es la única barrera entre los datos del espacio y cualquiera que pase por ahí, y un descuido en el middleware la abre sin que ninguna pantalla cambie de aspecto.
3. La creación de tarea, que hoy no tiene ninguna prueba propia.
4. La validación acumulada de `auth`, que es el único hueco de esa capability que no tiene excusa.
5. Validar o descartar los 27 criterios `[PROPUESTO]` antes de escribir pruebas contra ellos.
6. Corregir en el backlog las tres historias que son criterios, para que la cadena no arranque torcida.

Lo que **no** se propone: perseguir un porcentaje de cobertura. La métrica de esta matriz es qué escenario de la spec está cubierto, no qué línea se ejecuta.
