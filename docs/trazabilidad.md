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
| `tasks` | 32 | 124 | 12 | 118 | 35 | 18 de 18 requisitos de API, ver §3 |

**Al empezar este trabajo la fila de `tasks` decía 0.** Las 20 pruebas que existían eran todas de `auth`, el andamiaje que venía con el repo. Los tres módulos anteriores se dedicaron a especificar la gestión de tareas, y de los 124 escenarios escritos no se verificaba ninguno.

La suite estaba en verde, y escondía tres defectos que la revisión adversarial destapó: la regla de vencimiento incumplía una de sus tres condiciones, un estado inventado en el filtro respondía `200` con lista vacía, y la lista filtraba el email de cada responsable. Los tres están corregidos y cubiertos. Con las que fijan la lista compartida, la creación, la tarea inexistente y los bordes de la fecha, son las 35 pruebas nuevas de esta tabla.

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

## 3 · `tasks` · 32 requisitos, 124 escenarios, 35 pruebas

Los 32 requisitos se parten en dos grupos que no se pueden tratar igual: **18 son observables desde la API** y **14 solo se observan en pantalla**. La cuenta de cobertura se hace sobre los 18, porque el proyecto no tiene runner de navegador y los otros 14 no son un hueco que estas pruebas puedan llenar.

**18 de 18 requisitos observables por API tienen al menos una prueba.**

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
| Las tareas exigen sesión | `creacion.spec.ts` · crear sin sesión. **Parcial**: solo cubre una de las cinco rutas |
| Fecha de vencimiento opcional | `vencimiento.spec.ts` y `creacion.spec.ts` · nace sin fecha, y sin fecha no vence |
| Fijar, cambiar y retirar la fecha de vencimiento | `vencimiento.spec.ts` · aplazar y retirar; `lista_compartida.spec.ts` · sobre una tarea ajena |
| Cuándo una tarea está vencida | `vencimiento.spec.ts` · las tres condiciones y el borde estricto |
| El día de referencia lo pone quien mira | `vencimiento.spec.ts` · obligatorio, y validado contra el calendario |
| Consulta de una tarea suelta | `vencimiento.spec.ts`, `assignee.spec.ts`, `inexistente.spec.ts` |
| La lista no lleva el vencimiento | `vencimiento.spec.ts` · ni `dueDate` ni `isOverdue` en la lista |
| Aviso ante una fecha que no vale | `vencimiento.spec.ts` · `2026-02-31` y `30/09/2026`, y la fecha anterior se conserva |
| Acotar la lista por estado | `filtro.spec.ts` · cada estado devuelve el suyo, y acotar es solo lectura |
| Un filtro válido sin resultados es una lista vacía legítima | `filtro.spec.ts` |
| Un estado que no existe se rechaza, no se responde vacío | `filtro.spec.ts` · se distingue de no encontrar nada |

Los tres escenarios «Tarea inexistente», que viven repartidos entre tres de esos requisitos, los cubre `inexistente.spec.ts`: las tres rutas rechazan con la forma de error del proyecto y sin revelar internals.

### 3.2 · Lo que sigue sin cubrir, y por qué

**Los 14 requisitos de pantalla**: la pantalla de la lista, el espacio sin tareas, crear desde la lista, cambiar el estado desde la propia fila, la pantalla de una tarea, poner y quitar la fecha desde ahí, la señal de tarea vencida, no tener fecha no se penaliza, el control para acotar la lista, el filtro en la dirección de la lista, una lista sin filas que no significa siempre lo mismo, lo que sale de la vista no se pierde, una sola vista sin señales de presencia, y el aviso al intentar crear sin un título válido.

No hay runner de navegador en el proyecto y este trabajo no añade uno. Es un hueco declarado, no una omisión.

**Y un hueco real dentro de lo cubierto**: «Las tareas exigen sesión» solo tiene prueba sobre `POST /api/v1/tasks`. Las otras cuatro rutas no la tienen, y es la única barrera entre los datos del espacio y cualquiera que pase por ahí.

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

1. «Las tareas exigen sesión» sobre las cinco rutas, no solo sobre la creación. Es la única barrera entre los datos del espacio y cualquiera que pase por ahí, y un descuido en el middleware la abre sin que ninguna pantalla cambie de aspecto.
2. Un runner de navegador, si en algún momento los 14 requisitos de pantalla dejan de ser un hueco aceptable.
4. La validación acumulada de `auth`, que es el único hueco de esa capability que no tiene excusa.
5. Validar o descartar los 27 criterios `[PROPUESTO]` antes de escribir pruebas contra ellos.
6. Corregir en el backlog las tres historias que son criterios, para que la cadena no arranque torcida.

Lo que **no** se propone: perseguir un porcentaje de cobertura. La métrica de esta matriz es qué escenario de la spec está cubierto, no qué línea se ejecuta.
