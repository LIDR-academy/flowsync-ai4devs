# Tasks

## 1. Modelo de datos (backend)

- [ ] 1.1 Crear con `node ace make:migration tasks` la tabla `tasks` (D1): `id`, `title` string(255) no nulo, `status` `enu(['pending','in_progress','done'])` no nulo con default `pending`, `assignee_id` no nulo referenciando `users.id` sin cascada, `created_at`, `updated_at`; verificar que `node ace migration:run` termina sin errores y que `database/schema.ts` regenerado contiene `TaskSchema` con `title`, `status` y `assigneeId`
- [ ] 1.2 Crear el modelo `app/models/task.ts` extendiendo `TaskSchema`, con `TASK_STATUSES`/`TaskStatus` y la relación `belongsTo` `assignee` hacia `User` (D2); verificar con `npm run typecheck`
- [ ] 1.3 Comprobar el rollback: `node ace migration:rollback` borra la tabla y un nuevo `migration:run` la recrea; verificar inspeccionando `database/schema.ts` tras cada paso

## 2. API de tareas (backend)

- [ ] 2.1 Crear `app/transformers/task_transformer.ts` que devuelva solo `id`, `title`, `status` y `assignee: { id, fullName }` (D3); verificar con `npm run typecheck`
- [ ] 2.2 Crear `app/validators/task.ts` con `createTaskValidator` (`title` string, maxLength 255) y `updateTaskValidator` (`status` enum de `TASK_STATUSES` opcional y requerido si falta `assigneeId`; `assigneeId` number con `exists` en `users.id` opcional) usando `vine.create` (D4); verificar con `npm run typecheck`
- [ ] 2.3 Crear `app/controllers/tasks_controller.ts` con `index` (preload de `assignee`, sin ordenar), `store` (responsable = usuario autenticado, `201`) y `update` (`findOrFail`, merge, `load('assignee')`) (D5); verificar con `npm run typecheck` y `npm run lint`
- [ ] 2.4 Registrar en `start/routes.ts` el grupo `/api/v1/tasks` con `GET /`, `POST /` y `PATCH /:id` bajo `middleware.auth()`, usando `controllers.Tasks`; arrancar `npm run dev` para regenerar `.adonisjs/` y verificar con `node ace list:routes` que existen exactamente esas tres rutas de tareas
- [ ] 2.5 Verificar a mano con `curl` y dos cuentas distintas los escenarios de API de `specs/tasks/spec.md`: lista igual para ambas, `201` con `pending` y creador como responsable aunque se envíen `status`/`assigneeId`, título recortado, `422` para título ausente/en blanco/256 caracteres y `201` con 255, `PATCH` de estado y de responsable sobre tarea ajena, `422` para estado fuera del conjunto, `assigneeId` inexistente y cuerpo vacío, `404` para tarea inexistente, `GET /tasks/:id` y `DELETE`, y `401` sin token; verificar además que ninguna respuesta contiene `email` ni fechas

## 3. Cliente de API y tipos (frontend)

- [ ] 3.1 Añadir a `src/lib/types.ts` los tipos `TaskStatus`, `TaskAssignee` y `Task`, y crear `src/lib/task-status.ts` con `TASK_STATUSES` y `TASK_STATUS_LABELS` (`Pendiente`, `En curso`, `Hecho`); verificar con `npm run build`
- [ ] 3.2 Ampliar `src/lib/api.ts` (D10): método `PATCH`, funciones `listTasks`, `createTask` y `updateTask`, etiquetas de campo `title`/`status`/`assigneeId` y mensaje de `404`; verificar con `npm run build` y `npm run lint`

## 4. Pantalla de lista (frontend)

- [ ] 4.1 Crear `src/components/task-status-toggle.tsx`: grupo de tres `Button` con el actual en `variant="default"` y `aria-pressed`, el resto `outline`, etiquetas de `TASK_STATUS_LABELS` (D7); verificar con `npm run build`
- [ ] 4.2 Crear `src/components/task-row.tsx` que muestre título, `assignee.fullName ?? 'Sin nombre'` y el selector de estado, sin correo, id ni fechas; verificar con `npm run build`
- [ ] 4.3 Crear `src/pages/tasks-page.tsx`: carga de la lista al montar con `FullScreenLoader` o indicador equivalente, `Alert` con botón «Reintentar» si falla, `logout()` si responde `401`, estado vacío explicativo cuando no hay tareas y lista de `task-row` en el orden recibido sin ordenar (D6); verificar en el navegador con el backend arrancado que se ven las tareas creadas en 2.5 y, con la tabla vacía, el estado vacío
- [ ] 4.4 Añadir a la página el formulario de un único campo «Título» con botón «Crear tarea» usando `useAuthForm(['title'])`, comprobación local de vacío/en blanco y de más de 255 caracteres, sin atributo `maxLength`, y añadido al final de la lista con el campo vaciado tras el éxito (D9); verificar en el navegador que la tarea aparece sin recargar como «Pendiente» con el nombre propio y que los tres errores del título se muestran bajo el campo sin recortar el texto
- [ ] 4.5 Conectar el cambio de estado optimista con reversión y aviso, deshabilitando los botones de la fila durante la petición (D8); verificar en el navegador que un clic cambia el estado al instante y persiste tras recargar, que funciona sobre una tarea de otra cuenta y que con el backend parado la fila vuelve a su estado y aparece el aviso
- [ ] 4.6 Registrar `/tasks` dentro de `ProtectedRoute` en `src/routes/app-routes.tsx` y añadir los enlaces «Ver tareas del equipo» en el perfil y «Mi perfil» en la lista, sin cambiar las redirecciones existentes a `/profile`; verificar en el navegador que sin sesión `/tasks` lleva a `/login` y que los enlaces navegan en ambos sentidos

## 5. Comprobación integrada

- [ ] 5.1 Recorrer con dos cuentas en dos navegadores los escenarios de interfaz de `specs/tasks/spec.md` (lista idéntica tras recargar, «Sin nombre» para una cuenta sin nombre, ninguna fecha ni presencia, formulario sin más campos que el título, solo tres destinos de estado) y verificar que todos se cumplen
- [ ] 5.2 Pasar `npm run lint` y `npm run typecheck` en `backend/`, y `npm run lint` y `npm run build` en `frontend/`, y verificar que terminan sin errores y que el diff incluye `database/schema.ts` y `.adonisjs/` regenerados
