## Why

La lista compartida se especificó como «todas las tareas del espacio», y con el tiempo eso deja de ser útil: lo terminado se acumula, nunca se va, y acaba tapando lo que de verdad hay entre manos. FS-142 acota la lista por estado para que lo hecho no ocupe sitio sin por ello perderse.

**Este change documenta comportamiento que ya está implementado y funcionando en el repositorio.** No es trabajo por hacer: el filtro existe en `GET /api/v1/tasks`, en el validador de la lista, en el modelo y en la pantalla de la lista. Lo que faltaba era la especificación — y, sobre todo, corregir los requisitos de la spec viva que este comportamiento vuelve falsos.

## What Changes

Lo que hoy hace el sistema, y que la spec viva todavía no recoge:

- **La vista por defecto ya no es «todas»**: sin filtro, `GET /api/v1/tasks` devuelve las pendientes y las que están en curso, y deja fuera las hechas. Esto contradice directamente el requisito vivo *Una sola lista compartida del espacio*, que afirma que la lista devuelve todas las tareas del espacio.
- **La lista admite acotarse por estado** con el parámetro `status`, que acepta exactamente uno de los tres estados del dominio.
- **Tres caminos que no se cruzan**: un estado válido devuelve solo el suyo (aunque no haya ninguna, y eso es una lista vacía legítima); no pedir nada devuelve lo que sigue abierto; y un estado que no existe se rechaza con `422` señalando el campo, **nunca como una lista vacía en silencio**.
- **Acotar es solo lectura**: ninguna tarea cambia de estado, responsable ni fecha por consultarla filtrada.
- **El control de filtro en la lista**: botones nativos —operables con teclado sin código adicional—, un solo estado a la vez, y la primera opción es la *ausencia* de filtro nombrada por lo que enseña («Pendientes y en curso»), no un «Todas» que reintroduciría lo que el filtro existe para quitar de en medio.
- **El filtro vive en la URL** (`?status=`), no en estado interno ni en almacenamiento del navegador: se comparte por enlace, el botón «atrás» lo deshace, y llegar con un estado inventado es un caso alcanzable de verdad.
- **Una lista sin filas ya no significa una sola cosa.** Hoy la pantalla distingue cuatro finales: filtro inválido, filtro válido sin resultados, no queda nada abierto pero sí hay tareas hechas, y el espacio realmente vacío. El requisito vivo *El espacio sin tareas* solo contempla el último y licenciaría enseñarlo en los otros tres.
- **Lo que sale de la vista no se pierde**: marcar algo como hecho saca la fila al instante —el cliente aplica el mismo predicado que el servidor— y se avisa adónde ha ido y cómo volver a verlo.

### Fuera de alcance, y a propósito

- **Sin tests.** Ni los había ni se añaden. El DoD de FS-142.1 pide pruebas de integración de los cuatro caminos y quedan sin escribir; la verificación de este comportamiento ha sido manual. Es decisión explícita de quien encarga el trabajo, no un descuido.
- **CA-11, CA-12 y CA-14** (una tarea entra o sale del filtro sola porque otra persona la ha movido) **no están implementados**: no existe lista viva en el producto —ni sondeo ni conexión abierta—, así que la vista solo se recompone ante acciones propias. Se quedan fuera de este delta.
- **Filtrar por responsable no existe y no se añade**: el estado es la única dimensión de filtrado, y eso es un requisito, no una omisión.
- **El orden dentro de la lista filtrada** sigue siendo el de la lista entera (más reciente primero, con desempate estable por identificador). La regla de orden propia que la historia deja pendiente de **PA-3** —la que hace falta para que la vista de «Hecho» siga siendo útil dentro de unas semanas— no se decide aquí.
- **La incompatibilidad que la historia señala entre CA-9 y CA-17** (filtro direccionable frente a filtro que no se queda pegado) se resolvió en el código a favor de CA-9: el filtro es direccionable por URL y no se persiste en ninguna otra parte. Se documenta lo que hace, y la desviación respecto a CA-17 queda anotada en `design.md`.

## Capabilities

### New Capabilities

Ninguna. Acotar la lista es comportamiento de la lista de tareas, no una capability aparte.

### Modified Capabilities

- `tasks`: la lista deja de devolver todas las tareas del espacio por defecto y pasa a admitir acotarse por estado; la pantalla de la lista deja de mostrar todas las tareas; el vacío de la lista deja de tener un solo significado; y se aclara que el filtro es una lente personal sobre la única lista, no una vista de tareas rival.

## Impact

**Estado.** Todo lo descrito está implementado y en verde. Este change no toca código.

**Backend.** `app/models/task.ts` (`DEFAULT_LIST_STATUSES`), `app/validators/task.ts` (`listTasksValidator`, con `status` opcional y acotado al enum), `app/controllers/tasks_controller.ts` (`index`). Sin migración: filtrar no añade nada que almacenar.

**Frontend.** `src/components/task-filter.tsx` (control nuevo), `src/pages/tasks-page.tsx` (filtro en la URL, cuatro estados de lista sin filas, avisos de tarea que sale de la vista), `src/lib/types.ts` (`DEFAULT_LIST_STATUSES` como espejo del backend) y `src/lib/api.ts` (`listTasks` acepta el estado).

**Riesgos.**

- **El riesgo que la propia historia señala ya está pagado**: la distinción entre *filtro inválido* y *filtro sin resultados* se sostiene hoy en dos caminos separados —`422` en el validador, lista vacía en el controlador— y en dos finales distintos de la pantalla. Fundirlos en cualquiera de las dos capas volvería a convertir «lo que has pedido no existe» en «no hay nada pendiente», y a partir de ahí ya no se recupera.
- **`DEFAULT_LIST_STATUSES` está escrito dos veces**, en el backend y en el frontend, y tiene que seguir siendo el mismo conjunto: de esa coincidencia depende que marcar algo como hecho lo saque de la vista al instante. Nada lo comprueba automáticamente.
- **Sin tests, ambos riesgos quedan sin red.**
