# Alcance del MVP: FlowSync

> Estado: alcance consensuado, base para el PRD (aún no hay PRD)
> Fecha: 2026-09-24

FlowSync es una herramienta de tareas compartidas para equipos remotos pequeños. Este documento fija qué problema resuelve el MVP, para quién, qué incluye y qué deja fuera. Los puntos marcados `(por confirmar)` no están decididos.

## 1. Problema

En equipos remotos pequeños, nadie puede ver en qué trabaja cada persona sin interrumpir a alguien. Hoy eso se resuelve con una reunión diaria de sincronización (daily, 15 minutos por videollamada) y con preguntas constantes del tipo «¿en qué estás?» por Slack o chat. La ronda de «¿en qué estás?» se lleva aproximadamente la mitad de la daily.

El coste es doble: interrupciones continuas y trabajo duplicado. Caso concreto que motiva el producto: dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera, y se perdieron dos días. El problema afecta sobre todo a los pares que trabajan en paralelo, no a quien coordina: no hay necesidad de reportar hacia arriba.

## 2. Usuarios

- **Usuario principal:** integrantes de equipos remotos de 3 a 10 personas, con roles planos (todos ven y editan lo mismo). Necesitan saber, sin preguntar, qué se ha movido y qué está libre antes de elegir su siguiente trabajo.
- **Primer usuario concreto (caso de estudio, no un cliente real):** un equipo de 6 personas de un producto SaaS repartido en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos. El éxito medido con este equipo es simulado y debe presentarse así.
- **Usuarios secundarios:** ninguno en este MVP.
- **Quién NO es el usuario:** managers que quieren informes hacia arriba; equipos que necesitan sprints, estimaciones, épicas o backlog priorizado; personas que pertenecen a varios equipos a la vez.

## 3. Propuesta de valor

Para equipos remotos pequeños, FlowSync es la lista de tareas donde se hace el trabajo y donde cualquiera ve de un vistazo qué se ha movido y qué está libre, sin preguntar a nadie ni hacer una ronda de sincronización.

- **Actualizar cuesta segundos:** cambiar el estado son dos clics sobre la lista ya abierta, sin campos obligatorios ni decisiones de sprint o estimación.
- **Quien escribe cobra en el momento:** la misma lista es su cola de trabajo y, al mantenerla al día, deja de recibir interrupciones preguntándole cómo va.
- **Señal que espera, no que interrumpe:** el estado se consulta al llegar por la mañana o al volver de una reunión, sin notificaciones push.
- **El estado es de la tarea, no de la persona:** no hay presencia ni indicadores de actividad, porque eso sería vigilancia y se rechaza a propósito.

## 4. Alcance

Lo que el MVP sí incluye:

- Un único espacio compartido para todo el equipo, sin entidad «equipo» propia.
- Crear una tarea con título, responsable, estado y fecha de vencimiento; solo el título es obligatorio.
- Dejar una tarea sin responsable, para poder ver qué está libre.
- Cambiar el estado de una tarea en dos clics desde la lista.
- Filtrar la lista por estado para centrarse en lo pendiente.
- Ver de forma destacada las tareas que han pasado su fecha de vencimiento.
- Ver los cambios hechos por otras personas sin refrescar la página ni preguntar. «Tiempo real» significa solo esto; no es chat, videollamada ni edición simultánea de un documento.
- Ver qué tareas han cambiado desde la última vez que la persona miró la lista `(por confirmar: propuesto como pieza central del MVP, por encima de la actualización automática, dado que el equipo objetivo está en 3 husos horarios y rara vez coincide conectado)`.

Sobre lo que ya existe: el registro, el inicio de sesión y el perfil están implementados y se reutilizan tal cual. Las tareas aún no existen.

Supuesto de acceso: para el caso de estudio, la instalación es de un único equipo. Hoy el registro es abierto, así que cualquiera que se registre vería todas las tareas; esto es aceptable solo mientras sea un caso de estudio `(por confirmar)`.

Criterio de éxito del MVP: tras una semana de uso real, el equipo cancela la ronda de «¿en qué estás?» de la daily y nadie pide que vuelva. Si la siguen haciendo igual, no funcionó. Como medida complementaria, que la gente mire la lista antes de empezar algo nuevo `(por confirmar)`.

Riesgo principal a validar: que la información se quede vieja. Si el estado no refleja la realidad, el producto pierde su sentido. La mitigación elegida es que actualizar cueste dos clics, no obligar a nadie.

## 5. NO-alcance

Lo que el MVP deliberadamente deja fuera:

- **Varios equipos, o personas en más de uno:** se anota como supuesto, no se construye.
- **Presencia o actividad de las personas** («quién está conectado»): es vigilancia y se rechaza a propósito.
- **Notificaciones push:** la señal es un resumen que espera, no un aviso que interrumpe.
- **Chat, videollamada y edición simultánea de un documento:** «tiempo real» se limita a ver cambios de estado de tareas.
- **Derivar el estado de fuentes externas** (Git, pull requests, CI, calendario): es otro producto, con integraciones y acceso de terceros.
- **Convivir o sincronizarse con otro gestor de tareas:** FlowSync crea sus propias tareas y sustituye al gestor actual; convivir exigiría actualizar en dos sitios, que es lo que hace morir a esta categoría de herramientas.
- **Sprints, estimaciones, épicas, backlog priorizado e informes:** un equipo que los necesite no es el usuario.
- **Jerarquía de permisos y roles:** en el MVP todos ven y editan lo mismo.
- **Resolver los bloqueos:** la parte de bloqueos de la daily sigue existiendo; este MVP solo elimina la ronda de «¿en qué estás?».
