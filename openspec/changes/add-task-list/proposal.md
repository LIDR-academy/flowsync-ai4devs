## Why

Hoy FlowSync solo sabe de cuentas: quien entra llega a su perfil y no hay nada que hacer allí. La lista compartida de tareas es el sustrato de todo el producto —sin ella no hay dónde crear una tarea, ni dónde cambiar un estado, ni nada que enseñar— y el backlog la sitúa al frente del orden priorizado junto a la creación.

Este change da de alta esa base: una sola lista del equipo, crear una tarea escribiendo solo el título, y cambiar el estado desde la propia fila. Cubre las cinco historias de la base de E2 y E3 (`E3-1`, `E2-1`, `E2-2`, `E2-3`, `E2-4`), que trazan a RF-5 a RF-9 y RF-16 y RF-17 del PRD.

## What Changes

**API**

- Se añade la entidad tarea, con título, estado y responsable. **No tiene fecha de vencimiento en este change**, ni preparada ni oculta.
- Tres operaciones y solo tres, todas autenticadas: listar todas las tareas del espacio, crear una y actualizarla. **No hay lectura individual, no hay borrado y no hay endpoints de equipo ni de personas.**
- El estado viaja como un conjunto cerrado de tres identificadores (`pending`, `in_progress`, `done`); cualquier otro valor se rechaza con 422.
- Al crear, el título es el único dato aceptado: la tarea nace en `pending` y con quien la crea como responsable. Un título ausente, vacío o solo de espacios se rechaza; también uno de más de 200 caracteres.
- Al actualizar se puede cambiar el estado y el responsable de cualquier tarea, sin importar de quién sea.
- Cada tarea expone de su responsable únicamente identificador y nombre. El correo y las fechas de la cuenta no viajan a una vista que no los usa.

**Interfaz**

- Nueva pantalla con la lista compartida, protegida por sesión, que pasa a ser el destino tras iniciar sesión y el de cualquier dirección desconocida. El perfil se conserva tal cual, accesible desde la lista.
- Cada fila muestra título, responsable por su nombre (o «Sin nombre» si no lo tiene puesto) y estado, rotulado en castellano: Pendiente, En curso, Hecho. **Ninguna fila muestra fechas ni marcas de vencida.**
- El estado se cambia desde la propia fila, sin abrir nada, sin diálogo de confirmación y sin rellenar ningún campo; los únicos destinos ofrecidos son los tres estados.
- Crear una tarea pide solo el título, y la nueva tarea aparece en la lista sin recargar ni navegar. El formulario **no ofrece ni sugiere** responsable, estado ni fecha.
- Con el espacio vacío se explica qué es la lista y se ofrece crear la primera tarea, en lugar de una tabla vacía.
- Reasignar el responsable no tiene pantalla en este change: la operación existe en la API, pero ninguna de las cinco historias pide ese gesto y exponer las personas del espacio queda fuera de alcance.

**Lo que este change deliberadamente no trae**

- Que la lista se refresque sola cuando otra persona cambia algo (`E3-2`).
- Filtros, orden elegible, agrupación por persona, vista de «mis tareas» o tareas privadas.
- Señales de presencia o de actividad por persona.
- Base de pruebas y tests: no se monta ninguna en este change.

## Capabilities

### New Capabilities

- `tasks`: la lista compartida de tareas del equipo — crearlas con solo un título, verlas todas con responsable y estado, y cambiar su estado desde la lista.

### Modified Capabilities

Ninguna. La capability `auth` no cambia de requisitos: el acceso, la sesión y el perfil siguen exactamente igual.

**Salvedad a reconciliar.** La spec de `auth` se está documentando en paralelo (rama `docs/spec-auth`, aún sin integrar) y describe el perfil como destino tras iniciar sesión y como destino de las direcciones desconocidas. Este change mueve ese destino a la lista. Cuando las dos ramas coincidan, esos dos escenarios de `auth` deben actualizarse; aquí no se toca un fichero que todavía no existe en esta rama.

## Impact

- **Backend**: nueva migración de la tabla de tareas con su clave ajena al usuario (que regenera el esquema), modelo de tarea con su relación al responsable, validadores de creación y de actualización, transformer de tarea, un controlador por operación y un grupo de rutas autenticado bajo `/api/v1`.
- **Frontend**: nueva página de la lista con su formulario de creación, sus filas y su estado vacío; nuevas llamadas en el único punto de contacto con la API; nueva ruta protegida y cambio del destino por defecto y del comodín. Reutiliza los componentes de interfaz ya presentes y el patrón de página y guard del acceso. **Sin dependencias nuevas y sin design system nuevo.**
- **Sin cambios** en autenticación, en el modelo de usuario ni en las respuestas de las rutas de cuenta existentes.

## Puntos abiertos

Se dejan explícitos para que nadie los dé por decididos.

- **En qué orden salen las tareas (PA-3).** No hay criterio de ordenación decidido y este change **no inventa ninguno**: no se ordena explícitamente ni en la API ni en la pantalla, así que el orden es el que resulte y no es comportamiento garantizado. Es la ausencia que más condiciona la promesa de «responder quién está en qué» y bloquea CA-5 de `E3-1`.
- **El umbral de longitud del título (PA-9).** Los 200 caracteres son una **decisión provisional** tomada solo para que CA-3 de `E2-2` sea verificable. El PRD no fija la frontera; cuando PA-9 se resuelva, este número cambia.
- **Qué transiciones de estado son legales (PA-7).** Ningún requisito declara el grafo, así que aquí los tres estados son destino desde cualquier otro, incluida la vuelta atrás desde Hecho. No es una decisión tomada: es la ausencia de decisión, y hace muy barato marcar algo como hecho por error.
- **Cuántas tareas «En curso» puede acumular una persona (PA-4).** Sin límite en este change.
- **Qué ve alguien cuando la tarea que está mirando cambia bajo sus pies (PA-8).** Fuera de alcance mientras la lista no se refresque sola.
- **Reconocer de qué trabajo habla un título.** Depende de las convenciones del equipo, no del sistema; no hay criterio que pueda suspenderse.
