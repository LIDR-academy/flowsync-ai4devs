# FlowSync — Alcance del MVP

> Alcance consensuado, cerrado el 2026-08-07. Es la base sobre la que se escribirá el PRD.
> Sustituye a cualquier versión previa discutida en conversación. Si algo no está aquí, no está acordado.

---

## 1. Problema

Saber en qué anda un compañero cuesta hoy una interrupción o una espera hasta la daily. La información existe —cada uno la tiene en la cabeza— pero no tiene dónde vivir.

El coste no es la ignorancia, son sus dos consecuencias:

- **Trabajo duplicado.** Dos personas empiezan sobre lo mismo porque ninguna sabía de la otra. Episodio de referencia: dos personas tocaron el mismo módulo la misma semana, dos días perdidos.
- **El impuesto de preguntar.** El «¿en qué estás?» constante por chat, y la ronda equivalente que hoy se come la mitad de los 15 minutos de la daily.

**Qué desaparece y qué no, sin venderlo de más:** desaparece la ronda de «¿en qué estás?». La daily **no** desaparece entera: la parte de bloqueos sigue viva y este MVP no la resuelve.

---

## 2. Usuarios

**Usuario primario:** la persona que hace el trabajo, dentro de un equipo remoto plano de 3–10 personas. Escribe y lee en la misma superficie. No reporta a nadie: el valor se cobra entre pares.

**Caso de estudio de referencia:** equipo de 6 personas de producto SaaS, repartido en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada.

> **No es un cliente real.** Es un caso de estudio. No hay daily que cancelar ni semana de uso que observar, y ninguna decisión de este documento debe presentarse como validada por uso real.

**No-usuarios, explícitamente:**

- El lead o manager que busca visibilidad hacia arriba. No hay reporte ascendente; diseñar para él nos haría perder al usuario primario.
- El equipo que necesita planificar —sprints, estimaciones, prioridades, informes—. Ese equipo tiene Jira y hace bien en tenerlo.

---

## 3. Propuesta de valor

**Ver en qué anda el equipo y qué hay libre, sin interrumpir a nadie.**

FlowSync es la respuesta permanentemente disponible a una pregunta concreta —*¿en qué está cada uno ahora mismo, y qué hay libre?*— legible **sin coste social**.

### El intercambio que lo sostiene

Actualizar cuesta dos clics sobre una lista que la persona ya está mirando por su propio interés: **esa lista es su cola de trabajo**, la que consulta para decidir qué coge. A cambio, deja de recibir interrupciones preguntándole cómo va.

De ahí el principio de diseño que no se negocia: **la superficie donde elijo mi siguiente tarea y la superficie donde cambio el estado son la misma.** En el momento en que actualizar deje de ser algo que hago *para mí* y pase a ser algo que hago *para que otros vean*, se convierte en reporte y el producto muere.

### Qué decisiones cambia

1. No empezar algo que otra persona ya está tocando.
2. Elegir lo siguiente sabiendo qué está libre.

Si la única respuesta fuera «sentirse informado», el producto no valdría lo que cuesta.

### Posicionamiento

Es **donde se hace el trabajo**, no donde se cuenta. Sustituye al gestor de tareas; no convive con él ni lee las tareas de otro sitio. Convivir exigiría doble actualización, que es como muere esta categoría.

### Cómo sabríamos que funciona

- **Criterio real:** a una semana de uso, el equipo cancela la ronda de «¿en qué estás?» de la daily y nadie pide que vuelva. Si la siguen haciendo igual, no funcionó.
- **Lo comprobable aquí, y es un proxy:** abrir FlowSync y responder *quién está en qué y qué hay libre* sin preguntar a nadie ni abrir otra cosa. Construir la vertical no equivale a validar la hipótesis.

### Riesgo asumido nº 1

Si la información se queda vieja, el producto pierde el sentido. La mitigación es que actualizar cueste dos clics, nunca obligar a nadie. Señal temprana de fallo: tareas que llevan días en el mismo estado.

### Riesgo asumido nº 2 — la fecha de vencimiento

Se incluye con la tensión reconocida por escrito, no resuelta. La fecha es de la misma familia que los sprints y las estimaciones que este alcance descarta: no dice en qué anda nadie, dice cuándo se comprometió alguien. Entre pares y sin lead, una tarea vencida no tiene consecuencia, así que es el campo que más fácilmente envejece antes que el estado y ensucia la lectura del tablero — el riesgo nº 1 aplicado a un campo concreto. Es además la rendija natural por la que puede volver la configuración.

Se mantiene por dos razones explícitas: es lo que el fundador pidió poder ver de un vistazo, y aporta la única regla de negocio no trivial del MVP. Las dos condiciones de la fila 9 del alcance —opcional de verdad y fuera de la vista principal— son la contención de este riesgo, no un detalle de diseño: si se relajan, la tensión deja de estar contenida.

---

## 4. Alcance (in)

La vertical, en una frase: **entro, veo en qué anda el equipo, cambio el estado de lo mío en un gesto, y otra persona lo ve sin preguntarme.**

Una capability terminada de punta a punta, no el andamiaje amplio de un producto.

| # | Incluido | Detalle |
|---|---|---|
| 1 | Espacio único compartido | Quien se registra queda dentro y ve lo mismo que todos |
| 2 | Crear una tarea en segundos | Título y responsable. Solo el título es obligatorio; el responsable por defecto es uno mismo, porque el momento típico de escritura es «voy a ponerme con esto» |
| 3 | Tres estados fijos | Pendiente · En curso · Hecho. No configurables. «En curso» es la única señal que el producto existe para transmitir |
| 4 | Cambiar el estado desde la lista | En un gesto, sin abrir nada, sin confirmar, sin campos obligatorios |
| 5 | La lista se mantiene fresca sola | Mientras está abierta, refleja los cambios del equipo sin refrescar ni preguntar. Es lo único que separa a FlowSync de un tablero compartido cualquiera |
| 6 | Filtro por estado | Para centrarse en lo pendiente. Única dimensión de filtrado |
| 7 | Editar y borrar cualquier tarea | Roles planos. Coger la tarea de otro es cambiarle el responsable: es una consecuencia del modelo, no una funcionalidad aparte |
| 8 | Las tareas hechas salen de la vista por defecto | Si se acumulan, el tablero deja de leerse de un vistazo y la señal se ahoga en histórico |
| 9 | Fecha de vencimiento, opcional | Permite ver de un vistazo qué se ha pasado de plazo. Incluida bajo dos condiciones que forman parte del acuerdo: **(a) opcional de verdad** — crear una tarea sin fecha es el camino por defecto, no un atajo; **(b) fuera de la vista principal** — se consulta y se fija al abrir la tarea, no compite con el estado en la lista. Regla de negocio asociada, la única no trivial del MVP: **una tarea solo está vencida si no está hecha** |

**Definición de «tiempo real» en este MVP:** ver los cambios de estado de las tareas sin refrescar ni preguntar. Es **frescura, no presencia**. No es chat, ni videollamada, ni colaboración simultánea sobre el mismo documento.

**Forma de la señal:** un resumen que espera, no un aviso que interrumpe. El caso de uso es «llego por la mañana o vuelvo de una reunión y veo el estado del equipo».

---

## 5. NO-alcance (out)

### 5.1 Exclusiones

| Excluido | Justificación |
|---|---|
| Sprints, estimaciones, épicas, backlog priorizado, prioridad | Es planificación, no awareness. No responde «¿en qué anda cada uno?» y es exactamente el rollo del que huimos |
| Informes y métricas | No hay lead que los lea. En cuanto existen, el tablero se lee como vigilancia y la gente escribe distinto |
| Notificaciones push, email o Slack | La señal espera, no interrumpe. Notificar reintroduce la interrupción que el producto existe para eliminar |
| Presencia, «quién está conectado», indicadores de actividad por persona | Rechazo deliberado: es vigilancia. El estado es de la **tarea**, no de la persona |
| Comentarios, hilos, adjuntos | Aquí no se conversa. El chat ya existe y FlowSync compite mal contra él |
| Integraciones Git / PR / CI / calendario | Otro producto: OAuth de terceros y mapeo de identidades. Además contradice que el estado lo teclee la persona que hace la tarea |
| Bloqueos y dependencias entre tareas | Es la otra mitad de la daily, la que sigue viva. Declarado, no resuelto |
| Entidad «equipo», multi-espacio, pertenencia a varios equipos | Con un solo espacio el producto ya es demostrable. Ver supuestos |
| Permisos, roles, jerarquía, invitaciones | Los permisos solo significan algo cuando hay jerarquía, y aquí no la hay |
| Subtareas y checklists | A esta escala, una tarea que necesita subtareas es una tarea mal partida |
| Etiquetas, áreas o proyectos | Serían la respuesta al riesgo de solapamiento por módulo, y aun así fuera: son el primer paso hacia la configuración |
| Búsqueda | La lista de un equipo de 6 cabe en una pantalla. Buscar resuelve un problema de escala que no tenemos |
| Histórico, auditoría, «qué ha cambiado desde que miraste» | Introduce el tiempo como segundo concepto. Las dos decisiones que el producto debe soportar las resuelve la foto actual, no el registro de lo ocurrido |
| Vista «lo mío» / filtro por responsable | Con 6 personas, encuentras tus tareas mirando. Una sola dimensión de filtro |
| Estados configurables | Configurar es el rollo |

### 5.2 Supuestos declarados, no construidos

Se documentan como límites conocidos del MVP. No son deuda oculta.

1. **Espacio único.** Quien se registra queda dentro. Razonable para un caso de estudio, insostenible en un producto real.
2. **Roles planos.** Todos ven y editan todo, incluidas las tareas de los demás.
3. **El estado lo teclea una persona.** No se deriva de ninguna señal externa.
4. **Un solo equipo.** Varios equipos separados, o gente en más de uno, queda fuera.

### 5.3 Limitación conocida frente al caso fundacional

El episodio que motiva el producto es un solapamiento a nivel de **módulo**, pero el MVP solo modela **tareas**. Evitará la colisión únicamente si los títulos son reconocibles para un compañero: «Refactor de checkout» y «Arreglar bug de pagos» pueden ser lo mismo y leerse distinto.

Es una apuesta por la convención del equipo, no por el producto. La alternativa —etiquetas o áreas— queda fuera por ser el primer paso hacia la configuración. Es el punto donde el MVP puede no resolver su propio caso fundacional, y se asume conscientemente.

---

## Estado del repositorio en el momento de cerrar este alcance

Existe únicamente la capability de **autenticación** (signup, login, perfil, logout), completa de punta a punta en backend y frontend. El dominio de tareas es greenfield: no hay ninguna entidad de negocio más allá del usuario.
