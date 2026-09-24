# FlowSync — Alcance del MVP

> Alcance consensuado y base del PRD. Documento de producto: no fija modelo de datos, esquema, estados internos, endpoints ni latencias; eso se decide más adelante.
>
> Punto de partida técnico: el repo ya tiene registro, login y perfil de usuario. Las tareas todavía no existen.

## 1. Problema

En un equipo remoto pequeño, saber en qué está cada uno exige interrumpir a alguien: la ronda de «¿en qué estás?» de la daily (hoy se come la mitad de sus 15 minutos) o la pregunta por Slack/chat. Nadie ve el estado del equipo sin preguntar.

Cuando nadie pregunta, el trabajo colisiona. Episodio de referencia: dos personas tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Dos días perdidos.

Lo que **no** es el problema: la parte de bloqueos de la daily. Esa sigue existiendo y este MVP no la resuelve.

## 2. Usuarios

- Equipos remotos pequeños, de **3 a 10 personas**, repartidos en varios husos horarios.
- **Roles planos**: todos ven y editan lo mismo, sin jerarquía de permisos.
- El valor lo cobran **los pares**, no un lead: quien va a coger trabajo y necesita saber qué está libre, y quien deja de ser interrumpido para contar cómo va. No hay reporte hacia arriba; a un manager le daría igual.

Usuario de referencia: equipo de 6 personas de un producto SaaS, en 3 husos horarios, con un gestor de tareas pesado y una daily de 15 minutos por videollamada. **Es un caso de estudio, no un cliente real**: nada de este alcance está validado con usuarios.

No es nuestro usuario un equipo que necesite sprints, estimaciones, épicas, backlog priorizado o informes.

## 3. Propuesta de valor

Una lista de tareas compartida que es, a la vez, **la cola de trabajo de cada persona**. Marcar en qué estás cuesta dos clics sobre una lista que ya tienes abierta, sin campos obligatorios, y de un vistazo se ve qué está libre y qué ya tiene alguien.

**Eliges qué coger sin preguntar a nadie, y a ti dejan de preguntarte.**

- Decisión que cambia: no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre.
- Por qué se sostiene: quien actualiza cobra en el momento (es su cola de trabajo y deja de recibir interrupciones). El estado se mantiene al día porque actualizar es barato, no porque se obligue a nadie.
- Condición para que funcione: el hábito «primero me la asigno, luego trabajo». Si la tarea no existe cuando alguien empieza, la colisión se repite.
- Éxito: tras **una semana de uso real**, el equipo cancela la ronda de «¿en qué estás?» y nadie pide que vuelva. Si la siguen haciendo igual, no funcionó. Señal temprana de fallo: alguien pregunta por chat por una tarea que ya está en la lista.

## 4. Alcance (IN)

Una sola capability, terminada de punta a punta, sobre la autenticación existente:

1. **Lista de tareas compartida**: un único espacio, visible y editable por cualquier usuario autenticado.
2. **Crear una tarea escribiendo solo el título.** Nada más es obligatorio.
3. **Asignar responsable** (a uno mismo o a otra persona) desde la propia lista.
4. **Cambiar el estado en dos clics** desde la lista, sin formularios. Para el usuario, el estado debe distinguir al menos si una tarea está *libre*, *la tiene alguien* o está *terminada*.
5. **Filtrar por estado**, para centrarse en lo pendiente o en lo libre.
6. **Datos al día al abrir o recargar la lista.**

Criterio de «completo»: una persona entra, ve qué está libre, se lo asigna, y el resto del equipo lo ve la siguiente vez que abre la lista.

## 5. NO-alcance (OUT)

### Recortes deliberados del MVP

| Excluido | Por qué |
|---|---|
| Cambios en vivo sin recargar | La decisión «¿cojo esto?» se toma al abrir la lista; con datos al día al cargar basta. El push solo aporta si antes se demuestra que la gente mantiene el estado al día (riesgo #1). Es lo primero que entra si la hipótesis se sostiene. |
| Fecha de vencimiento | No sirve a ninguna de las dos decisiones del producto ni quita la ronda de «¿en qué estás?». Controlar plazos es terreno del gestor pesado, y cada campo extra es algo más que se queda viejo. |
| «Qué ha cambiado desde tu última visita» | Encaja con «vuelvo y veo qué se ha movido», pero es otra capability. Con 3 a 10 personas, la lista entera cabe en un vistazo. |
| Descripción, comentarios, adjuntos, etiquetas | Para saber quién está en qué basta con el título. Cada campo acerca la lista al gestor pesado que se sustituye. |
| Borrar tareas | Marcarla como *terminada* cubre el caso normal. Borrar trae confirmaciones y papelera sin validar nada. |
| Invitar o dar de alta usuarios desde la app | El registro ya existe; en un espacio único, «quien se registra, entra» basta. |
| Búsqueda y filtros extra (por responsable, texto…) | Con 3 a 10 personas, el filtro por estado y el vistazo bastan. |
| Móvil nativo, modo offline | El uso es «abro la lista al empezar o al volver de una reunión», en el mismo navegador donde se trabaja. |

### Fronteras de producto

| Excluido | Por qué |
|---|---|
| Varios equipos, entidad «equipo», gente en más de uno | El espacio único valida la hipótesis igual; los equipos multiplican permisos y casos borde. **Supuesto**: una instancia = un equipo. |
| Roles y permisos | Entre pares con roles planos, restringir es fricción sin beneficio. |
| Presencia, «quién está conectado», indicadores de actividad | Es vigilancia y se rechaza a propósito. El estado es de la tarea, no de la persona. |
| Notificaciones push, chat, videollamada, edición a la vez sobre lo mismo | La señal es un resumen que espera, no un aviso que interrumpe. Lo demás es otro producto. |
| Deducir el estado de Git/PRs, CI o calendario | Integraciones con OAuth de terceros: otro producto. El estado lo teclea la persona. |
| Importar o sincronizar con otros gestores | Convivir obliga a actualizar dos veces, y así muere esta categoría. FlowSync sustituye al gestor: crea las tareas, no lee las de otro sitio. |
| Sprints, estimaciones, épicas, backlog priorizado, informes | Es el «rollo» del que se huye. Un equipo que lo necesite no es nuestro usuario. |
| Gestión de bloqueos | La parte de bloqueos de la daily sigue existiendo. Prometer que desaparece sería venderlo de más. |

### Riesgos conocidos (se trasladan al PRD)

- **#1, que la información se quede vieja**, incluidas las tareas que nunca se crean. Es el riesgo principal a validar. La mitigación es que actualizar cueste dos clics, no obligar a nadie.
- **#2, que migrar sea caro**: tareas de solo título, responsable y estado pueden quedarse cortas para sustituir un gestor pesado.
- **#3, validación sin cliente real**: el criterio de éxito es un supuesto sobre un caso de estudio.
