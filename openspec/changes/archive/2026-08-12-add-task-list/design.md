## Context

Hoy el backend solo tiene la vertical de cuentas: `User`, tokens de acceso, tres controladores y el grupo `/api/v1/account` protegido por `middleware.auth()`. Toda respuesta pasa por un serializador que envuelve en `{ data }`, y cada recurso se expone a través de un transformer explícito. La base de datos es SQLite vía `better-sqlite3`, y `database/schema.ts` está **autogenerado** a partir de las migraciones: se regenera con `node ace migration:run` y no se toca a mano.

El frontend tiene una única superficie protegida (`/profile`), un contexto de sesión que guarda el token en `localStorage`, un cliente HTTP artesanal en `src/lib/api.ts` que traduce los errores de VineJS al castellano, y cinco componentes en `src/components/ui/` (`alert`, `button`, `card`, `input`, `label`). No hay cliente de datos (nada de react-query), ni componente de select, ni cabecera de aplicación: `/profile` es una tarjeta centrada a pantalla completa.

Ver `proposal.md — Why` para la motivación. Las cinco historias del backlog aportan los criterios; cuatro decisiones abiertas en el PRD (PA-3, PA-7, PA-9) se cerraron con el usuario antes de escribir esto y quedan recogidas abajo.

## Goals / Non-Goals

**Goals:**

- Añadir la vertical de tareas siguiendo el patrón que ya existe en la de cuentas, sin introducir una segunda forma de hacer las mismas cosas.
- Que la lista sea la pantalla principal del producto, con el perfil a un clic.
- Cero dependencias nuevas en los dos lados, y cero componentes nuevos en `src/components/ui/`.

**Non-Goals:**

- Montar la base de pruebas. Este change no escribe tests ni configura `tests/functional/`.
- Introducir gestión de estado de servidor (react-query, SWR) o un store global. La página se apaña con `useState` y las funciones de `lib/api.ts`.
- Refactorizar la vertical de auth. Se toca solo `app-routes.tsx`, y por la decisión de navegación.
- Generalizar `useAuthForm` para reutilizarlo desde tareas (ver decisión 9).

## Decisions

### 1. Los estados viajan en inglés y se pintan en castellano

La API usa `pending`, `in_progress`, `done`; la interfaz muestra «Pendiente», «En curso» y «Hecho». El mapa de etiquetas vive en un único sitio del frontend.

*Por qué:* todo el código existente está en inglés (`fullName`, `Logged out successfully`), y meter identificadores en castellano en la base de datos crearía dos convenciones dentro del mismo esquema.

*Alternativa descartada:* valores en castellano en la API (`pendiente`, `en_curso`, `hecho`), que ahorra el mapa de traducción y hace la API autoexplicativa frente a la spec. Se descarta por coherencia con lo que ya hay; el mapa es de tres entradas.

*Consecuencia:* la spec habla de los tres estados por su nombre en castellano, que es lo observable en pantalla. El nombre técnico del valor en la API es un detalle de esta capa.

### 2. El estado se cambia con un endpoint dedicado

`PATCH /api/v1/tasks/:id/status` con cuerpo `{ status }`, en lugar de un `PATCH /api/v1/tasks/:id` genérico.

*Por qué:* lo único modificable en este change es el estado. Un endpoint genérico obligaría a decidir ya qué campos son actualizables y a validar campos que aún no existen como caso de uso; editar el título y reasignar responsable son historias propias que ya traerán su forma.

*Alternativa descartada:* `PATCH /api/v1/tasks/:id` aceptando un cuerpo parcial. Es más convencional en REST y evitaría un endpoint por campo cuando lleguen las otras historias. Si en E2-5 y E2-6 el cuerpo parcial gana, se consolidan entonces con el coste de un cambio de contrato conocido.

### 3. Del responsable solo sale el nombre

El transformer de tarea expone `assignee: { id, fullName }`. No reutiliza `UserTransformer`, que además trae `email`, `initials`, `createdAt` y `updatedAt`.

*Por qué:* es la advertencia explícita de la historia E3-1. Devolver el registro de usuario entero filtra datos de cuenta a una vista que no los usa, y en cuanto el cliente los consume ya no se recortan sin romperlo.

*Consecuencia:* cuando la cuenta no tiene nombre (`fullName` es `null`, algo que el registro permite), la fila muestra «Sin nombre», igual que ya hace la pantalla de perfil. Es un caso degenerado conocido: para esa cuenta la lista no responde «quién está en qué». No se resuelve aquí mostrando el correo, porque CA-6 lo prohíbe expresamente.

### 4. El estado se cambia con tres botones en la fila

Cada fila lleva los tres estados como botones, con el actual resaltado. Un clic cambia. Se monta con el `Button` que ya existe.

*Por qué:* es un solo gesto, que es lo que pide RF-9 («sin abrir la tarea, sin diálogo, sin rellenar campos»), y deja los tres destinos a la vista sin abrir nada, que es CA-3 de E2-4.

*Alternativas descartadas:* un `<select>` nativo estilado (dos gestos: abrir y elegir, y el aspecto nativo desentona); y añadir el `select.tsx` de shadcn, que **no** habría añadido dependencia npm —`radix-ui` ya está instalado y es lo que usa `label.tsx`— pero sí un componente nuevo al design system, que el encargo excluye.

*Trade-off:* con muchas tareas, tres botones por fila cargan visualmente la lista. A las 200 tareas de RNF-5 esto se notará; es revisable sin tocar el contrato de la API.

### 5. El título se acota en 200 caracteres, recortando solo los extremos

Validación: obligatorio, se recortan los espacios inicial y final, y entre 1 y 200 caracteres una vez recortado. La columna se declara con esa misma longitud.

*Por qué:* PA-9 dejaba el umbral sin decidir y las historias prohibían inventárselo, así que se acordó con el usuario. 200 da de sobra para una frase descriptiva y sigue cabiendo en una fila.

*Detalle que importa:* recortar los extremos es distinto de recortar por longitud. Lo primero se hace en silencio y es lo que convierte «solo espacios» en «vacío»; lo segundo está prohibido por CA-3 de E2-2, que exige avisar. La validación mide **después** de recortar los extremos.

### 6. Orden por fecha de creación descendente, con desempate por identificador

*Por qué:* lo recién creado queda arriba, que es lo que hace verificable CA-3 de E2-1 (verlo sin ir a buscarlo).

*Detalle que importa:* SQLite guarda las marcas de tiempo con resolución de segundo, así que dos tareas creadas en el mismo segundo empatarían y el orden entre consultas dejaría de ser estable. El desempate por identificador descendente lo evita.

*Alternativas descartadas:* orden ascendente (lo nuevo cae al final, fuera de pantalla) y agrupar por responsable (PA-3 lo deja abierto por buenas razones: arrastra decisiones —orden entre personas, dónde cae lo nuevo— que este change no puede cerrar).

### 7. La lista pasa a ser el destino por defecto

`/tasks` es la pantalla de aterrizaje tras entrar y el destino de las direcciones desconocidas. `/profile` sigue existiendo y se alcanza desde la cabecera de la lista.

*Por qué:* es la pantalla principal del producto; dejarla detrás de un clic desde el perfil invierte la importancia de las dos.

*Consecuencia:* esto cambia comportamiento ya especificado en la capability `auth`, así que el change lleva un segundo delta en `specs/auth/spec.md` con los cuatro requisitos afectados. No es un requisito nuevo escondido en tareas: es una modificación de auth, y se declara como tal.

### 8. El cambio de estado se pinta antes de confirmarse, y se revierte si falla

La fila adopta el nuevo estado en cuanto se hace clic; si la petición falla, vuelve al anterior y aparece un aviso.

*Por qué:* CA-1 de E2-4 pide que el nuevo estado se refleje «de inmediato». Esperar a la respuesta introduce una espera visible en el gesto que el producto quiere que sea barato.

*Trade-off:* durante un instante la pantalla muestra algo que el servidor aún no ha aceptado. Es aceptable para un campo de tres valores cuyo error se revierte solo y se anuncia; no lo sería para una operación destructiva.

### 9. El formulario de creación no reutiliza `useAuthForm`

Lleva su propio estado local (enviando / error de campo), aunque se parezca.

*Por qué:* `useAuthForm` vive en `src/auth/` y está pensado alrededor de repartir errores de VineJS entre campos de formularios de acceso. Importarlo desde tareas acopla la vertical nueva a la de auth por un parecido superficial. Sí se reutilizan los componentes de presentación: `FieldError`, `Alert`, `Input`, `Button`, `Card`.

*Cuándo revisarlo:* si una tercera superficie necesita el mismo reparto de errores, entonces sí merece extraerse a `src/lib/`.

### 10. Las tareas no se borran con la cuenta

La clave foránea hacia `users` se declara `RESTRICT`, no `CASCADE` como la de tokens.

*Por qué:* una tarea pertenece a la lista del equipo, no a la cuenta que la creó. Borrar en cascada haría desaparecer trabajo del equipo para todos al dar de baja a una persona, que es justo lo contrario de «una sola lista compartida». Hoy no existe la baja de cuentas, así que la decisión no tiene efecto todavía; la tiene el día que exista, y entonces hará falta reasignar antes de borrar.

## Risks / Trade-offs

- **La lista no se refresca sola** → Es deliberado: el refresco en vivo es la historia E3-2. Aquí la lista es correcta en el momento en que se pide. Dos personas trabajando a la vez pueden ver estados distintos hasta que una recarga; con el equipo de referencia (10 personas) es asumible, y la recarga es un gesto.
- **Sin filtro por estado, las tareas hechas se acumulan en la vista** → RF-21 (ocultar las hechas por defecto) y RF-20 (filtrar) son otras historias. Mientras tanto la lista crece de forma monótona y a las 200 tareas de RNF-5 será incómoda. No se mitiga aquí; se registra para que la historia del filtro no se posponga indefinidamente.
- **Marcar «Hecho» por error es muy barato y no hay forma cómoda de deshacerlo** → Es el riesgo que PA-7 señala. En este change se atenúa solo: como no se ocultan las hechas, la tarea sigue a la vista y se devuelve a «Pendiente» con otro clic. Se agravará el día que se implemente RF-21, y esa historia deberá resolver el camino de vuelta.
- **Cualquiera puede cambiar el estado de la tarea de cualquiera, sin traza** → Es lo que piden RF-9 y CA-2 de E2-4 (roles planos, sin permisos). El producto no registra quién cambió qué, así que un cambio ajeno es indistinguible de uno propio. Fuera de alcance, pero conviene que sea una decisión y no un descuido.
- **No hay paginación** → `GET /api/v1/tasks` devuelve la lista entera. Con las 200 tareas del techo declarado es una respuesta pequeña y se prefiere no introducir paginación antes de tener orden y filtro decididos, porque las tres decisiones se condicionan.
- **`database/schema.ts` es generado** → Editarlo a mano lo pisa la siguiente migración. La tabla se crea con una migración y el esquema se regenera; el fichero generado se commitea como está hoy.

## Migration Plan

Despliegue en un paso: una migración aditiva que crea la tabla `tasks`. No toca `users` ni `auth_access_tokens`, no hay backfill y no rompe ningún cliente existente. La vuelta atrás es el `down` de la migración, que descarta las tareas creadas —aceptable mientras el change no esté en manos de usuarios reales.
