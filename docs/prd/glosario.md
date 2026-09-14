# Glosario del dominio

> Las palabras con las que hablan el PRD, las specs, el código y las pantallas, con el mismo significado en las cuatro capas. Cuando dos capas usan palabras distintas para lo mismo, se dice cuáles. Escrito el 2026-09-13; el glosario de proceso (spec viva, delta, mutación) está en [`guia-de-replicacion.md`](../guia-de-replicacion.md).

| Término | Qué es | En el código | En pantalla |
|---|---|---|---|
| **Espacio** | El único lugar compartido. Quien se registra queda dentro y ve lo mismo que todos. No hay más de uno (PRD §4.3) | No existe como entidad: es la ausencia de filtro por cuenta | No se nombra |
| **Miembro** | Una persona con cuenta. Todos tienen los mismos permisos; no hay roles | `User` | «tú», o el nombre |
| **Cuenta** | Email, contraseña y nombre opcional de un miembro | `users`, `UserTransformer` | Perfil |
| **Sesión** | El derecho a usar la API en nombre de una cuenta, materializado en un token opaco que no caduca | `auth_access_tokens`; `flowsync.token` en `localStorage` | «Entrar», «Cerrar sesión» |
| **Iniciales** | Dos letras que representan a un miembro sin foto: del nombre, o del email si no hay nombre | `User.initials` | El círculo junto a cada tarea |
| **Tarea** | Un trabajo apuntado por un miembro, con título, responsable, estado y, opcionalmente, fecha de vencimiento | `Task`, tabla `tasks` | Una fila de la lista |
| **Título** | Lo único que hace falta para que exista una tarea. Entre 1 y 200 caracteres, sin espacios sobrantes | `title` | El texto de la fila |
| **Responsable** | El miembro a cuyo nombre está la tarea. Nace siendo quien la crea; hoy no se puede cambiar (E2-7 no construida) | `assignee`, `assignee_id` | Nombre e iniciales en la fila |
| **Estado** | Uno de tres, conjunto cerrado. Cualquier otro valor es 422 | `pending`, `in_progress`, `done` | **Pendiente**, **En curso**, **Hecho** |
| **Lista compartida** | Todas las tareas del espacio, iguales para todos, sin filtro por quién mira | `TasksController.index` | La pantalla `/tasks` |
| **Vista por defecto** | La lista sin acotar: pendientes y en curso, con lo en curso primero. **Lo hecho queda fuera** | `DEFAULT_LIST_STATUSES` | `/tasks` sin `?status=` |
| **Acotar** o **filtrar** | Ver solo las tareas de un estado. Es la única dimensión de filtrado que existe | `?status=` validado con `vine.enum` | El control de estados sobre la lista |
| **Tarea suelta** | Una tarea abierta en su propia pantalla, con lo que la lista no muestra: fecha y vencimiento | `TasksController.show`, `TaskDetailTransformer` | `/tasks/:id` |
| **Fecha de vencimiento** | Un día del calendario, opcional, que se pone o se quita desde la tarea suelta. Sin hora ni huso | `due_date`, `AAAA-MM-DD` | El campo de fecha en la tarea |
| **Día de referencia** | El «hoy» de quien mira, que el cliente manda en cada consulta que necesita saber si algo venció. El servidor no tiene reloj para esto | `today` en la query; `localToday()` en `lib/api.ts` | No se ve; es lo que hace que la fecha sea la de tu calendario |
| **Vencida** | Una tarea con fecha, cuya fecha es **anterior** al día de referencia, y que no está hecha. Se decide al mirar, no se guarda. Vencer hoy no es estar vencida | `Task.isOverdueOn()`, la única definición | La señal en rojo en la tarea suelta; nunca en la lista |
| **Hecha** | El estado que saca una tarea de la vista por defecto y de la condición de vencida, sin borrarla | `status = 'done'` | «Hecho», y el filtro para recuperarlas |
| **Espacio vacío** | Ninguna tarea en la vista por defecto. Tiene tres finales distintos: no hay nada, todo está hecho, o el filtro no tiene resultados | Los tres estados de `tasks-page.tsx` | «Aquí todavía no hay nada», «No queda nada pendiente ni en curso», «No hay ninguna tarea en …» |

**Palabras que no se usan a propósito**: *equipo* como entidad (no existe: hay un espacio), *proyecto*, *sprint*, *prioridad*, *etiqueta*, *asignar* (se dice responsable), *borrar* (no existe la operación), *presencia* o *conectado* (el PRD lo excluye: la señal es de la tarea, nunca de la persona).
