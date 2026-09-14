# Casos de uso · FlowSync MVP

> **Qué es este documento.** El [PRD](flowsync-mvp.md) dice qué debe hacer el producto con jobs-to-be-done y requisitos; el [backlog](../backlog/README.md), qué se construye con historias y criterios. Aquí va lo que ninguno de los dos escribe: **el recorrido de una persona de principio a fin**, con lo que puede torcerse por el camino.
>
> No añade requisitos. Cada paso cita el requisito del PRD, la historia y la spec viva que lo gobiernan; si algo de aquí contradice a la spec, manda la spec.
>
> Escrito el 2026-09-13, sobre lo construido en `feat/sesion-5-guardarrailes`. La columna **Estado** dice si el caso funciona hoy.

## Actores

| Actor | Quién es |
|---|---|
| **Miembro** | Una persona del equipo con cuenta y sesión abierta. Todos tienen los mismos permisos: no hay roles (PRD §4.3) |
| **Visitante** | Alguien sin sesión: todavía sin cuenta, o con la sesión cerrada o caducada |
| **Sistema** | FlowSync: la SPA y la API juntas |

## Resumen

| # | Caso de uso | Actor | JTBD | RF | Historia | Estado |
|---|---|---|---|---|---|---|
| CU-1 | Crear una cuenta y entrar | Visitante | - | RF-1 | E1 | **Funciona** |
| CU-2 | Volver y encontrar la sesión abierta | Miembro | - | RF-2, RF-3, RF-4 | E1 | **Funciona** |
| CU-3 | Ver en qué anda el equipo | Miembro | JTBD-1, JTBD-2 | RF-16, RF-17, RF-21, RF-23 | E3-1 | **Funciona** |
| CU-4 | Apuntar una tarea nueva | Miembro | JTBD-4 | RF-5, RF-6, RF-7 | E2-1, E2-2, E2-3 | **Funciona** |
| CU-5 | Cambiar el estado de una tarea | Miembro | JTBD-4, JTBD-5 | RF-8, RF-9 | E2-4 | **Funciona** |
| CU-6 | Centrarse en un estado | Miembro | JTBD-3 | RF-20, RF-21 | FS-142 | **Funciona** |
| CU-7 | Poner o quitar una fecha y ver si vence | Miembro | - | RF-13, RF-14, RF-15 | E2-5, FS-118 | **Funciona** |
| CU-8 | Coger, corregir o borrar una tarea | Miembro | JTBD-3 | RF-10, RF-11, RF-12 | E2-6, E2-7, E2-10 | **No construido** |
| CU-9 | Ver los cambios de otros sin recargar | Miembro | JTBD-1 | RF-18, RF-19 | E3-2 | **No construido** |

---

## CU-1 · Crear una cuenta y entrar

**Actor:** Visitante. **Objetivo:** tener cuenta y estar dentro del espacio compartido sin ningún paso más.
**Precondición:** no tiene sesión. **Spec:** [`auth`](../../openspec/specs/auth/spec.md), requisitos de registro y pantalla de registro.

**Flujo principal**

1. Abre `/register`.
2. Escribe email, contraseña y su repetición. El nombre es opcional.
3. El sistema crea la cuenta y abre la sesión en la misma respuesta.
4. Llega a la lista de tareas.

**Flujos alternativos**

| En el paso | Si... | El sistema... |
|---|---|---|
| 2 | El email no tiene formato válido, la contraseña no mide de 8 a 32 caracteres o la repetición no coincide | Rechaza y explica **cada** error bajo su campo, todos a la vez |
| 2 | El email ya tiene cuenta, aunque sea con otras mayúsculas | Rechaza sin crear una segunda cuenta (H-11) |
| 3 | El servidor no responde | Avisa de que no se pudo conectar, distinto de un error de datos |

**Postcondición:** hay una cuenta y una sesión abierta; la persona ve lo mismo que todo el equipo.

## CU-2 · Volver y encontrar la sesión abierta

**Actor:** Miembro. **Objetivo:** no volver a escribir credenciales cada vez.
**Precondición:** entró antes en este navegador. **Spec:** [`auth`](../../openspec/specs/auth/spec.md), persistencia, recuperación y aviso de servidor no disponible.

**Flujo principal**

1. Abre FlowSync o recarga la página.
2. El sistema comprueba la sesión guardada contra el servidor, con un indicador de carga mientras tanto.
3. Llega a donde iba.

**Flujos alternativos**

| En el paso | Si... | El sistema... |
|---|---|---|
| 1 | No hay sesión guardada | Lleva a `/login`. Con credenciales incorrectas, un error que no dice si la cuenta existe |
| 2 | La sesión ya no vale (se cerró desde otro sitio) | Lleva a `/login` explicando que la sesión ha caducado |
| 2 | El servidor no responde | Lleva a `/login` avisando de que no hay conexión, **y conserva la sesión**: al volver el servidor, recargar la restaura (H-38) |
| cualquiera | Una llamada recibe `401` a mitad de uso | Cierra la sesión y lleva a `/login` con el motivo (H-13) |

**Cierre de sesión:** desde el perfil. Cierra aunque el servidor no conteste, y solo invalida la sesión de ese navegador.

## CU-3 · Ver en qué anda el equipo

**Actor:** Miembro. **Objetivo:** saber quién está en qué sin preguntar a nadie.
**Precondición:** sesión abierta. **Spec:** [`tasks`](../../openspec/specs/tasks/spec.md), lista compartida.

**Flujo principal**

1. Abre `/tasks`.
2. El sistema muestra **una sola lista**, la misma para todos: título, responsable y estado de cada tarea, sin abrir ninguna.
3. Lo que está en curso va primero; después lo pendiente, lo más reciente arriba (PA-3). Lo hecho no ocupa la vista.

**Flujos alternativos**

| En el paso | Si... | El sistema... |
|---|---|---|
| 2 | El espacio no tiene tareas | Explica qué es la lista y ofrece crear la primera ahí mismo |
| 2 | Hay tareas, pero todas hechas | Dice que no queda nada pendiente ni en curso, cuántas hay terminadas, y ofrece verlas. No dice que el espacio esté vacío |

**Postcondición:** ninguna. Es solo lectura. **La lista no se actualiza sola**: lo que cambie otra persona se ve al recargar (CU-9).

## CU-4 · Apuntar una tarea nueva

**Actor:** Miembro. **Objetivo:** dejar constancia de algo en segundos.
**Precondición:** está en la lista. **Spec:** [`tasks`](../../openspec/specs/tasks/spec.md), creación y título.

**Flujo principal**

1. Escribe un título en el campo de la lista.
2. Confirma.
3. El sistema crea la tarea **a su nombre y en Pendiente**, sin preguntar nada más.
4. La tarea aparece en la lista debajo de lo que está en curso, sin recargar.

**Flujos alternativos**

| En el paso | Si... | El sistema... |
|---|---|---|
| 1 | El título está vacío o solo tiene espacios | No crea nada y lo avisa junto al campo |
| 1 | El título pasa de 200 caracteres | Lo avisa y **no lo guarda recortado** |
| 3 | La petición intenta fijar otro responsable u otro estado | Los ignora: los decide el servidor |

**Postcondición:** hay una tarea nueva, visible para todo el equipo al cargar la lista.

## CU-5 · Cambiar el estado de una tarea

**Actor:** Miembro. **Objetivo:** mantener al día en qué anda, en un gesto.
**Precondición:** está en la lista. **Spec:** [`tasks`](../../openspec/specs/tasks/spec.md), estados y cambio de estado.

**Flujo principal**

1. Pulsa el estado nuevo en la propia fila: Pendiente, En curso o Hecho.
2. El sistema lo guarda y la fila lo refleja al momento, **sin moverse de sitio** hasta la siguiente carga.

**Flujos alternativos**

| En el paso | Si... | El sistema... |
|---|---|---|
| 1 | La tarea es de otra persona | Lo permite igual, sin reasignarla: no hay permisos por responsable |
| 1 | La tarea estaba hecha por error | Se devuelve a cualquier otro estado; desde la vista por defecto se llega con el filtro «Hecho» |
| 2 | La tarea ya no existe | Responde que no existe, sin revelar nada más |

**Postcondición:** el estado nuevo es el que ve el resto del equipo al cargar.

## CU-6 · Centrarse en un estado

**Actor:** Miembro. **Objetivo:** ver solo lo pendiente, o recuperar lo hecho.
**Precondición:** está en la lista. **Spec:** [`tasks`](../../openspec/specs/tasks/spec.md), filtro por estado.

**Flujo principal**

1. Elige un estado en el control de filtro.
2. El sistema acota la lista y lo refleja en la dirección (`?status=`), así que recargar o compartir el enlace conserva el filtro.

**Flujos alternativos**

| En el paso | Si... | El sistema... |
|---|---|---|
| 2 | Ninguna tarea tiene ese estado | Dice que no hay ninguna tarea **en ese estado**, no que el espacio esté vacío, y propone otro filtro |
| 2 | La dirección trae un estado que no existe | Explica que ese estado no existe, en lugar de una lista vacía (H-16) |

## CU-7 · Poner o quitar una fecha y ver si vence

**Actor:** Miembro. **Objetivo:** fijar un plazo sin que cueste nada a quien no lo necesita.
**Precondición:** está en la lista. **Spec:** [`tasks`](../../openspec/specs/tasks/spec.md), vencimiento y tarea suelta.

**Flujo principal**

1. Abre una tarea desde la lista.
2. Pone, cambia o quita la fecha. Se guarda sola, sin confirmar.
3. El sistema indica si la tarea está vencida: tiene fecha, esa fecha es anterior al día de quien mira, y no está hecha.

**Flujos alternativos**

| En el paso | Si... | El sistema... |
|---|---|---|
| 2 | La fecha no existe en el calendario | La rechaza junto al campo y **conserva la anterior** |
| 2 | La fecha ya pasó | La acepta, y la tarea sale vencida en la misma respuesta |
| 3 | La tarea vencida se marca como hecha | Deja de estar vencida sin tocar la fecha |

**Postcondición:** la lista sigue sin mostrar fechas ni marcas; el vencimiento solo se ve al abrir la tarea.

## CU-8 · Coger, corregir o borrar una tarea

**No construido.** Las tres historias, E2-6, E2-7 y E2-10, están escritas con criterios en el backlog y quedaron fuera del alcance de lo construido. La API no tiene operaciones para reasignar, editar el título ni borrar.

Lo que el PRD pide cuando se construya: reasignar a cualquier persona sin permiso ni advertencia (RF-10), editar el título de cualquier tarea (RF-11) y borrar con confirmación explícita porque no hay papelera (RF-12). Antes de escribir su spec hay que decidir PA-8, qué ve otra persona que tenga la tarea abierta mientras se edita o se borra.

## CU-9 · Ver los cambios de otros sin recargar

**No construido**, y es el que el PRD señala como razón de ser del producto (RF-18). Hoy **hay que recargar** para ver lo que cambió otra persona. La historia E3-2 está escrita con criterios; sus tres criterios del filtro pendientes de validar dependen de ella.

Lo que el PRD pide: los cambios ajenos aparecen en menos de 5 segundos con la lista abierta (RNF-2), sin robar el foco, mover el scroll ni descartar lo que se esté escribiendo (RF-19), y sin ninguna señal de presencia (RF-22).
