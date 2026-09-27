## Context

Ver `proposal.md` — Why. Lo que condiciona el diseño es que el repo ya tiene un vertical completo resuelto (el de acceso, especificado en `openspec/specs/auth/spec.md`) y este change debe parecerse a él, no inaugurar convenciones propias:

- El esquema de base de datos **se genera** desde las migraciones (`database/schema.ts`) y los modelos extienden la clase generada en lugar de declarar columnas.
- El mapa de controladores y el registro tipado de rutas de `.adonisjs/` son **código generado y versionado**: tocar rutas o controladores obliga a regenerarlo y commitear el diff.
- Toda respuesta pasa por `serialize()` y por un transformer; ningún controlador devuelve modelos crudos.
- En el frontend hay **un único punto de contacto con la API** (`src/lib/api.ts`), que desenvuelve el `{ data }`, adjunta el token y traduce los errores del backend a mensajes en castellano por campo.
- El stack va por delante de la documentación conocida (AdonisJS 7, Lucid 22, VineJS 4, React 19). Antes de dar por buena una firma de memoria, hay que mirar los `.d.ts` reales en `node_modules`.

Restricción de producto añadida: **no se añaden dependencias** ni se monta design system nuevo. Todo lo visual sale de `frontend/src/components/ui/`.

## Goals / Non-Goals

**Goals:**

- Un vertical fino y completo: migración → modelo → validador → transformer → controlador → ruta → cliente de API → página → ruta protegida.
- Que el estado se cambie desde la fila con una sola interacción y que la lista lo refleje al momento.
- Que el responsable llegue al cliente recortado a lo que la lista usa, y que ese recorte sea la única forma de obtenerlo.

**Non-Goals:**

- No hay base de pruebas ni tests en este change: no existen todavía `tests/unit/` ni `tests/functional/`, y montarlos es trabajo propio con decisiones propias (aislamiento de la base de datos entre suites, que hoy comparten fichero con el servidor de desarrollo).
- No hay tiempo real, ni paginación, ni orden configurable, ni caché de cliente.
- No se toca nada del vertical de acceso.

## Decisions

### El espacio es implícito

El PRD habla del «espacio del equipo», pero en el MVP hay uno solo y no hay entidad que lo represente. La tabla de tareas **no lleva columna de espacio**: «todas las tareas del espacio» es, literalmente, todas las tareas de la tabla.

*Alternativa descartada:* introducir ya una entidad de espacio con su clave foránea, para «no tener que migrar luego». Cuesta una tabla, una relación y un filtro en cada consulta a cambio de nada observable hoy, y adivina la forma que tendrá la multi-tenencia cuando llegue. Migrar una tabla de tareas para colgarla de un espacio es barato; desmontar una abstracción equivocada, no.

### El estado se guarda como texto con los valores del dominio

La columna de estado guarda `pending`, `in_progress` o `done` — los mismos literales que viajan por la API. El conjunto se cierra en el validador y en el tipo del modelo, no en un `enum` de base de datos.

*Por qué:* SQLite no tiene tipo enumerado real, así que un `enum` de Knex acaba siendo un `CHECK` que obliga a una migración para cualquier cambio, y el requisito «los tres estados no se tocan» hace que ese cambio no deba ocurrir de todas formas. Poner la puerta en el validador da un `422` con mensaje por campo, que es justo lo que la interfaz sabe pintar.

*Alternativa descartada:* guardar claves neutras (`pending`, `in_progress`, `done`) y traducirlas en el cliente. Añade una tabla de traducción en dos sitios y una fuente de desincronización, y el producto es monolingüe en castellano.

### Endpoint dedicado para el estado

`PATCH /api/v1/tasks/:id/status` en lugar de un `PATCH /api/v1/tasks/:id` genérico. El único campo mutable en este change es el estado; un endpoint genérico invitaría a colar por él el título o el responsable, que son historias que aún no se han especificado. Cuando lleguen (editar título, reasignar), tendrán su propia forma y su propio contrato.

### El responsable se expone recortado

Las tareas se serializan con un transformer propio para el responsable que expone **solo `id`, `fullName` e `initials`**. El transformer de usuario que ya existe incluye el email y las fechas de la cuenta, y reutilizarlo filtraría datos de acceso a una vista que no los necesita — el punto que la propia historia de la lista señala como delicado. Una vez que el cliente consume un campo, ya no se recorta sin romperlo.

El `fullName` puede ser nulo, y la interfaz muestra "Sin nombre" en ese caso, igual que ya hace el perfil. Las iniciales se calculan en el servidor, que es donde ya vive esa lógica.

### La lista se carga entera y de una vez

`GET /api/v1/tasks` devuelve todas las tareas con su responsable ya incluido, resuelto con una sola consulta de precarga: la lista es el 100 % de los accesos y hacer N consultas de responsable por cada carga es el error caro y evidente aquí. El volumen que el PRD contempla (200 tareas) cabe sobradamente en una respuesta.

### Cambio de estado optimista con vuelta atrás

Al cambiar el estado desde la fila, la interfaz pinta el estado nuevo antes de que conteste el servidor: el requisito pide que se refleje «de inmediato» y esperar la respuesta de red no es inmediato. Si la petición falla, la fila **vuelve al estado real** y se avisa. Sin esa reversión el usuario se queda mirando una lista que miente.

*Alternativa descartada:* bloquear la fila hasta la respuesta. Es más simple y más honesto, pero convierte el gesto de un clic en una espera, que es exactamente la fricción que la historia existe para quitar.

### La lista vive en su propia página y es la de entrada

Ruta protegida `/tasks`, siguiendo el mismo patrón de guard que el perfil. Pasa a ser el destino por defecto de la aplicación (donde hoy se cae al perfil), porque es la pantalla para la que se entra. El perfil sigue estando y sigue siendo donde se cierra sesión.

Eso cambia a dónde se llega tras entrar o registrarse y a dónde va una dirección desconocida, que es comportamiento ya especificado de la capability de acceso. Por eso el change lleva **un segundo delta sobre `auth`** en lugar de dejar su spec mintiendo. Ese delta añade además la vía de vuelta: desde la lista tiene que haber una forma visible de abrir el perfil, o el cierre de sesión se queda sin puerta.

### El estado del cliente vive en la página, sin librería

La lista es un `useState` en la página, alimentada al montar y actualizada tras cada creación y cada cambio de estado. No entra ninguna librería de estado ni de datos remotos: no hay dependencias nuevas, y una sola pantalla con una sola colección no las justifica.

### Los códigos de estado del recurso

Creación devuelve `201`. El endpoint de alta de cuenta que ya existe devuelve `200` al crear, y no se toca — pero la inconsistencia se hereda, no se propaga.

## Risks / Trade-offs

- **El change toca dos capabilities, no una** → Cambiar la pantalla de entrada arrastra tres requisitos de `auth` que ya estaban especificados. El delta está escrito, pero significa que este change no es puramente aditivo: al implementarlo hay que tocar el router y los guards que ya funcionan, y una regresión ahí deja a alguien sin poder entrar. Revisar los guards con las dos sesiones posibles (con y sin token) antes de dar el trabajo por bueno.

- **Cualquiera cambia el estado de cualquier tarea, sin confirmación y sin registro** → Es lo que piden los requisitos (roles planos, cambio en un gesto), y la vuelta atrás desde `done` es la única red que hay. No hay historial de cambios: si alguien mueve una tarea por error, no queda constancia de quién ni de cuándo. Aceptado para el MVP; anotado porque el PRD ya lo señala como riesgo real (PA-7).

- **El límite de 200 caracteres del título es una decisión de producto tomada en un change** → El PRD la deja abierta (PA-9). Si producto fija otro número, cambiarlo es tocar un validador y un mensaje, pero los títulos ya guardados no se revalidan.

- **Sin tests, la única red es el typecheck y el lint** → Deliberado y acordado. Consecuencia asumida: la regresión más probable —que el responsable acabe filtrando el email al cliente— no la va a detectar nada automático. Al revisar, mirar el transformer.

- **El orden por fecha de creación no resuelve «quién está en qué»** → Con volumen alto, enumerar el trabajo de una persona sigue obligando a recorrer la lista entera. PA-3 sigue abierto; este change no lo cierra, solo evita prejuzgarlo.

- **La lista no se refresca sola** → Dos personas trabajando a la vez ven listas distintas hasta que una recarga. Es una historia aparte del backlog (`E3-2`), pero la promesa de «saber en qué anda cada uno» queda a medias mientras tanto.

## Migration Plan

Change aditivo: una tabla nueva, rutas nuevas, una pantalla nueva. No hay datos que migrar ni contratos existentes que romper. La migración de vuelta es el `down` de la tabla de tareas.

Al correr la migración se **regenera `database/schema.ts`**; ese fichero es generado y va commiteado sin tocarlo a mano. Lo mismo con `.adonisjs/` al arrancar el servidor o los tests tras añadir controladores y rutas.

## Open Questions

- **El texto exacto de la pantalla vacía.** Qué se le cuenta a alguien que abre la lista de un espacio sin tareas. La spec fija que hay que explicar de qué va y ofrecer crear la primera; la redacción concreta se puede afinar al implementarla sin tocar nada más.
- **Si el campo de creación vive siempre visible sobre la lista o se despliega.** Ambas cumplen los requisitos; se decide al montar la pantalla, con los componentes que ya hay.
