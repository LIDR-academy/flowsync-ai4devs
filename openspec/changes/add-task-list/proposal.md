## Why

FlowSync sabe hoy registrar cuentas y abrir sesión, pero no tiene tareas: la aplicación autentica y no sirve para nada más. Las cinco historias de la base del backlog (E2-1, E2-2, E2-3, E2-4 y E3-1) describen el núcleo del producto —una lista compartida donde anotar trabajo y mantener al día en qué anda cada uno— y están señaladas como bloqueo transversal del resto del backlog: sin lista no hay dónde cambiar un estado, ni nada que filtrar, ni nada donde enseñar un vencimiento.

Este change da de alta esa capability de punta a punta: la API de tareas en `backend/` y la interfaz que la consume en `frontend/`.

## What Changes

**Modelo de datos y API (AdonisJS)**

- Nueva tabla `tasks`: título, estado, responsable opcional (FK a `users`) y marcas de tiempo. `database/schema.ts` se regenera; no se edita a mano.
- Tres endpoints bajo `/api/v1/tasks`, todos exigiendo sesión iniciada:
  - `GET /api/v1/tasks` — la lista compartida completa.
  - `POST /api/v1/tasks` — crear, con el título como único dato obligatorio.
  - `PATCH /api/v1/tasks/:id` — actualizar título, estado y responsable.
- Estados: conjunto cerrado de exactamente tres valores, `pendiente`, `en curso` y `hecho`, en minúsculas. Cualquier otro valor —incluido el mismo con otra capitalización— se rechaza con error de validación.
- Al crear: estado `pendiente` y responsable = quien crea, ambos sobrescribibles en la propia petición.
- El responsable puede quedar vacío y cambiarse después; uno que no corresponda a un usuario existente se rechaza.
- El responsable se expone como un objeto reducido (identificador, nombre e iniciales), nunca el registro de usuario completo.
- Una sola lista, idéntica para todos: sin tareas privadas, sin filtro por titular, y cualquier persona autenticada puede cambiar el estado y el responsable de cualquier tarea.

**Interfaz (React 19)**

- Nueva página de lista en `/tasks`, protegida por el guard que ya existe, que pasa a ser el destino por defecto de la aplicación.
- Cada fila muestra título, responsable **por su nombre** y estado. Sin fechas ni marcas de vencimiento.
- Cambio de estado desde la propia fila: un gesto, sin abrir la tarea, sin diálogo de confirmación y sin rellenar campos.
- Creación desde la lista pidiendo únicamente el título; la tarea recién creada aparece sin recargar.
- Estado vacío que explica qué es la lista y ofrece crear la primera tarea, en lugar de una lista vacía.
- Sin dependencias nuevas y sin design system nuevo: se reutilizan los componentes ya generados en `frontend/src/components/ui/` y el patrón de páginas, rutas y `lib/api.ts` del login.

**Base de pruebas**

- El proyecto no tiene todavía ningún test. Este change monta la base: suite `functional` de Japa con tests de integración contra la API, aislamiento de la base de datos respecto del fichero que usa el servidor de desarrollo, y helpers de autenticación reutilizables por los changes siguientes.

**Fuera de alcance (deliberado)**

- Fecha de vencimiento: no se añade ni se deja preparada.
- Lectura individual de una tarea, borrado y endpoints de equipo: no existen.
- Refresco automático de la lista cuando otra persona cambia algo (historia E3-2 aparte).
- Selector de responsable en la interfaz: cambiar de responsable requeriría enumerar usuarios, y este change no expone ningún endpoint de equipo. La API soporta la reasignación; la interfaz de este change no la ofrece. Ninguna de las cinco historias la pide.
- Aviso por título demasiado largo (E2-2 CA-3): el umbral es una decisión de producto sin tomar (PA-9) y aquí no se inventa ninguno.

## Capabilities

### New Capabilities
- `tasks`: la lista compartida de tareas del equipo — creación con solo el título, título obligatorio y no en blanco, responsable y estado por defecto al crear, los tres estados fijos con transición libre entre ellos, y una única lista visible por igual para toda persona autenticada.

### Modified Capabilities
Ninguna. `auth` no cambia: la nueva capability se apoya en su credencial de sesión y en su respuesta de acceso no autorizado tal y como están especificadas hoy.

## Impact

**Backend** — nueva migración de `tasks` (regenera `database/schema.ts`), `app/models/task.ts`, `app/validators/task.ts`, `app/transformers/task_transformer.ts` y `app/transformers/task_assignee_transformer.ts`, `app/controllers/tasks_controller.ts`, nuevo grupo en `start/routes.ts`. Se regeneran `.adonisjs/server/controllers.ts` y el registro Tuyau de `.adonisjs/client/registry/`, que están versionados y hay que commitear.

**Backend / pruebas** — `tests/functional/` (hoy inexistente), helpers en `tests/helpers/`, y un ajuste en `config/database.ts` más una variable de entorno para que las suites no escriban sobre el `tmp/db.sqlite3` del servidor de desarrollo.

**Frontend** — `src/lib/api.ts` (tres funciones nuevas y soporte de `PATCH` en el envoltorio de `fetch`, que hoy solo admite `GET` y `POST`), `src/lib/types.ts`, nueva página `src/pages/tasks-page.tsx` con sus componentes de fila y de formulario, y `src/routes/app-routes.tsx` para la ruta y el destino por defecto.

**Sin cambios en dependencias** ni en `package.json` de ninguno de los dos lados.

## Preguntas abiertas

Se dejan explícitas en lugar de resolverse a la ligera. Ninguna bloquea la implementación.

1. **En qué orden sale la lista, y si se agrupa por persona.** No hay regla decidida (PA-3 del PRD, y la ausencia que E3-1 señala como más grave). Este change **no fija ningún criterio de ordenación**: la especificación no declara orden, y los tests de integración comprueban qué tareas contiene la lista, nunca en qué posición. Decidirlo más adelante no romperá nada de lo que aquí se construye.
2. **A partir de cuántos caracteres un título es «demasiado largo»** (PA-9). Sin umbral no se puede implementar E2-2 CA-3, así que el título queda sin longitud máxima declarada.
3. **Qué se muestra como responsable cuando la cuenta no tiene nombre completo.** El campo es opcional en `users`. Se asume el mismo criterio que ya usa la pantalla de perfil («Sin nombre»), pendiente de confirmación.
4. **Cuántas tareas «En curso» puede acumular una persona** (PA-4) y **qué transiciones son legales** (PA-7). Este change aplica la decisión tomada —cualquier estado a cualquier otro, también hacia atrás— y no limita el número de tareas en curso.

## Supuestos registrados

- **E2-1 CA-2 («el flujo de creación no pide ni sugiere nada más») se aplica a la interfaz, no al contrato de la API.** El formulario de creación pide únicamente el título y no ofrece ni sugiere responsable ni estado; la API acepta además ambos como sobrescritura opcional, según la decisión tomada. Son compatibles: lo que la historia exige es que nadie tenga que rellenarlos.
- **E3-1 CA-7 se cumple por construcción.** La lista no muestra fechas ni marcas de vencimiento porque el vencimiento no existe en este change. La segunda mitad del criterio («esa información aparece solo al abrir la tarea») queda fuera: no hay vista de detalle.
- **La actualización es parcial salvo en el título.** `title` viaja siempre y es obligatorio; los campos que no se envían conservan su valor. Vaciar el responsable se pide de forma explícita, no omitiéndolo.
