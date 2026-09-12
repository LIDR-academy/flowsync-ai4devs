## Context

Ver `proposal.md` — Why. Lo que condiciona el cómo son cinco rasgos del repo tal y como está hoy:

1. **El esquema del backend se genera, no se escribe.** `database/schema.ts` sale de las migraciones y no se edita; los modelos extienden la clase generada y solo añaden relaciones y lógica. Así que el orden es: migración → `node ace migration:run` → modelo.
2. **Los controladores se registran solos.** `start/routes.ts` los referencia vía el mapa generado en `.adonisjs/`, que está commiteado. Un controlador nuevo obliga a arrancar el dev server (o los tests) para regenerar ese mapa y a commitear el diff.
3. **Toda respuesta pasa por `serialize()` y por un transformer.** El serializer envuelve en `{ data: ... }` y los transformers recortan con `this.pick(...)`. Es exactamente la herramienta que hace falta para no filtrar el registro del responsable.
4. **El frontend tiene un solo punto de contacto con la API.** `src/lib/api.ts` envuelve `fetch`, desenvuelve el `{ data }`, pone el `Bearer` y traduce los errores de VineJS a `ApiError` con `message` en castellano y `fieldErrors` por campo. Las llamadas nuevas van ahí, no en los componentes.
5. **El inventario de componentes de interfaz es corto**: `alert`, `button`, `card`, `input`, `label`. No hay `select`, ni `dropdown-menu`, ni `table`, ni `badge`, y la restricción de no añadir dependencias ni traer design system nuevo significa no ejecutar `shadcn add`. Todo lo de la lista se construye con esos cinco más `FieldError`.

No hay runner de tests en el frontend, y en el backend los directorios de suites no existen todavía. Este change **no monta ninguna base de pruebas** (decisión del alcance, no del diseño).

## Goals / Non-Goals

**Goals:**

- Dejar la tarea como entidad con exactamente los tres datos que el alcance permite: título, estado y responsable.
- Que la superficie HTTP sea literalmente tres operaciones, sin puertas traseras cómodas (ni `show`, ni `destroy`, ni listado de personas).
- Que el responsable llegue al cliente recortado desde el servidor, no recortado en la pantalla.
- Que el cambio de estado desde la fila cueste un gesto y se vea al instante, con vuelta atrás visible si el servidor lo rechaza.
- No tocar nada de autenticación más allá del destino por defecto de la navegación.

**Non-Goals:**

- Refresco automático de la lista, tiempo real o reconciliación entre pestañas.
- Paginación, filtros, búsqueda y orden elegible. El PRD contempla 200 tareas; a ese volumen una sola petición sin paginar es suficiente y paginar ahora fijaría de tapadillo un orden, que es justo la decisión abierta (PA-3).
- Cualquier preparación de la fecha de vencimiento: ni columna, ni campo, ni hueco en la interfaz.
- Ampliar o reorganizar el conjunto de componentes de interfaz.

## Decisions

### El estado se guarda como identificador, no como texto traducido

Los tres estados viven en la base de datos y en la API como `pending`, `in_progress` y `done`. El castellano —Pendiente, En curso, Hecho— es cosa de la pantalla, en un único sitio del frontend que traduce identificador a rótulo.

*Por qué:* el conjunto es cerrado y el rótulo es presentación. Guardar «En curso» ataría los datos al idioma y haría que cualquier retoque de copy fuese una migración.

*Alternativa descartada:* una tabla de estados. La convertiría en un catálogo editable, que es exactamente lo que RF-8 y CA-3 de `E2-3` prohíben.

La validación del conjunto cerrado se hace con un enum de VineJS en el validador de actualización, que ya produce el 422 con `field` que `api.ts` sabe traducir.

### Tres operaciones, tres controladores, sin métodos de más

Un controlador por operación, siguiendo el patrón ya existente (un controlador por intención, no un CRUD de recurso completo: hoy hay `NewAccount`, `AccessTokens` y `Profile`, no un `UsersController` con siete métodos).

*Por qué:* la restricción de «exactamente tres operaciones» se cumple sola si no existe el método que sobra. Un controlador de recurso con `show` y `destroy` escritos «por si acaso» y sin ruta es una invitación a enrutarlos luego.

Las rutas van en un grupo `tasks` bajo `/api/v1` con `middleware.auth()`, igual que el grupo `account`. La autenticación no necesita nada nuevo.

### El transformer del responsable se recorta en el servidor

La tarea se serializa con un transformer propio que expone `id`, `title`, `status` y un `assignee` con solo `id` y `fullName`, reutilizando la relación precargada. **No** se usa el transformer de usuario que ya existe, porque ese expone el correo y las fechas de la cuenta.

*Por qué:* la nota de implementación de `E3-1` avisa de esto: devolver el registro entero filtra datos de cuenta a una vista que no los usa, y una vez que el cliente los consume ya no se recortan sin romperlo. Recortar en el cliente no arregla nada, porque el dato ya viajó.

`fullName` puede ser nulo y viaja nulo; el «Sin nombre» es decisión de presentación y se resuelve en la pantalla, igual que ya hace el perfil.

### El «Sin nombre» se comprueba por contenido, no solo por nulo

La pantalla del perfil usa hoy `user.fullName ?? 'Sin nombre'`, que deja pasar la cadena vacía. Para las filas de la lista el respaldo se calcula sobre el nombre ya recortado de espacios, de modo que un nombre vacío o de solo espacios también pinte «Sin nombre».

*Por qué:* la restricción 6 es tajante —nunca el correo ni el id—, y una fila con el hueco del responsable en blanco incumple el criterio igual que mostrar un identificador.

### El título se normaliza en el servidor antes de validar su longitud

El validador de creación recorta los espacios de los extremos y después exige longitud mínima 1 y máxima 200. Así «solo espacios» cae en el mismo error que «vacío», sin una regla aparte.

*Por qué:* CA-2 de `E2-2` pide que un título en blanco se rechace *igual* que el vacío. Un único mensaje para los dos casos es el comportamiento pedido.

*Nota de alcance:* el 200 es provisional (PA-9, en su vertiente de RF-6: «con holgura» y «desmedido» sin frontera — no la de las «2 interacciones» de RF-9, que el backlog etiqueta con el mismo identificador). Vive en una sola constante compartida por el validador y por el atributo del campo en pantalla, para que resolver esa decisión sea cambiar un número.

### Al crear se ignora lo que no sea el título; al actualizar se valida

El alta acepta el título y descarta cualquier otro dato que venga en el cuerpo, sin error. La actualización, en cambio, rechaza con 422 un estado fuera del conjunto o un responsable inexistente.

*Por qué la asimetría:* en el alta, estado y responsable no son campos del contrato —la restricción de alcance es que el título sea lo único que se pide—, así que un valor ahí no es un dato inválido, es un dato que no existe. En la actualización sí son el contrato, y un valor fuera de rango tiene que fallar ruidosamente.

*Trade-off asumido:* un cliente que mande un estado al crear no recibe ninguna señal de que se ha ignorado, y verá su tarea en `pending`. Queda declarado en la spec como escenario propio para que no se descubra por sorpresa. La alternativa —rechazar con 422 cualquier campo desconocido— es más estricta pero convierte el alta en un contrato cerrado que hay que ampliar cada vez que la tarea gane un campo.

### Cambio de estado optimista con vuelta atrás

Al pulsar un estado, la fila lo muestra ya cambiado y la petición se lanza detrás. Si falla, la fila recupera el estado anterior y se explica el fallo en el aviso de la lista.

*Por qué:* RF-9 y CA-1 de `E2-4` piden un gesto, sin diálogo ni campos, y «el nuevo estado se refleja de inmediato». Esperar la respuesta antes de pintar convierte el gesto en una espera; no revertir al fallar deja a la vista mintiendo.

*Alternativa descartada:* recargar la lista entera tras cada cambio. Más simple, pero con 200 filas parpadea y, sin orden garantizado, las filas pueden bailar de sitio al volver.

### El control de estado son tres botones, no un desplegable

La fila ofrece los tres estados como un grupo de tres botones (el actual marcado), construido con el `Button` que ya existe.

*Por qué:* no hay componente de selección en el inventario y traerlo sería añadir superficie de design system, que el alcance prohíbe. Además tres botones cumplen «un gesto» mejor que abrir-elegir, y hacen visibles los tres destinos sin interacción previa, que es lo que pide CA-3 de `E2-4`.

*Trade-off:* ocupa más ancho por fila. Aceptable con tres estados; no escalaría si el catálogo creciera, y no puede crecer.

### La lista es la pantalla principal; el perfil se conserva

Se añade una ruta protegida para la lista, pasa a ser el destino por defecto y el del comodín, y el perfil sigue en la suya, alcanzable desde la lista. El `AuthProvider` y los dos guards no cambian de lógica, pero **el destino no está hoy en un único sitio**: el literal `/profile` aparece por separado en el guard de rutas públicas y en la regla comodín de las rutas, sin nada que los ate. Este change los unifica en una constante única de destino por defecto y hace que ambos la usen.

*Por qué unificarlos y no editar los dos literales:* si se cambia uno y se olvida el otro, iniciar sesión lleva a un sitio y abrir una dirección desconocida a otro, y los dos escenarios de la spec quedan cumplidos por separado sin ser coherentes entre sí. Es el fallo exacto que el duplicado invita a cometer.

*Por qué:* quien entra viene a trabajar sobre las tareas, no a mirarse el perfil. Y conservar el perfil evita tocar la capability de acceso, que tiene su propio cierre de sesión ya especificado.

*Consecuencia a reconciliar:* dos escenarios de la spec de `auth` en curso nombran el perfil como ese destino. Anotado en el proposal.

### Sin fecha de vencimiento, ni columna preparada

La migración no crea ninguna columna de vencimiento, y el validador de creación no acepta más campo que el título.

*Por qué:* la restricción 1 es explícita en no dejarla preparada. Una columna nullable «ya que estamos» acaba leída por alguien como que la feature está a medio hacer.

## Risks / Trade-offs

- **Sin orden definido, la lista no responde bien su propia pregunta (PA-3).** → Se asume a conciencia y se registra como punto abierto en lugar de inventar un criterio que luego haya que desaprender. Con pocas tareas el problema no se nota; con 200, sí.
- **El cambio optimista puede pisar el cambio de otra persona.** Dos personas moviendo la misma tarea a la vez: gana la última petición y ninguna de las dos se enterará hasta recargar. → Aceptado: el refresco automático es otra historia (`E3-2`), y aquí la lista es correcta en el momento en que se pide.
- **Marcar «Hecho» por error cuesta un clic y no hay confirmación (PA-7).** → El propio gesto es reversible en un clic, porque los tres estados son destino desde cualquier otro. No se añade confirmación: RF-9 la prohíbe expresamente.
- **La API acepta reasignar sin que haya pantalla para ello.** Superficie sin cobertura de interfaz. → Es la lectura literal de la restricción 5; queda declarado en el proposal y en la spec para que no se descubra como sorpresa.
- **Los tipos generados en `.adonisjs/` quedan obsoletos si se olvida regenerarlos.** → La última tarea de implementación es arrancar el dev server y commitear el diff generado.
- **No hay tests en este change.** → Riesgo asumido por decisión de alcance; la verificación es manual contra los escenarios de la spec, y toda la lógica de validación queda en validadores declarativos, que es lo más fácil de comprobar a mano.
