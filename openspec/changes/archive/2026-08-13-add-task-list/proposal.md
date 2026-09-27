## Why

Hoy FlowSync sabe quién eres y nada más: se puede entrar, ver el perfil y salir, pero no hay ni una tarea. El producto entero existe para responder «¿en qué anda cada uno?» sin preguntar a nadie, y esa pregunta necesita a la vez que haya tareas y que haya una lista donde verlas — por eso las cinco historias de la base se implementan juntas y no una detrás de otra.

## What Changes

- Aparece la **tarea** como objeto del producto: título, responsable y estado. Nada más. Ni descripción, ni fecha de vencimiento, ni etiquetas.
- Se puede **crear una tarea escribiendo solo el título**. La tarea nace a nombre de quien la crea y en estado `pending`, sin que nadie elija ni una cosa ni la otra.
- El **título es obligatorio**: vacío o solo espacios se rechaza, y un título de más de 200 caracteres se avisa en lugar de guardarse recortado.
- Existe **una sola lista compartida** con todas las tareas del espacio, idéntica para todo el mundo. No hay tareas privadas ni vista «mis tareas».
- Cada fila muestra **título, responsable y estado** sin abrir nada. El responsable se identifica por su nombre; las cuentas sin nombre se muestran como «Sin nombre», nunca por su email ni por un identificador interno.
- El **estado se cambia desde la propia fila**, en un gesto, sin abrir la tarea, sin confirmación y sin formulario. Cualquier persona puede cambiar el estado de cualquier tarea.
- Los **tres estados son fijos**: `pending`, `in_progress` y `done`. No hay forma de añadir, renombrar ni eliminar ninguno.
- Toda la capability queda **detrás de la sesión**: sin haber entrado no se ve ninguna tarea.

Decisiones que las historias dejaban abiertas y que aquí se cierran (acordadas con producto antes de escribir):

- **Límite del título: 200 caracteres.** El PRD lo dejaba en «con holgura» / «desmedido» (PA-9). Se fija el número; la conducta que las historias sí exigían — avisar, jamás recortar en silencio — no cambia.
- **Orden de la lista: las más recientes primero.** PA-3 sigue abierto de fondo; este orden es estable y predecible y no prejuzga la agrupación por persona que aquella decisión acabe tomando.
- **Transiciones libres entre los tres estados**, incluida la vuelta desde `done`. Es la lectura literal de E2-4/CA-3 y deja recuperable un error que el cambio en un gesto hace muy barato cometer (PA-7).

## Capabilities

### New Capabilities

- `tasks`: la tarea del equipo — crearla con solo un título, verla en la lista compartida del espacio junto a su responsable y su estado, y cambiar ese estado desde la propia lista.

### Modified Capabilities

- `auth`: la lista pasa a ser la pantalla de entrada del producto, así que dejan de ser ciertos los requisitos que hoy mandan al perfil al iniciar sesión, al registrarse y al abrir una dirección desconocida. Se ajustan esos destinos y se añade el requisito de poder llegar al perfil desde la lista, para que la cuenta y el cierre de sesión no queden escondidos.

## Impact

**Backend (`backend/`)** — la API de AdonisJS gana un recurso de tareas bajo `/api/v1`, protegido con el mismo guard de token que ya usa la zona de cuenta. Entra una tabla nueva con su migración (y la consiguiente regeneración de `database/schema.ts`), un modelo con su relación al usuario, un validador y un transformer. El transformer del responsable expone solo lo que la lista necesita — nombre e iniciales — y no el registro de cuenta entero.

**Frontend (`frontend/`)** — entra una pantalla de lista como ruta protegida, siguiendo el patrón de páginas y guards que ya existe para el perfil, y las llamadas nuevas se añaden al único punto de contacto con la API. Se reutilizan los componentes de `src/components/ui/` que ya están en el repo; **no se añade ninguna dependencia ni se monta ningún design system nuevo**.

**Fuera de alcance:** abrir el detalle de una tarea, editar el título, reasignar responsable, borrar, filtrar por estado, fechas de vencimiento y refresco automático de la lista. Son historias propias del backlog. **Este change tampoco monta base de pruebas ni escribe tests.**
