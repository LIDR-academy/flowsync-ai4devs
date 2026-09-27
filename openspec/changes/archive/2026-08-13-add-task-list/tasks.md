## 1. Modelo de datos

- [x] 1.1 Crear la migración de la tabla `tasks` con `id`, `title` (máx. 200), `status` (texto, por defecto `pending`), la clave foránea al usuario responsable y las marcas de tiempo
- [x] 1.2 Correr `node ace migration:run` y commitear el `database/schema.ts` regenerado sin editarlo a mano
- [x] 1.3 Crear el modelo `Task` extendiendo la clase generada, con la relación al usuario responsable y el tipo del estado acotado a los tres valores

## 2. API de tareas

- [x] 2.1 Crear el validador de creación: título obligatorio, sin espacios en los extremos, no vacío tras recortarlos y de 200 caracteres como máximo
- [x] 2.2 Crear el validador de cambio de estado, aceptando únicamente `pending`, `in_progress` y `done`
- [x] 2.3 Crear el transformer del responsable, que expone solo `id`, `fullName` e `initials` y **nunca** el email
- [x] 2.4 Crear el transformer de tarea, que incluye el responsable ya recortado por 2.3
- [x] 2.5 Implementar el listado: todas las tareas del espacio, responsable precargado en la misma consulta, orden de creación descendente y sin paginar
- [x] 2.6 Implementar la creación: la tarea nace a nombre de quien la crea y en `pending`, ignorando cualquier responsable o estado que venga en el cuerpo; responde `201`
- [x] 2.7 Implementar el cambio de estado: cualquier transición entre los tres estados, sobre cualquier tarea, sin tocar título ni responsable; `404` si la tarea no existe
- [x] 2.8 Registrar las rutas bajo `/api/v1/tasks` dentro del grupo protegido por el guard de token, y commitear el `.adonisjs/` regenerado
- [x] 2.9 Pasar `npm run lint`, `npm run format` y `npm run typecheck` en `backend/`

## 3. Cliente de API en el frontend

- [x] 3.1 Añadir a `src/lib/types.ts` los tipos de tarea, responsable y payloads, en espejo de lo que devuelve la API
- [x] 3.2 Añadir a `src/lib/api.ts` las llamadas de listar, crear y cambiar estado, con el token adjunto y el `{ data }` ya desenvuelto
- [x] 3.3 Ampliar la traducción de errores para que el fallo de título (obligatorio y demasiado largo) llegue en castellano y asociado a su campo

## 4. Pantalla de la lista

- [x] 4.1 Crear la página de la lista, montada sobre los componentes que ya existen en `src/components/ui/` y sin añadir ninguna dependencia
- [x] 4.2 Pintar cada fila con título, responsable y estado; mostrar "Sin nombre" junto a las iniciales cuando la cuenta no tenga nombre, nunca el email
- [x] 4.3 Implementar el estado vacío: explicar qué es la lista y ofrecer crear la primera tarea, en lugar de dejar la pantalla en blanco
- [x] 4.4 Implementar la creación desde la lista con un único campo de título, que añade la tarea a la vista sin recargar ni navegar y deja el campo listo para la siguiente
- [x] 4.5 Mostrar el error de título junto al campo, conservando lo escrito
- [x] 4.6 Implementar el cambio de estado desde la fila: un gesto, sin diálogo y sin abrir la tarea, con los tres estados como únicos destinos
- [x] 4.7 Aplicar el cambio de estado de forma optimista y **revertir la fila al estado real** con un aviso si el servidor lo rechaza o no responde

## 5. Navegación

- [x] 5.1 Registrar la lista como ruta protegida, con el mismo guard que ya protege el perfil
- [x] 5.2 Pasar la lista a ser el destino por defecto: tras entrar, tras registrarse y al abrir una dirección desconocida con sesión abierta
- [x] 5.3 Añadir en la lista una forma visible de abrir el perfil, y en el perfil una de volver a la lista
- [ ] 5.4 Comprobar a mano los dos guards con sesión y sin ella: sin token no se ve ninguna tarea y se acaba en `/login`; con token no se puede volver a `/login` ni a `/register`
- [x] 5.5 Pasar `npm run lint`, `npm run format` y `npm run build` en `frontend/`

## 6. Cierre

- [ ] 6.1 Recorrer a mano el camino completo: registrarse, crear una tarea, verla en la lista, cambiarle el estado, volver a `pending` desde `done`, cerrar sesión y comprobar que sin sesión no se ve nada
- [ ] 6.2 Comprobar con una segunda cuenta que ve las mismas tareas y puede cambiar el estado de las ajenas
- [ ] 6.3 Verificar que ninguna respuesta de tareas incluye el email del responsable
