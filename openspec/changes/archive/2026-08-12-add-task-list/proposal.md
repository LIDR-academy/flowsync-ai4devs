## Why

FlowSync ya sabe quién eres —registro, login, sesión persistente— pero no tiene nada sobre lo que trabajar: no existe el concepto de tarea. Sin la lista compartida no hay dónde crear nada, dónde cambiar un estado ni qué mirar para saber en qué anda el equipo, así que el resto de la épica de gestión de tareas está bloqueada detrás de ella.

Este change da de alta la capability `tasks` con lo mínimo que hace útil el producto: una sola lista del espacio, crear una tarea escribiendo solo el título, y cambiar su estado desde la propia fila.

## What Changes

- **Nueva entidad `Task`** en el backend: título, estado y responsable. Migración, modelo Lucid sobre el esquema generado, transformer y validador, siguiendo el patrón que ya usa `User`.
- **Tres endpoints nuevos** bajo `/api/v1`, todos autenticados con el guard `api` que ya existe:
  - `GET /api/v1/tasks` — la lista completa del espacio, idéntica para todos, más recientes primero.
  - `POST /api/v1/tasks` — crea una tarea con solo el título; nace a nombre de quien la crea y en `pending`.
  - `PATCH /api/v1/tasks/:id/status` — cambia el estado de cualquier tarea, propia o ajena.
- **Estados fijos**: `pending`, `in_progress`, `done` en la API; `Pendiente`, `En curso`, `Hecho` en pantalla. No hay ninguna vía en el producto para añadir, renombrar ni eliminar estados.
- **Pantalla de la lista** en el frontend (`/tasks`), ruta protegida como `/profile`: cada fila muestra título, responsable y estado; el estado se cambia desde la fila sin abrir nada ni confirmar; hay un campo para crear con solo el título; y un estado vacío que explica qué es esto y ofrece crear la primera.
- **Validación del título**: obligatorio, se recorta el espacio en blanco de los extremos, y un título de más de 200 caracteres se rechaza con aviso en lugar de guardarse recortado.
- **El responsable se expone como nombre**, no como el registro de usuario entero: la lista no necesita el correo ni el resto de datos de cuenta, y una vez que el cliente los consume ya no se recortan sin romperlo.
- **La lista pasa a ser la pantalla de aterrizaje**: al entrar y al pedir una dirección desconocida se llega a `/tasks` en lugar de a `/profile`, que sigue existiendo y se alcanza desde la cabecera de la lista.

Un único cambio de comportamiento sobre lo que ya existe: el destino por defecto tras iniciar sesión. La API actual no cambia en nada.

## Capabilities

### New Capabilities

- `tasks`: la lista compartida de tareas del espacio y lo que se puede hacer sobre ella — verla, crear una tarea con solo el título, y cambiar el estado de cualquier tarea desde la propia lista.

### Modified Capabilities

- `auth`: no cambia nada de la API ni del modo de autenticarse —este change consume la sesión que ya especifica (`Authorization: Bearer`, `401` sin sesión)— pero sí cambia **a dónde lleva** tener la sesión abierta. Su spec dice hoy que entrar, registrarse o pedir una dirección desconocida acaba en el perfil; al existir la lista, ese destino pasa a ser la lista. Cuatro requisitos de `auth` se actualizan por eso, y ninguno por otra razón.

## Impact

**Backend** (`backend/`)

- Nueva migración `create_tasks_table` → regenera `database/schema.ts` (autogenerado, no se edita a mano).
- Nuevos: `app/models/task.ts`, `app/controllers/tasks_controller.ts`, `app/transformers/task_transformer.ts`, `app/validators/task.ts`.
- `start/routes.ts`: nuevo grupo `tasks` bajo `.use(middleware.auth())`.
- `app/models/user.ts`: relación `hasMany` hacia `Task`.
- `.adonisjs/` (código generado y versionado) se regenera al arrancar el dev server y se commitea.

**Frontend** (`frontend/`)

- Nuevos: `src/pages/tasks-page.tsx` y los componentes propios que necesite bajo `src/components/`.
- `src/lib/api.ts`: las tres llamadas nuevas, incluida la traducción de sus errores de validación al castellano.
- `src/lib/types.ts`: tipos `Task`, `TaskStatus`, `TaskAssignee`.
- `src/routes/app-routes.tsx`: ruta `/tasks` protegida; pasa a ser el destino por defecto en lugar de `/profile`.

**Dependencias**: ninguna nueva, ni en backend ni en frontend. La interfaz se monta con los componentes que ya hay en `frontend/src/components/ui/` (`button`, `card`, `input`, `label`, `alert`).

**Fuera de alcance** (historias distintas, no se implementan aquí): refresco automático de la lista (RF-18), reasignar responsable (RF-10), editar y borrar tareas (RF-11, RF-12), fecha de vencimiento (RF-13 a RF-15), filtro por estado y ocultar las hechas (RF-20, RF-21), y detalle de una tarea. **Nota**: mientras RF-21 no se implemente, las tareas en `done` siguen visibles en la lista; es coherente con esta historia (una sola lista, el mismo conjunto para todos) y lo corregirá la historia del filtro.

**Sin tests**: este change no monta base de pruebas ni escribe tests. El repo no tiene todavía `tests/unit/` ni `tests/functional/`, y levantarlos es trabajo aparte.
