# Backlog E2 — Gestión de tareas

Historias de usuario de la épica E2 del [PRD del MVP](../../prd/flowsync-mvp.md), con sus criterios de aceptación en DADO / CUANDO / ENTONCES. Los criterios son reglas de negocio observables: no incluyen endpoints, códigos de respuesta ni nombres de campo internos, que se deciden en la implementación.

## Historias

| ID | Historia | Archivo | RF | Estado |
|---|---|---|---|---|
| E2-1 | Crear una tarea con solo el título | [us-crear-tarea.md](./us-crear-tarea.md) | 13, 14, 15, 17 | Borrador |
| E2-2 | Elegir el responsable al crear una tarea | [us-elegir-responsable-al-crear.md](./us-elegir-responsable-al-crear.md) | 13, 14, 16 | Borrador |
| E2-4 | Cambiar el estado de una tarea desde la lista | [us-cambiar-estado.md](./us-cambiar-estado.md) | 18, 19, 20 | Borrador |
| E2-5 | Editar el título de una tarea | [us-editar-titulo.md](./us-editar-titulo.md) | 15, 21 | Borrador |
| E2-6 | Reasignar una tarea | [us-reasignar-tarea.md](./us-reasignar-tarea.md) | 16, 22 | Borrador |
| FS-118 | Fecha de vencimiento y tareas vencidas | [us-fechas-vencimiento.md](./us-fechas-vencimiento.md) | 13, 23, 28, 29, 36 | Enriquecida y revisada |
| FS-142 | Filtrar tareas por estado | [us-filtrar-por-estado.md](./us-filtrar-por-estado.md) | 30, 32, 35 | Borrador |

**Estados:**
- **Enriquecida y revisada:** los criterios se han revisado en sesión, con las ediciones incluidas. Quedan por confirmar los marcados como [PROPUESTO].
- **Borrador:** los criterios están escritos, pero nadie los ha revisado todavía.

**Identificadores:**
- FS-118 y FS-142 son definitivos.
- Los E2-n son provisionales hasta que se les asigne un identificador FS. Siguen la numeración del listado original de historias de E2.
- E2-3 (poner la fecha al crear) y E2-7 (cambiar o quitar la fecha) se consolidaron en FS-118, junto con la marca de vencida.
- E2-8 (aviso y vuelta al valor real cuando un cambio no se guarda, RF-26) no es una historia aparte: es un criterio de todas las historias que guardan cambios.
- FS-142 viene de un requisito de E3 (RF-30), pero se trata como historia de E2.

## Reglas comunes a todas las historias

- **No se borran tareas (RF-24).** No hay ninguna acción de borrar: lo que sobra se marca como hecho y un título mal escrito se edita.
- **Todos editan todo (RF-11).** Dentro del equipo, cualquier miembro puede crear y cambiar cualquier tarea, sin distinguir entre creador y resto.
- **Aislamiento entre equipos (RF-10, RNF-3).** Quien no es miembro de un equipo no ve, no crea y no modifica nada de él, ni siquiera con el enlace directo.
- **Error al guardar (RF-26).** Si un cambio no se guarda, se muestra un mensaje en castellano y la tarea vuelve a mostrar su valor real.
- **Cambios a la vez (RF-25).** Si dos miembros cambian la misma tarea casi a la vez, se queda el último cambio guardado.
- **Sin notificaciones (RNF-5).** Crear, asignar, cambiar o que una tarea venza no genera emails, avisos ni notificaciones.
- **Idioma y accesibilidad (RNF-7, RNF-9).** Todo en castellano, los errores junto al campo que los causa, todas las acciones de la lista con el teclado y ninguna información transmitida solo con el color.

## Dependencias

- **E1 — Cuentas y acceso:**
  - Todas las historias necesitan un equipo activo (RF-7) y la protección por sesión (RF-2).
  - E2-2 y E2-6 necesitan la lista de miembros del equipo (RF-12).
  - FS-118 necesita el huso horario del equipo (ver "Impacto en E1 y en el PRD").
- **E3 — Actividad del equipo:**
  - Cambiar el estado desde la lista (E2-4), ver la tarea creada (E2-1) y ver la fecha y la marca de vencida (FS-118) necesitan la lista del equipo de RF-27.
  - **[PROPUESTO]** E2-1 entrega una lista mínima con título, responsable y estado, y E3 la amplía.
  - Que los cambios aparezcan en otras sesiones en menos de 10 segundos (RF-31) es de E3. Los criterios de E2 que lo mencionan dependen de esa historia.

## Fuera de alcance MVP

| Historia | Motivo |
|---|---|
| Borrar una tarea | RF-24: lo que sobra se marca como hecho. |
| Crear una tarea sin responsable, para que la coja quien quiera | Una tarea sin responsable contradice saber quién está en qué. Lo pendiente se encuentra con el filtro *Pendiente* (FS-142). |
| Marcar una tarea como bloqueada | El seguimiento de bloqueos es la parte de la daily que el MVP no resuelve. |
| Añadir, renombrar o quitar estados | RF-18: estados fijos. |
| Descripción, comentarios o chat en una tarea | Convertirían FlowSync en otro gestor pesado. |
| Prioridades, estimaciones o sprints | No es el usuario del producto. |
| Poner hora a la fecha de vencimiento | RF-23: la fecha es un día de calendario, sin hora. |
| Tener un huso horario propio en una tarea | La tarea usa el huso del equipo. Un campo más rompería RNF-2. |
| Cambiar el huso horario de un equipo ya creado | Es mantenimiento, igual que renombrar el equipo, y obligaría a decidir qué pasa con las tareas ya vencidas. |
| Avisar al responsable cuando se le asigna una tarea o se le vence | RNF-5: sin notificaciones. |
| Mover una tarea a otro equipo | No está en el PRD. |
| Filtrar por vencidas o por responsable, buscar u ordenar | RF-30: el filtro es solo por estado. Con equipos pequeños, la lista cabe en una pantalla. |
| Ver cuándo se actualizó una tarea por última vez | "Frescura": pendiente de decidir en el PRD. Si entra, será de E3. |

## Impacto en E1 y en el PRD

Durante el refinamiento de FS-118 se decidió lo siguiente sobre el huso horario:
- Las fechas de vencimiento se muestran en el huso horario del equipo, y ese huso se ve junto a la fecha.
- El huso se elige una sola vez, al crear el equipo, y en el MVP no se puede cambiar.

Esto abre dos cambios pendientes:

**En el PRD:**
- **RF-3:** un equipo tiene nombre y huso horario.
- **RF-28:** "hoy" es el día en el huso horario del equipo, no en el de quien mira la lista. Así desaparece su supuesto: todos los miembros ven la misma tarea vencida a la vez.
- **Tabla de fuera de alcance:** añadir "Cambiar el huso horario de un equipo ya creado".
- **Sección 5 (épicas):** la marca de vencida (RF-28, RF-29 y RF-36) pasa de E3 a E2 dentro de FS-118, y el filtro por estado (RF-30) pasa a E2 como FS-142. Hay que actualizar la descripción de E2 y de E3 y la épica que indica cada RF.

**En la historia de E1 "Crear un equipo":** hay que añadirle estos criterios.

**CA-E1-a · El equipo se crea con un huso horario** (RF-3, cambiado)
DADO que estoy creando un equipo
CUANDO lo guardo
ENTONCES el equipo queda con el huso horario que he elegido, y todos sus miembros ven las fechas de las tareas en ese huso.

**CA-E1-b · El huso de quien crea viene preseleccionado** **[PROPUESTO]**
DADO que estoy creando un equipo
CUANDO abro el formulario
ENTONCES el huso horario aparece preseleccionado con el mío y puedo cambiarlo antes de guardar. El equipo nunca queda sin huso.

**CA-E1-c · El huso se elige por un nombre reconocible** **[PROPUESTO]**
DADO que estoy eligiendo el huso horario del equipo
CUANDO veo las opciones
ENTONCES cada una se identifica por un nombre fácil de reconocer (por ejemplo, "hora de Madrid"), no por un código técnico.

**CA-E1-d · Después de crearlo no se puede cambiar**
DADO un equipo ya creado
CUANDO cualquier miembro, incluido su creador, busca cómo cambiar el huso horario
ENTONCES no hay ninguna opción para hacerlo.

## Preguntas abiertas

1. **FS-118, CA-10:** ¿se admite poner una fecha que ya ha pasado? La propuesta es que sí.
2. **FS-118:** ¿hay un límite para las fechas futuras? Ningún criterio lo trata, así que ahora no hay ninguno.
3. **FS-118:** ¿cómo se muestra la fecha en la lista? Puede ser absoluta ("30 sept") o relativa ("vence mañana").
4. **CA-E1-b:** ¿se confirma que el huso viene preseleccionado con el de quien crea el equipo?
5. **Dependencias:** ¿entrega E2-1 una lista mínima, o se planifica antes RF-27 de E3?
6. **FS-142, CA-11:** cuando se pide un estado que no existe, ¿el filtro vuelve a *Todas*, o solo se muestra el aviso?
