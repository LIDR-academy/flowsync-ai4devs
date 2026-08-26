# Redacción de las historias: journey, mapping y qué corregir

> Revisión del backlog aplicando User Story Mapping e INVEST. No reescribe los ficheros existentes: el backlog es el registro de lo que se decidió. Marca lo que está mal redactado y por qué, para que la cadena de trazabilidad no arranque torcida.
>
> 2026-08-26, rama `s4/start`.

## Por qué esto importa aquí

La cadena que verifica el producto es **historia → criterio → escenario → prueba → código**. Empieza en la historia. Si tres ficheros del backlog no son historias sino criterios de aceptación de otra, la matriz de trazabilidad hereda el error: cuenta doce cosas donde hay nueve, y reparte los criterios de una misma historia entre tres ficheros que nadie lee juntos.

## 1 · User journey del usuario primario

Miembro de un equipo remoto plano de 3 a 10 personas. Ya tiene sesión, así que el recorrido arranca dentro del espacio.

| # | Momento | Qué necesita |
|---|---|---|
| 1 | Llego por la mañana, o vuelvo de una reunión larga | Ver el estado del equipo de un vistazo, sin escribir a nadie |
| 2 | Voy a arrancar algo nuevo | Comprobar antes si alguien ya está encima |
| 3 | Acabo de cerrar algo | Ver qué hay pendiente y sin dueño claro |
| 4 | Me pongo con una tarea | Apropiármela y ponerla en curso en un gesto |
| 5 | Aparece trabajo nuevo | Registrarlo sin que me cueste nada |
| 6 | La tarea necesita un ajuste | Corregir el título, o ponerle fecha si la tiene |
| 7 | Termino | Marcarla hecha y que salga de la vista |
| 8 | El tablero se ensucia | Borrar lo que ya no aplica |
| 9 | Sigo trabajando con la lista abierta | Enterarme de lo de los demás sin refrescar y sin que me interrumpa |

Los pasos 1, 2 y 3 son tres momentos distintos **sobre la misma superficie**: no son tres historias, son una lectura del tablero con tres intenciones. Ese es el primer sitio donde el mapeo evita el uno a uno con los requisitos funcionales.

## 2 · Story mapping

| A · Leer el tablero | B · Tomar y mover trabajo | C · Registrar trabajo | D · Mantener el trabajo | E · Enfocar la vista | F · Confiar en lo que veo |
|---|---|---|---|---|---|
| Tablero compartido | Cambiar estado desde la lista | Crear tarea | Abrir y editar tarea | Filtrar por estado | Lista viva |
| | Reasignar responsable | | Borrar tarea | | |
| | | | Fecha de vencimiento | | |

## 3 · Los tres ficheros que no son historias

| Fichero | Qué es en realidad | Por qué |
|---|---|---|
| `us-titulo-obligatorio.md` | Criterio de `us-crear-tarea` | «No permitir crear tareas sin título» no es algo que se pueda desplegar y demostrar por separado. Es cómo se comprueba que crear una tarea funciona |
| `us-responsable-y-estado-por-defecto.md` | Criterio de `us-crear-tarea` | Igual: describe el estado en que nace la tarea, que es parte del acuerdo de crearla |
| `us-abrir-tarea.md` | Superficie, no valor entregable | Su propia cabecera declara **«Traza: ninguna directa»**, que es la confesión de que no nace de un requisito sino de una pantalla. Una pantalla de detalle sin nada que hacer en ella no entrega nada; llega junto con la primera razón para abrirla |

La señal común: **ninguno entrega valor desplegable por sí solo**, y los tres son la respuesta a «¿cómo sé que la otra historia está bien hecha?».

## 4 · El backlog tal como debería leerse

Nueve historias, no doce. Se conserva el nombre de fichero actual para que la traza no se pierda.

| Historia | Absorbe | Estado en el código |
|---|---|---|
| Crear una tarea en segundos | `us-crear-tarea` + `us-titulo-obligatorio` + `us-responsable-y-estado-por-defecto` | Implementada |
| Mover una tarea desde la propia lista | `us-cambiar-estado` | Implementada |
| Ver en qué anda el equipo de un vistazo | `us-lista-compartida` | Implementada |
| Centrar la lista en un estado | `us-filtrar-por-estado` | Implementada |
| Poner fecha a lo que tiene día | `us-fechas-vencimiento` + la superficie de `us-abrir-tarea` | Implementada |
| Abrir una tarea y corregir su título | `us-editar-titulo` + la superficie de `us-abrir-tarea` | **No implementada** |
| Coger una tarea o pasársela a otro | `us-reasignar-responsable` | **No implementada** |
| Borrar una tarea que ya no aplica | `us-borrar-tarea` | **No implementada** |
| Que la lista se mantenga fresca sola | `us-lista-viva` | **No implementada** |

## 5 · Lo que no cambia, y conviene decirlo

**No se borra ningún fichero.** El backlog es el registro de lo que se decidió, y borrar retrospectivamente lo que se escribió mal deja el registro peor de lo que estaba. Lo que se hace es marcarlo aquí y en `README.md`.

**Los criterios siguen siendo válidos** aunque estén en el fichero equivocado. Un criterio de aceptación es igual de verificable esté donde esté; el problema es de organización, no de contenido.

**Al escribir pruebas, la unidad es el criterio, no el fichero.** Un caso que verifique «la tarea nace en pendiente» pertenece a la historia de crear tarea, aunque el criterio esté escrito en `us-responsable-y-estado-por-defecto.md`.

## 6 · Fuera de alcance, marcado en vez de colado

Estas salen del journey de forma natural y quedan explícitamente fuera:

| Historia tentadora | Veredicto |
|---|---|
| Ver solo mis tareas, o filtrar por responsable | Fuera. El alcance admite una sola dimensión de filtrado |
| Que me avisen cuando cambie algo | Fuera. Notificar reintroduce la interrupción que el producto existe para eliminar |
| Comentar una tarea | Fuera. Aquí no se conversa; el chat ya existe |
| Deshacer un borrado, o papelera | Fuera. El borrado se compensa solo con confirmación |
| Ver qué ha cambiado desde la última vez | Fuera. Introduce el tiempo como segundo concepto |
| Buscar por texto | Fuera. Resuelve un problema de escala que no tenemos |
| Límite de tareas en curso por persona | Fuera, y sin decidir. Además roza la vigilancia |
| Etiquetar por módulo o proyecto | Fuera. Es el primer paso hacia la configuración |
