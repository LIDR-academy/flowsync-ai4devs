## 1. Persistencia

- [x] 1.1 Crear la migración `create_tasks_table`: `id`, `title` (200, obligatorio), `status` (obligatorio, por defecto `pending`), `assignee_id` (obligatorio, referencia a `users.id`, `onDelete('RESTRICT')`), `created_at` y `updated_at`
- [x] 1.2 Ejecutar `node ace migration:run` y commitear el `database/schema.ts` regenerado sin editarlo a mano
- [x] 1.3 Crear `app/models/task.ts` sobre el `TaskSchema` generado, con la relación `belongsTo` hacia `User` y el tipo de los tres estados
- [x] 1.4 Añadir a `app/models/user.ts` la relación `hasMany` hacia `Task`

## 2. API de tareas

- [x] 2.1 Crear `app/validators/task.ts`: validador de creación con el título recortado en los extremos y de 1 a 200 caracteres una vez recortado, y validador de cambio de estado que solo admite los tres valores
- [x] 2.2 Crear `app/transformers/task_transformer.ts` exponiendo `id`, `title`, `status`, `createdAt`, `updatedAt` y `assignee` reducido a `id` y `fullName` — sin correo ni el resto del registro de usuario
- [x] 2.3 Crear `app/controllers/tasks_controller.ts` con `index`: lista completa con el responsable precargado, ordenada por fecha de creación descendente y desempatada por identificador descendente
- [x] 2.4 Añadir a ese controlador `store`: crea la tarea con solo el título, la asigna a la cuenta autenticada y la deja en `pending`, ignorando cualquier responsable o estado que venga en el cuerpo
- [x] 2.5 Añadir a ese controlador `updateStatus`: cambia el estado de cualquier tarea, devuelve `404` si no existe, y no toca el título ni el responsable
- [x] 2.6 Registrar en `start/routes.ts` el grupo `tasks` bajo `/api/v1` con `.use(middleware.auth())`: `GET /tasks`, `POST /tasks` y `PATCH /tasks/:id/status`
- [x] 2.7 Comprobar a mano con el servidor levantado los tres endpoints y sus rechazos: sin token (`401`), título vacío y título de más de 200 (`422`), estado inválido (`422`) y tarea inexistente (`404`)

## 3. Cliente de la API

- [x] 3.1 Añadir a `src/lib/types.ts` los tipos `TaskStatus`, `TaskAssignee` y `Task`
- [x] 3.2 Extender el helper `request` de `src/lib/api.ts` para admitir el método `PATCH`
- [x] 3.3 Añadir a `src/lib/api.ts` las funciones `listTasks`, `createTask` y `updateTaskStatus`, desenvolviendo `{ data }` como hacen las de auth
- [x] 3.4 Ampliar en `src/lib/api.ts` el mapa de etiquetas de campo y la traducción de reglas para que los errores de `title` y `status` salgan en castellano

## 4. Pantalla de la lista

- [x] 4.1 Crear el mapa de etiquetas de estado (`pending` → «Pendiente», `in_progress` → «En curso», `done` → «Hecho») en un único sitio, y usarlo en todo lo que pinte un estado
- [x] 4.2 Crear el control de estado de la fila: los tres estados como botones con el actual resaltado, un clic para cambiar, montado sobre el `Button` existente
- [x] 4.3 Crear la fila de tarea: título, nombre del responsable —«Sin nombre» cuando la cuenta no tiene— y el control de estado, sin fechas ni marcas de vencimiento
- [x] 4.4 Crear el formulario de creación: un solo campo de título con su botón, estado de envío propio, error junto al campo, y el campo vaciándose al crear
- [x] 4.5 Crear el estado vacío: explica para qué sirve la lista e invita a crear la primera tarea
- [x] 4.6 Crear `src/pages/tasks-page.tsx`: carga la lista al entrar, muestra el indicador de carga mientras llega, avisa con `Alert` si falla, y compone cabecera, formulario y filas
- [x] 4.7 Añadir a la cabecera de la lista el acceso a `/profile`
- [x] 4.8 Insertar la tarea recién creada en la primera posición de la lista en memoria, sin volver a pedir la lista entera
- [x] 4.9 Aplicar el cambio de estado de forma optimista: la fila adopta el nuevo estado al instante y vuelve al anterior con un aviso si la petición falla

## 5. Navegación

- [x] 5.1 Registrar `/tasks` en `src/routes/app-routes.tsx` dentro de `ProtectedRoute`
- [x] 5.2 Cambiar a `/tasks` el destino de las direcciones desconocidas y el de `PublicOnlyRoute`, de modo que entrar, registrarse o pedir una dirección inexistente lleve a la lista

## 6. Cierre

- [ ] 6.1 Recorrer a mano el camino completo con dos cuentas distintas: crear, ver la tarea de la otra persona, cambiar su estado, recargar y comprobar que persiste
- [x] 6.2 Pasar `oxlint` y `prettier` en `frontend/`, y `eslint` y `prettier` en `backend/`
- [ ] 6.3 Repasar el delta de `specs/auth/spec.md` contra lo implementado en navegación, y confirmar que los cuatro requisitos modificados describen lo que hace la aplicación
