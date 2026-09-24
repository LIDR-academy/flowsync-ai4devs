# FlowSync — Alcance del MVP

> Alcance consensuado, base para el PRD. Nivel producto: el modelo de datos, los endpoints, los nombres internos y la técnica de sincronización se deciden en la spec de implementación.
>
> Punto de partida del repo: existen registro, login, perfil (solo lectura) y logout. No existen equipos ni tareas.

## 1. Problema

En equipos remotos pequeños, saber en qué está cada uno exige interrumpir a alguien: la ronda de "¿en qué estás?" de la daily (la mitad de sus 15 minutos) o preguntar por chat. Nadie ve el estado del equipo sin preguntar. Cuando nadie pregunta, dos personas acaban trabajando en lo mismo.

- **Caso real:** dos personas tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Se perdieron dos días.
- **Qué desaparece y qué no:** la daily no desaparece entera. Desaparece la ronda de "¿en qué estás?". La parte de bloqueos sigue y este MVP no la resuelve.

## 2. Usuarios

- **Usuario:** los compañeros de un equipo remoto de 3 a 10 personas, con roles planos. El valor lo reciben ellos: quien descubre tarde que iba a lo mismo que otro y quien interrumpe para preguntar. No hay un lead ni un reporte hacia arriba; a un manager le da igual.
- **Caso de estudio (no es un cliente real):** equipo de 6 personas de producto SaaS, repartidas en 3 husos horarios, con un gestor de tareas pesado y una daily de 15 minutos por videollamada.
- **Supuestos declarados:**
  - El caso de estudio es un solo equipo, así que la posibilidad de tener varios equipos no se valida en la prueba.
  - Durante la prueba, FlowSync es la única fuente del trabajo en curso. Si el equipo sigue usando el gestor anterior en paralelo, el resultado no vale.
  - Los títulos de las tareas son lo bastante descriptivos para que se vea cuándo dos se solapan. FlowSync reduce los solapes, no los detecta.

## 3. Propuesta de valor

Una lista de tareas del equipo donde se ve quién está en qué sin preguntar a nadie.

- **Por qué se mantiene al día:** actualizar tu tarea cuesta dos clics sobre una lista que ya tienes abierta, sin campos de más, sprints ni estimaciones. Y quien escribe se beneficia en el momento: esa lista es su cola de trabajo y deja de recibir interrupciones.
- **Qué decisión cambia:** no empezar algo que otra persona ya está haciendo (en curso) y elegir lo siguiente sabiendo qué no ha empezado nadie (pendiente).
- **Qué tipo de señal da:** un resumen que espera, no un aviso que interrumpe. Muestra la frescura de la tarea, no la presencia de la persona.
- **Dónde se hace el trabajo:** FlowSync sustituye al gestor de tareas, no convive con él.
- **Riesgo n.º 1:** que la información se quede vieja. Si pasa, el producto no tiene sentido. La mitigación es que actualizar cueste menos que la interrupción que evita, no obligar a nadie.
- **Criterio de éxito:** tras una semana de uso real, el equipo cancela la ronda de "¿en qué estás?" y nadie pide recuperarla. Si la siguen haciendo igual, no ha funcionado.

## 4. Alcance (IN)

Una vertical fina y usable de principio a fin, con dos funcionalidades.

### Equipos (versión mínima)
- Cualquier usuario registrado puede crear un equipo.
- Quien lo crea añade miembros por su email. La persona añadida ya tiene que tener cuenta.
- Una persona puede estar en varios equipos y cambiar de uno a otro. Se ve un equipo cada vez.
- Las tareas de un equipo solo las ven sus miembros. Dentro del equipo todos ven y editan todo.

### Tareas del equipo
- Una tarea tiene título (obligatorio), responsable (obligatorio y miembro del equipo), estado y fecha de vencimiento (opcional).
- Tres estados fijos y no configurables: **pendiente**, **en curso** y **hecho**. Una tarea nueva nace como pendiente.
- Se puede editar el título, cambiar el estado, reasignar y poner o quitar la fecha.
- Una tarea está **vencida** si tiene fecha, esa fecha ya pasó y no está hecha. Sin fecha, nunca está vencida. Las vencidas se marcan de forma visible en la lista.
- La lista del equipo se puede filtrar por estado.
- Los cambios de los demás aparecen solos en menos de 10 segundos, sin refrescar.

### Calidad
- Cada funcionalidad llega con tests. Forma parte de "hecho", no es un extra.

## 5. NO-alcance (OUT)

| Fuera | Por qué |
|---|---|
| Invitación por enlace y alta de gente sin cuenta | Al equipo de la prueba le basta con registrarse antes. El enlace añade gestión de invitaciones y un flujo de "registrarse y entrar" que no valida nada de la hipótesis. |
| Salir de un equipo y expulsar a miembros | En una prueba de una semana con un equipo estable no pasa. Además obliga a decidir qué hacer con las tareas del que se va. Si surge, se arregla a mano. |
| Renombrar o borrar equipos y traspasar el rol de creador | No afecta a si la ronda de "¿en qué estás?" desaparece. Es mantenimiento de la herramienta, no el problema. |
| Roles y permisos dentro de un equipo | Roles planos por decisión de producto: el valor lo reciben los pares y no hay jerarquía que proteger. |
| Borrar tareas | Si una tarea sobra se marca como hecha y el filtro la esconde. Un error en el título se corrige editándolo. Borrar introduce preguntas (¿quién puede?, ¿se puede deshacer?) que el MVP no necesita responder. |
| Tareas sin responsable | Una tarea sin responsable no cumple el propósito de saber quién está en qué. |
| Estado "bloqueado" y seguimiento de bloqueos | Es la mitad de la daily que declaramos no resuelta. Meterlo a medias prometería algo que no cumplimos. |
| Estados configurables | Es la configuración tipo Jira que rechazamos. Tres estados fijos bastan para "quién está en qué". |
| Filtrar por responsable ("mis tareas"), buscar, ordenar | Con 6 personas la lista cabe en una pantalla. Sobra filtrar por estado hasta que el volumen demuestre lo contrario. |
| Sincronización instantánea | Menos de 10 segundos cubre el caso de uso: mirar qué se ha movido, no colaborar a la vez. Lo instantáneo cuesta mucho más y no cambia ninguna decisión. |
| Resaltar "qué cambió desde mi última visita" | Encaja con los 3 husos horarios, pero es un segundo paso: primero hay que validar que el estado se mantiene al día. Es el primer candidato después del MVP. |
| Notificaciones (push, email, digest) | La señal es un resumen que espera, no un aviso que interrumpe. Notificar recrearía la interrupción que queremos quitar. |
| Presencia o "quién está conectado" | Es vigilancia. El estado es de la tarea, no de la persona. Rechazado a propósito, no aplazado. |
| Chat, comentarios y descripción larga de la tarea | La tarea es "quién está en qué", no un sitio para discutir. El chat ya existe fuera, y los comentarios convierten FlowSync en otro gestor pesado. |
| Integraciones (Git, PRs, CI, calendario) | Derivar el estado de fuera es otro producto, con OAuth de terceros. La hipótesis es que teclearlo cuesta segundos. |
| Importar desde otro gestor | FlowSync sustituye al gestor, no convive con él. Importar invita a la doble actualización, que es como muere esta categoría. |
| Sprints, estimaciones, épicas, backlog priorizado, prioridades | Renuncia explícita: un equipo que necesita eso no es nuestro usuario. |
| Informes y métricas | No hay nadie hacia arriba que los consuma. El valor lo reciben los pares. |
| Vista de tareas de todos mis equipos | El caso de estudio es un solo equipo. Cambiar de equipo cubre a quien está en varios. |
| Editar el perfil, recuperar la contraseña, verificar el email | No son parte del problema. La autenticación actual basta para la prueba. |
| Aplicación móvil y modo offline | Se consulta al empezar el día o al volver de una reunión, delante del ordenador. |
