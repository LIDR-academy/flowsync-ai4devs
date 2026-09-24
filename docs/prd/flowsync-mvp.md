# FlowSync — PRD del MVP

> Documento de producto. Parte de [`alcance-mvp.md`](./alcance-mvp.md) y no lo contradice: si algo no está aquí, está fuera. Describe **qué** debe hacer el sistema, no cómo. El modelo de datos, los endpoints y la técnica de sincronización se deciden en la spec de implementación.
>
> Convención: **[SUPUESTO]** marca una decisión o cifra que no viene del alcance ni de datos reales. Hay que confirmarla o ajustarla antes de implementar o de medir.

## 1. Problema y contexto

En los equipos remotos pequeños, para saber en qué está cada uno hay que interrumpir a alguien: con la ronda de "¿en qué estás?" de la daily, que ocupa la mitad de sus 15 minutos, o preguntando por chat. Nadie ve el estado del equipo sin preguntar. Y cuando nadie pregunta, dos personas acaban trabajando en lo mismo.

- **Caso real que lo origina:** dos personas tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Se perdieron dos días de trabajo.
- **Qué se quiere eliminar:** la ronda de "¿en qué estás?" de la daily. La parte de bloqueos se queda y este MVP no la resuelve.
- **Punto de partida del producto:** ya existen el registro, el login, el perfil (solo lectura) y el logout. Todavía no hay equipos ni tareas.

## 2. Usuarios y jobs-to-be-done

**Usuario único:** cualquier miembro de un equipo remoto de 3 a 10 personas con roles planos. No hay lead ni reporte hacia arriba, así que el producto no tiene "usuario manager".

**Caso de estudio para validar (no es un cliente real):** un equipo de 6 personas de un producto SaaS, repartido en 3 husos horarios, que usa un gestor de tareas pesado y hace una daily de 15 minutos por videollamada.

| # | Cuando… | quiero… | para… |
|---|---|---|---|
| JTBD-1 | voy a empezar algo nuevo | ver qué tiene cada compañero en curso | no ponerme con algo que otra persona ya está haciendo |
| JTBD-2 | termino una tarea y busco la siguiente | ver qué está pendiente y sin empezar | elegir sabiendo qué no ha cogido nadie |
| JTBD-3 | cambio de tarea o la termino | dejarlo reflejado en segundos | que nadie tenga que preguntarme en qué estoy |
| JTBD-4 | empiezo el día o vuelvo de una reunión (otro huso horario) | ver el estado actual del equipo sin preguntar | ponerme al día sin interrumpir ni esperar a la daily |
| JTBD-5 | se me va de fecha algo que tengo asignado | que se vea que está vencido | que el retraso se vea sin tener que avisar |

**Supuestos declarados** (vienen del alcance):
- La prueba se hace con un solo equipo, así que no valida el uso de varios equipos.
- Durante la prueba, FlowSync es la única fuente del trabajo en curso. Si el equipo sigue actualizando el gestor anterior, el resultado no vale.
- Los títulos de las tareas son lo bastante descriptivos para que se vea cuándo dos se solapan. FlowSync ayuda a que haya menos solapes, pero no los detecta.

## 3. Propuesta de valor

**Una lista de tareas del equipo donde se ve quién está en qué sin preguntar a nadie.**

- **Barata de mantener:** actualizar tu tarea cuesta dos clics sobre una lista que ya tienes abierta. No hay campos de más, sprints ni estimaciones.
- **Quien escribe también gana:** la lista es su cola de trabajo, y tenerla al día hace que le interrumpan menos.
- **Cambia decisiones concretas:** no empezar lo que otro ya tiene *en curso* y elegir lo siguiente entre lo *pendiente*.
- **Espera a que la mires:** es un resumen que se consulta, no un aviso que interrumpe. Enseña el estado de las tareas, no si las personas están conectadas.
- **Sustituye al gestor, no convive con él.**
- **Riesgo n.º 1:** que la información se quede vieja. La mitigación es que actualizar cueste menos que la interrupción que evita. No se obliga a nadie.

## 4. Alcance / Fuera de alcance

### Dentro del alcance

Una vertical fina que se pueda usar de principio a fin:

- **Equipos (mínimo):** crear un equipo, añadir miembros por email (la persona ya tiene que tener cuenta), pertenecer a varios equipos y cambiar de uno a otro (se ve uno cada vez), y que solo los miembros vean las tareas del equipo. Dentro del equipo todos ven y editan todo.
- **Tareas:** título (obligatorio), responsable (obligatorio y miembro del equipo), estado y fecha de vencimiento (opcional). Hay tres estados fijos: pendiente, en curso y hecho. Se puede editar el título, cambiar el estado, reasignar y poner o quitar la fecha.
- **Visibilidad del equipo:** las tareas vencidas se marcan, la lista se filtra por estado y los cambios de los demás aparecen solos en menos de 10 segundos.
- **Calidad:** cada funcionalidad llega con tests. Sin ellos no está hecha.

### Fuera de alcance

| Fuera | Motivo (resumen; el detalle está en el alcance) |
|---|---|
| Invitar por enlace o dar de alta a gente sin cuenta | No valida la hipótesis. Basta con registrarse antes. |
| Salir de un equipo o expulsar a miembros | No ocurre en una prueba de una semana. Si surge, se arregla a mano. |
| Renombrar o borrar equipos y traspasar el rol de creador | Es mantenimiento, no resuelve el problema. |
| Roles y permisos dentro del equipo | Roles planos por decisión de producto. |
| Borrar tareas | Lo que sobra se marca como hecho y un título mal escrito se edita. |
| Tareas sin responsable | Contradicen el propósito de saber quién está en qué. |
| Estado "bloqueado" y seguimiento de bloqueos | Es la mitad de la daily que el MVP declara no resuelta. |
| Estados configurables | Es la configuración tipo Jira que se rechaza. |
| Filtrar por responsable, buscar u ordenar | Con 6 personas la lista cabe en una pantalla. |
| Sincronización instantánea | Con menos de 10 segundos basta: se trata de ver qué se ha movido, no de colaborar a la vez. |
| Resaltar qué cambió desde mi última visita | Primer candidato después del MVP. |
| Notificaciones (push, email, digest) | Volverían a crear la interrupción que se quiere quitar. |
| Presencia o "quién está conectado" | Es vigilancia. Se rechaza a propósito, no se aplaza. |
| Chat, comentarios y descripción larga | Convertirían FlowSync en otro gestor pesado. |
| Integraciones (Git, PRs, CI, calendario) e importar desde otro gestor | Son otro producto. Importar invita a actualizar dos herramientas a la vez. |
| Sprints, estimaciones, épicas, backlog priorizado y prioridades | Un equipo que necesita eso no es nuestro usuario. |
| Informes y métricas dentro del producto | No hay nadie por encima que los consuma. |
| Vista con las tareas de todos mis equipos | Cambiar de equipo es suficiente. |
| Editar el perfil, recuperar la contraseña, verificar el email | La autenticación actual basta para la prueba. |
| Aplicación móvil y modo offline | El uso es en el escritorio. |

**Pendiente de decidir:** la propuesta de valor habla de mostrar "la frescura de la tarea" (cuándo se actualizó por última vez), pero el alcance no la incluye como funcionalidad. Hasta que se decida, queda **fuera**. Si entra, sería un RF de E3.

## 5. Épicas del MVP

- **E1 «Cuentas y acceso»:** registro, login y logout (ya existen), crear equipos, añadir miembros, cambiar de equipo y garantizar que solo los miembros ven lo del equipo.
- **E2 «Gestión de tareas»:** crear tareas y cambiarles el título, el estado, el responsable y la fecha de vencimiento.
- **E3 «Actividad del equipo»:** la lista del equipo como vista del estado actual: filtrar por estado, marcar las vencidas y mostrar solos los cambios de los demás en menos de 10 segundos.

## 6. Requisitos funcionales

Cada RF indica su épica. "Miembro" significa un usuario que pertenece al equipo activo.

### E1 — Cuentas y acceso

- **RF-1** (existente) Una persona puede crear una cuenta con email y contraseña, iniciar sesión y cerrarla. Este MVP no cambia ese comportamiento.
- **RF-2** Sin sesión iniciada, cualquier pantalla de equipos o tareas lleva al login. No se muestra nada del equipo.
- **RF-3** Cualquier usuario con sesión iniciada puede crear un equipo dándole un nombre. El nombre es obligatorio y no puede estar vacío ni tener solo espacios [SUPUESTO: el alcance no fija qué datos tiene un equipo; el nombre hace falta para distinguirlos al cambiar de uno a otro]. Quien lo crea queda como creador y como primer miembro.
- **RF-4** El creador de un equipo puede añadir miembros escribiendo su email. La persona pasa a ser miembro al momento, sin invitación que aceptar.
- **RF-5** Si el email no pertenece a ninguna cuenta, no se añade a nadie y se muestra un mensaje que lo explica. Si la persona ya es miembro, tampoco se añade y se informa de ello.
- **RF-6** Solo el creador puede añadir miembros. Los demás miembros no tienen esa opción.
- **RF-7** Cada usuario ve la lista de los equipos a los que pertenece y puede cambiar de equipo activo. Solo hay un equipo activo cada vez. La lista de tareas y todas las acciones sobre tareas se aplican a ese equipo.
- **RF-8** Al entrar, el usuario ve el último equipo que tuvo activo en ese navegador. Si no hay ninguno, ve el primero de su lista [SUPUESTO].
- **RF-9** Un usuario que no pertenece a ningún equipo ve un estado vacío que le ofrece crear uno y le explica que otra persona puede añadirle por su email.
- **RF-10** Un usuario que no es miembro de un equipo no puede ver sus tareas, ni sus miembros, ni si el equipo existe, ni siquiera con el enlace directo. Tampoco puede crear ni modificar nada en él.
- **RF-11** Dentro de un equipo, todos los miembros pueden ver y editar todas las tareas, sin distinguir entre creador y resto.
- **RF-12** Cada miembro puede ver la lista de miembros del equipo activo (nombre o email).

### E2 — Gestión de tareas

- **RF-13** Cualquier miembro puede crear una tarea en el equipo activo con un título (obligatorio), un responsable (obligatorio) y, si quiere, una fecha de vencimiento. No tiene más campos.
- **RF-14** Al crear una tarea, el responsable aparece preseleccionado con quien la crea y se puede cambiar antes de guardar [SUPUESTO: reduce el esfuerzo en el caso más habitual].
- **RF-15** No se puede guardar una tarea con el título vacío o de solo espacios, ni con más de 200 caracteres [SUPUESTO sobre el límite]. El error aparece junto al campo y en castellano.
- **RF-16** El responsable solo puede elegirse entre los miembros del equipo activo. Si no es miembro, se rechaza.
- **RF-17** Toda tarea nueva empieza como **pendiente**.
- **RF-18** Una tarea siempre está en uno de tres estados: **pendiente**, **en curso** o **hecho**. No se pueden añadir, renombrar ni quitar estados.
- **RF-19** Cualquier miembro puede pasar una tarea de cualquier estado a cualquier otro, incluido volver atrás (por ejemplo, de hecho a en curso) [SUPUESTO: sin flujo impuesto].
- **RF-20** El estado se cambia desde la propia lista, sin abrir otra pantalla, con dos clics como máximo.
- **RF-21** Cualquier miembro puede editar el título de una tarea con las mismas reglas que al crearla (RF-15).
- **RF-22** Cualquier miembro puede reasignar una tarea a otro miembro. No se puede dejar una tarea sin responsable.
- **RF-23** Cualquier miembro puede poner, cambiar o quitar la fecha de vencimiento de una tarea. La fecha es un día de calendario, sin hora.
- **RF-24** No hay forma de borrar tareas.
- **RF-25** Si dos miembros cambian la misma tarea casi a la vez, se queda el último cambio guardado y ambos ven ese resultado final (RF-31) [SUPUESTO: no hay aviso de conflicto].
- **RF-26** Si un cambio no se puede guardar (validación, red o permisos), el usuario ve un mensaje en castellano y la lista vuelve a mostrar el valor real de la tarea, no el que intentó guardar.

### E3 — Actividad del equipo

- **RF-27** La lista del equipo activo muestra en cada tarea su título, su responsable, su estado y, si la tiene, su fecha de vencimiento.
- **RF-28** Una tarea está **vencida** si tiene fecha, ese día ya ha terminado y su estado no es hecho. Una tarea sin fecha nunca está vencida. Una tarea que vence hoy todavía no está vencida. "Hoy" se toma de la zona horaria de quien mira la lista [SUPUESTO: con 3 husos horarios, dos personas pueden ver la misma tarea vencida y no vencida durante unas horas].
- **RF-29** Las tareas vencidas llevan en la lista una marca visible que no depende solo del color (por ejemplo, un texto "Vencida" o un icono con etiqueta).
- **RF-30** La lista se puede filtrar por estado con estas opciones: *Todas*, *Pendiente*, *En curso* y *Hecho*. Por defecto se muestran *Todas* [SUPUESTO].
- **RF-31** Si un miembro crea una tarea o cambia su título, estado, responsable o fecha, el cambio aparece en la lista de los demás miembros que la tengan abierta en menos de 10 segundos, sin que tengan que recargar la página.
- **RF-32** Los cambios que llegan respetan el filtro activo. Por ejemplo, con el filtro *En curso*, una tarea que alguien pasa a hecho desaparece de la lista en menos de 10 segundos y una que alguien pasa a en curso aparece.
- **RF-33** Los cambios propios se ven en la lista nada más confirmarse, sin esperar al ciclo de actualización.
- **RF-34** La lista tiene un orden fijo, que decide el sistema y que el usuario no puede cambiar. Editar una tarea no la cambia de posición [SUPUESTO: orden por fecha de creación; así nada salta mientras alguien lee].
- **RF-35** Si el equipo no tiene tareas, o ninguna cumple el filtro, se muestra un estado vacío que lo dice y ofrece crear una tarea.
- **RF-36** La marca de vencida (RF-28) se recalcula cuando la lista se actualiza. Si la lista está abierta al cambiar de día, las tareas que pasan a estar vencidas se marcan sin recargar.

## 7. Requisitos no funcionales

- **RNF-1 · Propagación:** con la red en condiciones normales, pasan menos de 10 segundos desde que se confirma un cambio hasta que aparece en otra sesión abierta del mismo equipo. Se comprueba con dos sesiones en paralelo en al menos 20 cambios seguidos, y los 20 deben cumplirlo [SUPUESTO sobre el método].
- **RNF-2 · Esfuerzo de actualización:** cambiar el estado de una tarea cuesta dos clics como máximo desde la lista (RF-20). Crear una tarea no pide más de tres campos y solo el título hay que escribirlo.
- **RNF-3 · Aislamiento entre equipos:** ninguna acción o consulta de un usuario devuelve datos de un equipo del que no es miembro, tampoco a través de enlaces directos o de la propia API. Hay tests automatizados que lo cubren.
- **RNF-4 · Sin vigilancia:** el producto no registra ni muestra nada sobre la presencia de las personas (quién está conectado, última vez visto o actividad por persona). Solo muestra el estado de las tareas.
- **RNF-5 · Sin interrupciones:** el producto no envía notificaciones de ningún tipo (email, push ni avisos del navegador).
- **RNF-6 · Rendimiento de la lista:** con un equipo de 10 miembros y 300 tareas, la lista del equipo se ve completa en menos de 2 segundos tras entrar o cambiar de equipo [SUPUESTO sobre el volumen y el tiempo].
- **RNF-7 · Idioma:** toda la interfaz y todos los mensajes de error están en castellano. Los errores de validación aparecen junto al campo que los causa.
- **RNF-8 · Plataforma:** aplicación web de escritorio en las versiones actuales de Chrome, Firefox, Safari y Edge [SUPUESTO sobre los navegadores]. No hay versión móvil ni modo offline.
- **RNF-9 · Accesibilidad mínima:** todas las acciones de la lista (cambiar estado, filtrar, editar) se pueden hacer con el teclado, y ninguna información se transmite solo con el color.
- **RNF-10 · Calidad:** cada RF de E1, E2 y E3 está cubierto por al menos un test automatizado. Una funcionalidad sin tests no está hecha.

## 8. Restricciones

- **Stack actual, sin cambiarlo:** backend en AdonisJS 7 con SQLite y frontend en React 19 con Vite. El MVP se construye sobre ese stack.
- **La autenticación ya existe** (registro, login, perfil de solo lectura y logout, con sesión por token) y se reutiliza tal cual. El MVP no rehace el login ni añade proveedores externos de identidad.
- **Sin servicios de terceros:** ni integraciones ni proveedores de pago o de mensajería. Todo funciona con el backend y el frontend del repo.
- **Solo web y solo escritorio** (ver RNF-8).
- **Métricas fuera del producto:** como los informes están fuera de alcance, las métricas de la sección 9 se recogen a mano (encuesta o consulta directa de los datos). No se construye ninguna pantalla para ellas.
- **Nivel de este documento:** el modelo de datos, los endpoints, la arquitectura y la técnica de sincronización son decisiones de la spec de implementación, no de este PRD.

## 9. Métricas de éxito

**Criterio principal (del alcance):** tras **una semana** de uso real, el equipo del caso de estudio cancela la ronda de "¿en qué estás?" de la daily y **nadie pide recuperarla**. Si la siguen haciendo igual, el MVP no ha funcionado. Se comprueba al final de la semana 1 y otra vez al final de la semana 2, para asegurar que nadie la ha recuperado [SUPUESTO sobre la segunda comprobación].

**Indicadores de apoyo** (miden el riesgo n.º 1, que la información se quede vieja):

| Métrica | Cómo se mide | Objetivo |
|---|---|---|
| Fidelidad del estado | Una vez al día, a una hora fija, se pregunta a cada miembro: "¿Lo que dice FlowSync de tus tareas en curso es correcto ahora mismo?" (sí/no) | ≥ 90 % de respuestas "sí" en la semana [SUPUESTO] |
| Uso activo | Miembros que crean o cambian al menos una tarea cada día laborable, según una consulta directa de los datos | Todos los miembros en ≥ 4 de 5 días laborables [SUPUESTO] |
| Trabajo duplicado | Casos en que dos personas trabajaron en lo mismo sin saberlo, declarados en la retro de fin de semana | 0 en la semana de prueba (referencia: 1 caso que costó dos días) |
| Preguntas "¿en qué estás?" fuera de la daily | Recuento que cada miembro declara al final de la semana | Menos que en la semana anterior a la prueba [SUPUESTO: no hay datos previos, hay que tomar la referencia antes de empezar] |

**Condición de validez:** durante la prueba nadie actualiza el gestor de tareas anterior. Si alguien lo hace, la prueba no vale y hay que repetirla, sea cual sea el resultado.
