# Proposal

## Why

FlowSync todavía no tiene tareas: hoy solo existen cuentas y acceso, así que el producto no responde a la pregunta para la que existe, «quién está en qué». Este change entrega la base de la gestión de tareas: una lista compartida donde se crea una tarea con solo el título y se cambia su estado desde la propia fila. Es el sustrato de todo lo demás, como filtros, vencimientos o refresco en vivo.

Historias cubiertas, con sus criterios de aceptación:

- E3-1 La lista compartida del equipo
- E2-1 Crear tarea con solo el título
- E2-2 Título obligatorio
- E2-3 Nace mía y pendiente
- E2-4 Cambiar el estado desde la lista

## What Changes

**API.** Hay exactamente tres operaciones, todas exigen sesión:

- **Listar** todas las tareas del espacio. La lista es la misma para cualquier persona que la pida.
- **Crear** una tarea. Solo se envía el título, que es obligatorio, se recorta de espacios y admite como máximo 255 caracteres. La tarea nace en `pending` y su responsable es quien la crea.
- **Actualizar** una tarea, sea de quien sea. Se puede cambiar el estado, el responsable, o ambos.
- No hay lectura individual, ni borrado, ni endpoints de equipo.

**Estados.** El conjunto es cerrado:

- Viajan por la API como `pending`, `in_progress` y `done`.
- Cualquier otro valor se rechaza con `422`.
- Se puede pasar de cualquier estado a cualquier otro, también volver desde `done`.

**Datos expuestos.** De cada tarea solo salen su identificador, el título, el estado y el responsable. Del responsable solo salen su identificador y su nombre: ni correo ni ningún otro dato de la cuenta.

**Interfaz web.** Una pantalla nueva de lista, accesible solo con sesión iniciada:

- Cada fila muestra el título, el nombre del responsable («Sin nombre» si no lo tiene puesto) y el estado.
- El estado se pinta como Pendiente, En curso o Hecho, en un grupo de tres botones que cambia el estado con un clic.
- Un formulario de un único campo crea la tarea. La tarea nueva aparece en la lista sin recargar.
- Cuando no hay ninguna tarea, se muestra un estado vacío que invita a crear la primera.
- Se añade un enlace entre la lista y el perfil, en los dos sentidos.

**Datos.** Una tabla nueva de tareas y su modelo. No hay migración de datos existentes.

**Fuera de este change**, por decisión explícita:

- Fecha de vencimiento: ni el campo, ni su visualización, ni marcas de vencida.
- Vista «mis tareas» o tareas privadas.
- Señales de presencia.
- Refresco automático de la lista cuando otra persona cambia algo; eso es la historia E3-2.
- Edición del título.
- Gesto en la interfaz para reasignar. La API ya lo admite, pero el gesto necesita su propia historia y una forma de conocer a los miembros del equipo.
- Tests: el change no monta base de pruebas ni escribe tests.

## Capabilities

### New Capabilities

- `tasks`: las tareas del equipo. Cubre la lista compartida única, la creación con solo el título, el responsable y el estado por defecto, los tres estados cerrados y el cambio de estado y de responsable, tanto en la API como en la pantalla de lista.

### Modified Capabilities

Ninguna. La pantalla a la que se llega tras iniciar sesión sigue siendo el perfil. Cambiarla por la lista modificaría la capability `auth`, y eso queda para otro change.

## Impact

**Backend.** Se añade una migración y una tabla nueva, `tasks`, con clave foránea a `users`, y su modelo. También se añaden:

- validadores de creación y actualización;
- un transformer que expone solo los datos permitidos;
- un controlador con tres acciones;
- un grupo de rutas bajo `/api/v1/tasks`, protegido por el middleware de autenticación.

El esquema autogenerado y el registro de controladores y rutas en `.adonisjs/` se regeneran y se commitean.

**Frontend.** Se añaden la página de lista y su ruta protegida, el cliente de las tres llamadas en el módulo de API, la traducción de los errores del título y las etiquetas de los estados. Solo se reutilizan componentes de `components/ui/`. No se añade ninguna dependencia.

**Contratos.** La API gana tres rutas nuevas y no rompe nada de lo existente.

**Puntos abiertos.** Se anotan aquí y no se resuelven en este change:

- **Orden de la lista (PA-3).** No hay regla decidida, así que la lista no se ordena de forma explícita. Mientras no se decida, el orden en que salen las tareas no está garantizado. Esto pesa sobre la promesa de E3-1 de poder enumerar de un vistazo el trabajo de cada persona.
- **Cuántas tareas «En curso» puede acumular una persona (PA-4).** Sin decidir.
- **Qué ve alguien cuando otra persona cambia la tarea que está mirando (PA-8).** Sin decidir. Mientras tanto, la lista es correcta en el momento en que se carga.
- **Transiciones (PA-7).** Se decide que sean libres, también la vuelta desde Hecho. Producto puede revisarlo.
- **Límite del título (PA-9).** Se fija en 255 caracteres para poder avisar en vez de recortar. Es un umbral técnico pendiente de validar con producto.
- **Gesto de reasignar en la interfaz.** Queda para una historia futura.
