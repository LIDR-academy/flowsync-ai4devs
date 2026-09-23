# PRD — FlowSync MVP

> **Estado:** borrador para construir · **Fecha:** 2026-08-07
> **Base de alcance:** [alcance-mvp.md](./alcance-mvp.md). Ese documento manda: si este PRD y el alcance se contradicen, gana el alcance.
> **Nota de documento:** aquí no hay diseño técnico. Ni modelo de datos, ni arquitectura, ni endpoints. Solo qué debe hacer el producto y cómo se comprueba.

---

## 1. Problema y contexto

En un equipo remoto, saber en qué anda un compañero cuesta hoy una de dos cosas: **interrumpirle** o **esperar a la daily**. La información existe —cada persona la tiene en la cabeza— pero no tiene ningún sitio donde vivir de forma consultable.

El coste no es la ignorancia en sí, sino sus dos consecuencias:

- **Trabajo duplicado.** Dos personas arrancan sobre lo mismo porque ninguna sabía de la otra. Episodio de referencia del equipo: dos personas tocaron el mismo módulo la misma semana y se perdieron dos días.
- **El impuesto de preguntar.** El «¿en qué estás?» constante por chat, más la ronda equivalente que hoy consume la mitad de los 15 minutos de la daily.

**Qué cambia y qué no.** Desaparece la ronda de «¿en qué estás?». La daily **no** desaparece entera: la parte de bloqueos sigue viva y este MVP no la resuelve ni lo pretende.

**Contexto de partida.** Hoy FlowSync solo sabe hacer una cosa: dar de alta a una persona y dejarla entrar. No existe todavía ninguna noción de tarea, de estado ni de trabajo compartido; todo eso está por construir.

**Contexto de validación.** El equipo de referencia es un **caso de estudio, no un cliente real**. No hay una daily real que cancelar ni una semana de uso que observar. Ninguna afirmación de este PRD debe presentarse como validada por uso real.

---

## 2. Usuarios y jobs-to-be-done

### Usuario primario

La persona que hace el trabajo, dentro de un equipo remoto **plano de 3 a 10 personas**. Escribe y lee en la misma superficie, y no reporta a nadie: el valor se cobra entre pares.

**Perfil de referencia:** equipo de 6 personas de producto SaaS, repartido en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada.

### Jobs-to-be-done

| # | Job | Situación | Resultado esperado |
|---|---|---|---|
| JTBD-1 | **Saber en qué anda el equipo sin molestar a nadie** | Llego por la mañana, o vuelvo de una reunión larga | Veo quién está en qué sin escribir a nadie ni esperar a la daily |
| JTBD-2 | **No empezar algo que otra persona ya está tocando** | Voy a arrancar una tarea nueva | Compruebo antes si ya hay alguien encima |
| JTBD-3 | **Elegir lo siguiente sabiendo qué está libre** | Acabo de cerrar algo y necesito lo próximo | Veo qué hay pendiente y sin responsable claro |
| JTBD-4 | **Dejar constancia de en qué estoy sin que me cueste nada** | Me pongo con algo, o lo termino | Lo registro en un gesto sobre una lista que ya tengo abierta |
| JTBD-5 | **Dejar de recibir preguntas sobre cómo voy** | Estoy concentrado en una tarea | Mi estado está publicado, así que nadie necesita preguntarme |

JTBD-4 y JTBD-5 son la contrapartida que sostiene todo lo demás: quien escribe cobra en el momento, no solo los que leen.

### No-usuarios, explícitamente

- **El lead o manager que busca visibilidad hacia arriba.** No hay reporte ascendente. Diseñar para él haría que el usuario primario escribiese distinto, y perderíamos a los dos.
- **El equipo que necesita planificar** (sprints, estimaciones, prioridades, informes). Ese equipo tiene Jira y hace bien en tenerlo.

---

## 3. Propuesta de valor

> **Ver en qué anda el equipo y qué hay libre, sin interrumpir a nadie.**

FlowSync es la respuesta permanentemente disponible a una pregunta concreta —*¿en qué está cada uno ahora mismo, y qué hay libre?*— legible **sin coste social**.

### El intercambio que lo sostiene

Actualizar cuesta dos clics sobre una lista que la persona **ya está mirando por su propio interés**: esa lista es su cola de trabajo, la que consulta para decidir qué coge. A cambio, deja de recibir interrupciones preguntándole cómo va.

De ahí el principio de diseño que no se negocia:

> **La superficie donde elijo mi siguiente tarea y la superficie donde cambio el estado son la misma.**

En el momento en que actualizar deje de ser algo que hago *para mí* y pase a ser algo que hago *para que otros vean*, se convierte en reporte, y el reporte se abandona en tres semanas.

### Posicionamiento

Es **donde se hace el trabajo**, no donde se cuenta. Sustituye al gestor de tareas: FlowSync crea las tareas, no las lee de ningún otro sitio. Convivir con otro gestor exigiría doble actualización, que es como muere esta categoría de producto.

### Qué es «tiempo real» aquí

Ver los cambios de estado **sin refrescar ni preguntar**. Es **frescura, no presencia**: el estado es de la **tarea**, nunca de la persona. No hay chat, ni videollamada, ni edición simultánea, ni indicadores de quién está conectado. La señal es un resumen que espera, no un aviso que interrumpe.

---

## 4. Alcance / Fuera de alcance

### 4.1 Dentro (la vertical)

**Entro, veo en qué anda el equipo, cambio el estado de lo mío en un gesto, y otra persona lo ve sin preguntarme.**

Una capability terminada de punta a punta, no el andamiaje amplio de un producto. Prevalece una vertical fina y usable sobre tres a medias.

1. Espacio único compartido: quien se registra queda dentro y ve lo mismo que todos.
2. Crear una tarea en segundos, con solo el título como campo obligatorio.
3. Tres estados fijos y no configurables: **Pendiente · En curso · Hecho**.
4. Cambiar el estado desde la propia lista, en un gesto.
5. La lista se mantiene fresca sola mientras está abierta.
6. Filtro por estado, única dimensión de filtrado.
7. Editar, reasignar y borrar cualquier tarea (roles planos).
8. Las tareas hechas salen de la vista por defecto.
9. Fecha de vencimiento **opcional**, fuera de la vista principal.

### 4.2 Fuera, y por qué

| Excluido | Motivo |
|---|---|
| Sprints, estimaciones, épicas, backlog priorizado, prioridad | Es planificación, no awareness. Es el rollo del que huimos |
| Informes y métricas dentro del producto | No hay lead que los lea, y en cuanto existen el tablero se lee como vigilancia |
| Notificaciones push, email o Slack | La señal espera, no interrumpe. Notificar reintroduce el problema original |
| Presencia, «quién está conectado», actividad por persona | Rechazo deliberado: es vigilancia |
| Comentarios, hilos, adjuntos | Aquí no se conversa; el chat ya existe |
| Integraciones Git / PR / CI / calendario | Otro producto. Contradice que el estado lo teclee la persona |
| Bloqueos y dependencias entre tareas | Es la otra mitad de la daily. Declarado, no resuelto |
| Entidad «equipo», multi-espacio, pertenencia múltiple | Con un solo espacio el producto ya es demostrable |
| Permisos, roles, jerarquía, invitaciones | Los permisos solo significan algo con jerarquía, y no la hay |
| Subtareas y checklists | A esta escala, una tarea que las necesita está mal partida |
| Etiquetas, áreas o proyectos | Primer paso hacia la configuración |
| Búsqueda | La lista de 6 personas cabe en una pantalla |
| Histórico, auditoría, «qué ha cambiado desde que miraste» | Introduce el tiempo como segundo concepto |
| Vista «lo mío» / filtro por responsable | Con 6 personas encuentras tus tareas mirando |
| Estados configurables | Configurar es el rollo |

### 4.3 Supuestos declarados, no construidos

No son deuda oculta: son límites conocidos y aceptados.

1. **Espacio único.** Quien se registra queda dentro. Razonable para un caso de estudio, insostenible en producto real.
2. **Roles planos.** Todos ven y editan todo, incluidas las tareas ajenas.
3. **El estado lo teclea una persona.** No se deriva de ninguna señal externa.
4. **Un solo equipo.** Varios equipos, o gente en más de uno, queda fuera.

### 4.4 Limitación conocida frente al caso fundacional

El episodio que motiva el producto es un solapamiento a nivel de **módulo**, pero el MVP solo modela **tareas**. Evitará la colisión únicamente si los títulos resultan reconocibles para un compañero: «Refactor de checkout» y «Arreglar bug de pagos» pueden ser lo mismo y leerse distinto. Es una apuesta por la convención del equipo, no por el producto, y se asume conscientemente.

---

## 5. Épicas del MVP

| Épica | Qué agrupa |
|---|---|
| **E1 · Cuentas y acceso** | Registro, inicio y cierre de sesión, y protección del espacio compartido frente a visitantes sin sesión. |
| **E2 · Gestión de tareas** | Crear, editar, reasignar, borrar y cambiar de estado una tarea, incluidas la fecha de vencimiento opcional con su regla de vencimiento, y el filtrado de la lista por estado. |
| **E3 · Actividad del equipo** | La lista compartida que responde «quién está en qué», con actualización automática sin refrescar y sin señales de presencia. |

---

## 6. Requisitos funcionales

Nivel producto: qué debe hacer el sistema y cómo se comprueba. Cada requisito lleva su criterio de aceptación.

### E1 · Cuentas y acceso

Esta épica **ya está implementada de punta a punta** en el repositorio. Se enuncia igualmente porque forma parte del producto y porque los criterios de aceptación deben verificarse antes de dar el MVP por cerrado.

**RF-1 — Registro.** Una persona debe poder crear una cuenta con nombre, email y contraseña, y quedar automáticamente dentro del espacio compartido.
*Aceptación:* tras registrarse queda con sesión iniciada y ve el espacio sin ningún paso adicional de invitación o alta en un equipo.

**RF-2 — Inicio y cierre de sesión.** Debe poder iniciar sesión con sus credenciales y cerrarla explícitamente.
*Aceptación:* con credenciales incorrectas se muestra un error comprensible y no se accede; tras cerrar sesión, volver atrás en el navegador no devuelve el contenido del espacio.

**RF-3 — Persistencia de sesión.** La sesión debe sobrevivir a una recarga de página y al cierre de la pestaña.
*Aceptación:* recargar no obliga a volver a introducir credenciales.

**RF-4 — Protección del espacio.** Sin sesión iniciada no debe ser posible ver ni modificar ninguna tarea.
*Aceptación:* acceder a cualquier vista del espacio sin sesión redirige a inicio de sesión; ninguna tarea es visible en ese estado.

### E2 · Gestión de tareas

**RF-5 — Crear una tarea con un solo campo.** El sistema debe permitir crear una tarea indicando únicamente un título.
*Aceptación:* con el título relleno y ningún otro campo tocado, la tarea se crea, queda asignada a quien la crea y en estado «Pendiente». No se solicita ni sugiere ningún otro dato.

**RF-6 — Título obligatorio.** El título es lo único que una tarea necesita para existir, y debe dar de sí lo suficiente para que un compañero reconozca de qué trabajo se habla.
*Aceptación:* intentar crear una tarea sin título, o solo con espacios, se rechaza con un mensaje comprensible junto al campo. El título admite con holgura una frase descriptiva completa; ante uno desmedido el sistema avisa, en lugar de recortarlo en silencio [SUPUESTO].

**RF-7 — Responsable por defecto.** Al crear una tarea, el responsable por defecto es quien la crea.
*Aceptación:* una tarea recién creada aparece con el nombre de su autor como responsable, sin haberlo seleccionado.

**RF-8 — Tres estados fijos.** Una tarea está siempre en exactamente uno de tres estados: Pendiente, En curso o Hecho. No se pueden añadir, renombrar ni eliminar estados.
*Aceptación:* no existe en el producto ninguna vía para crear o configurar estados.

**RF-9 — Cambiar el estado desde la lista.** El sistema debe permitir cambiar el estado de cualquier tarea desde la propia lista, sin abrir la tarea, sin diálogo de confirmación y sin rellenar ningún campo.
*Aceptación:* el cambio se completa en **2 interacciones o menos** desde la lista visible, y el nuevo estado se refleja en la vista inmediatamente.

**RF-10 — Reasignar responsable.** Debe poder cambiarse el responsable de cualquier tarea a cualquier persona registrada, incluida una tarea creada por otro.
*Aceptación:* una persona puede asignarse una tarea ajena sin ningún permiso especial ni advertencia.

**RF-11 — Editar una tarea.** Debe poder modificarse el título de cualquier tarea, propia o ajena.
*Aceptación:* el cambio queda reflejado para todos los miembros del espacio.

**RF-12 — Borrar una tarea.** Debe poder borrarse cualquier tarea, propia o ajena.
*Aceptación:* la acción pide confirmación explícita, ya que no hay histórico ni papelera y la pérdida es irreversible; tras confirmar, la tarea desaparece para todos.

**RF-13 — Fecha de vencimiento opcional.** Una tarea puede tener una fecha de vencimiento, y crearla **sin** fecha debe ser el camino por defecto.
*Aceptación:* el flujo de creación no contiene el campo fecha ni lo sugiere; la fecha se consulta y se establece únicamente al abrir la tarea; una tarea sin fecha es un estado normal y no genera aviso ni marca de ningún tipo.

**RF-14 — Regla de vencimiento.** Una tarea está vencida **si y solo si** tiene fecha de vencimiento anterior al día actual **y** su estado no es «Hecho».
*Aceptación:* pasar una tarea vencida a «Hecho» deja de marcarla como vencida sin tocar la fecha; una tarea sin fecha nunca está vencida; una tarea con fecha futura nunca está vencida. «Anterior al día actual» significa el día de quien está mirando [SUPUESTO]: con el equipo de referencia repartido en 3 husos, dos personas pueden ver la misma tarea de forma distinta durante unas horas, y se acepta.

**RF-15 — Visibilidad del vencimiento.** El estado de vencimiento debe ser visible al abrir la tarea, y no en la vista principal de la lista.
*Aceptación:* la lista no muestra fechas ni marcas de vencimiento; al abrir una tarea vencida, su condición de vencida es evidente sin cálculo mental.

**RF-20 — Filtrar por estado.** Debe poder filtrarse la lista por estado, para centrarse en lo pendiente.
*Aceptación:* el filtro es la única dimensión de filtrado disponible; no existe filtro por responsable.

**RF-21 — Las tareas hechas no ocupan la vista.** Por defecto, las tareas en estado «Hecho» no aparecen en la lista, pero deben seguir siendo consultables.
*Aceptación:* al marcar una tarea como hecha, desaparece de la vista por defecto; sigue siendo accesible mediante el filtro por estado.

### E3 · Actividad del equipo

**RF-16 — Lista compartida única.** Debe existir una sola lista con todas las tareas del espacio, idéntica para todos.
*Aceptación:* dos personas distintas ven el mismo conjunto de tareas; no hay vistas privadas ni contenido oculto por usuario.

**RF-17 — Responder «quién está en qué» de un vistazo.** Cada tarea de la lista debe mostrar, sin abrirla, su título, su responsable y su estado.
*Aceptación:* alguien que abre la aplicación puede enumerar en qué está trabajando cada miembro sin hacer clic en ninguna tarea.

**RF-18 — La lista se mantiene fresca sola.** Con la lista abierta, los cambios hechos por otras personas deben aparecer sin que el usuario refresque ni realice ninguna acción.
*Aceptación:* con dos personas mirando la lista, un cambio de estado hecho por una es visible para la otra sin que esta haga nada. Este es el requisito que distingue a FlowSync de un tablero compartido cualquiera; si se cae, el producto pierde su razón de ser.

**RF-19 — Actualizar sin interrumpir.** La actualización automática no debe robar el foco, mover el scroll, cerrar lo que el usuario tenga abierto ni descartar texto a medio escribir.
*Aceptación:* con un formulario a medio rellenar o una tarea abierta, la llegada de un cambio ajeno no altera lo que el usuario está haciendo.

**RF-22 — Sin señales de presencia.** El producto no debe mostrar en ningún punto quién está conectado, quién está mirando, ni actividad atribuida a una persona al margen de sus tareas.
*Aceptación:* no existe ningún indicador de conexión, «última vez visto» ni similar en ninguna vista. Requisito negativo deliberado: forma parte de la identidad del producto.

**RF-23 — Estado vacío con salida.** Con el espacio sin tareas, la lista debe explicar qué es y ofrecer crear la primera.
*Aceptación:* una persona recién registrada puede crear su primera tarea desde la lista vacía sin buscar dónde.

---

## 7. Requisitos no funcionales

**RNF-1 — Coste de actualizar.** Cambiar el estado de una tarea desde la lista debe requerir **2 interacciones o menos** y **0 campos obligatorios**. Es la métrica de diseño que sostiene todo el producto, no una preferencia de UX.

**RNF-2 — Frescura.** Un cambio hecho por otra persona debe aparecer en una lista abierta en **menos de 5 segundos** [SUPUESTO]. Por debajo de ese umbral la promesa de «sin refrescar ni preguntar» se cumple; por encima, el usuario vuelve a dudar de lo que ve.

**RNF-3 — Respuesta percibida.** Las acciones propias (crear, cambiar estado, reasignar) deben reflejarse en la vista de quien las hace de forma inmediata, sin espera perceptible.

**RNF-4 — Degradación honesta.** Si la actualización automática deja de funcionar, la aplicación debe seguir siendo utilizable, indicar que los datos pueden no estar frescos y recuperarse sola al restablecerse. Una lista silenciosamente obsoleta es peor que ninguna lista: es exactamente el riesgo nº 1 del alcance.

**RNF-5 — Escala objetivo.** El producto debe comportarse sin degradación perceptible con **10 personas simultáneas y unas 200 tareas** [SUPUESTO], que es el techo del equipo de referencia. No se optimiza para más.

**RNF-6 — Accesibilidad.** Las acciones principales —crear tarea, cambiar estado, filtrar— deben ser operables por teclado, y el contraste cumplir WCAG AA [SUPUESTO].

**RNF-7 — Privacidad por diseño.** No se registra ni se expone actividad atribuible a una persona más allá de los cambios en las tareas. No hay analítica de comportamiento individual.

**RNF-8 — Idioma.** Toda la interfaz y los mensajes de error, en castellano, coherentes con lo ya existente.

**RNF-9 — Soporte de dispositivo.** Escritorio en primer lugar; uso razonable en tablet. La aplicación nativa móvil queda fuera [SUPUESTO].

**RNF-10 — Mensajes de error comprensibles.** Ningún error técnico crudo debe llegar al usuario: los fallos de validación se muestran junto a su campo y los de conexión explican qué hacer.

---

## 8. Restricciones

**R-1 — Tecnología ya elegida.** El producto se construye sobre AdonisJS 7 en el servidor y React 19 en la interfaz. Es una decisión tomada: este MVP no evalúa alternativas ni introduce piezas nuevas.

**R-2 — La autenticación ya existe.** Registro, inicio de sesión, perfil y cierre de sesión están implementados de punta a punta. **E1 es mayoritariamente verificación, no construcción**, y el esfuerzo del MVP se concentra en E2 y E3.

**R-3 — Sin dependencias de terceros.** El producto no delega nada fuera: ni identidad ajena («entrar con…»), ni correo, ni notificaciones, ni analítica externa. Todo lo que necesita para funcionar vive dentro de FlowSync.

**R-4 — Espacio único.** No existe el concepto de equipo. Cualquiera que se registre entra al mismo espacio. Es un supuesto aceptado, no un descuido.

**R-5 — Caso de estudio, no cliente.** No hay usuarios reales de los que obtener datos de uso. Las métricas de la sección 9 se observan manualmente o se dejan explícitamente sin medir.

**R-6 — Alcance por profundidad, no por amplitud.** Una capability terminada de punta a punta antes que tres a medias. Ante un recorte, se recorta amplitud.

**R-7 — Hoy no hay ninguna comprobación automática.** Ni un solo criterio de aceptación de este documento se verifica solo a día de hoy. Poder comprobarlos de forma automática, en lugar de a mano cada vez, exige montar antes esa base, y ese coste se cuenta dentro del MVP: no se da por hecho.

**R-8 — La interfaz existente marca el estilo.** FlowSync ya tiene un lenguaje visual propio en sus pantallas de acceso, y las nuevas se pliegan a él. Este MVP no abre un rediseño.

---

## 9. Métricas de éxito

**Nota previa, importante.** El alcance excluye deliberadamente informes y métricas dentro del producto: en cuanto el tablero mide personas, se lee como vigilancia y la gente escribe distinto. Por tanto **no se construye instrumentación**. Lo que sigue se observa manualmente o queda declarado como no medible.

### 9.1 Métrica primaria — no medible en este MVP

**El equipo elimina la ronda de «¿en qué estás?» de la daily y nadie pide que vuelva, tras una semana de uso.**

Es el único criterio que valida la hipótesis del producto, y **requiere un equipo real**. Con un caso de estudio no puede medirse. Construir la vertical no equivale a validarla, y el PRD no debe permitir esa confusión.

### 9.2 Proxy comprobable ahora

**P-1 — La pregunta se responde sin preguntar.** Una persona abre FlowSync y enumera quién está en qué y qué hay pendiente **en menos de 10 segundos** [SUPUESTO], sin escribir a nadie y sin abrir ninguna otra herramienta.

**P-2 — Coste de actualizar.** Cambiar el estado de una tarea cuesta 2 interacciones o menos, medidas contando clics sobre el producto terminado (RNF-1).

**P-3 — La colisión se detecta.** Puesto el episodio fundacional como escenario, una segunda persona a punto de arrancar un trabajo ya en curso lo detecta consultando la lista, sin preguntar. Con la salvedad de 4.4: depende de que los títulos sean reconocibles.

**P-4 — Propagación.** Con dos personas mirando la lista, un cambio hecho por una aparece ante la otra dentro del umbral de RNF-2, sin que nadie haga nada.

### 9.3 Indicadores de salud

**S-1 — Obsolescencia (riesgo nº 1). NO MEDIBLE EN ESTE MVP.** El indicador natural sería la proporción de tareas que llevan días en «En curso» sin que nadie las toque. Calcularlo exige saber cuándo cambió cada tarea por última vez, es decir, un registro de cambios a lo largo del tiempo — exactamente lo que la sección 4.2 excluye del producto. No se puede medir, y no se le pone un sustituto de adorno en su lugar.

**S-2 — Ratio de escritura. NO MEDIBLE EN ESTE MVP.** Comparar cambios de estado con tareas creadas exige contar los cambios, y contarlos es registrarlos. Misma exclusión, misma conclusión.

**S-3 — Uso de la fecha de vencimiento (riesgo nº 2). Medible.** Es el único de los tres que se lee del estado actual y no de su historia: qué proporción de las tareas vivas lleva fecha. Si acaba llevándola la mayoría, la contención del riesgo nº 2 ha fallado y el campo se ha vuelto obligatorio de facto.

**Consecuencia, dicha sin maquillar.** El MVP **no puede detectar su propio modo de fallo principal**. Si la lista empieza a quedarse vieja, ninguna medida del producto lo revelará: solo se verá mirándola, y solo si alguien se molesta en mirar. Es el precio aceptado de excluir el histórico, no un asunto pendiente de resolver. Quien lea este documento no debe suponer que existe una alarma que no existe.

### 9.4 Anti-métricas

Explícitamente **no** se mide ni se muestra: tareas cerradas por persona, tiempo de respuesta individual, actividad o conexión de nadie. Medir eso convertiría FlowSync en la herramienta de reporte que este documento rechaza.

### 9.5 Señales de fracaso

- El equipo mantiene la ronda de la daily igual que antes.
- Las tareas se crean pero no cambian de estado (S-2 plano).
- Alguien pide informes, filtros por persona o notificaciones: señal de que hemos atraído al no-usuario.

---

## 10. Puntos abiertos

Nada de esta sección reabre el alcance. En particular, **la fecha de vencimiento y el filtrado por estado permanecen dentro del MVP, bajo E2 y E3 respectivamente**: los puntos que los rozan cuestionan sus bordes o sus consecuencias, nunca su inclusión.

Del PA-3 en adelante, los puntos proceden de una revisión adversarial del propio documento. Son decisiones de producto o huecos de definición, no defectos de redacción: se dejan explícitos en lugar de resolverse a la ligera.

**PA-1 — «De un vistazo» frente a «fuera de la vista principal».** La fecha de vencimiento entró en el alcance porque se quería ver de un vistazo qué se ha pasado de plazo, pero una de las dos condiciones de su inclusión la saca de la lista (RF-15). Ambas cosas no se cumplen a la vez: en el MVP, el vencimiento **no** se ve de un vistazo. Se construye según lo acordado —la condición prevalece— y se deja anotado para decidir después de usarlo, no antes.

**PA-2 — Papelera o deshacer.** RF-12 borra de forma irreversible y lo compensa con una confirmación. Con roles planos, cualquiera puede borrar el trabajo de cualquiera. Es aceptable para un caso de estudio; para uso real habría que revisarlo.

**PA-3 — Cómo se ordena y se agrupa la lista.** RF-17 promete que alguien pueda enumerar en qué trabaja cada miembro sin abrir nada. Sin embargo, ningún requisito fija el orden de la lista, no existe agrupación por persona y RF-20 descarta el filtro por responsable. Con las 200 tareas de RNF-5, la promesa no se sostiene: responder «quién está en qué» obliga a recorrer la lista entera filtrando nombres a ojo. Es la decisión que más condiciona si el producto responde su propia pregunta.
*Para decidirlo hace falta:* fijar una regla de orden por defecto, decidir si la lista se agrupa por persona y revisar si el filtro por responsable debe volver — o si el tamaño real de uso lo hace innecesario. Conviene decidirlo con una lista poblada delante, no en abstracto.

**PA-4 — Cuántas tareas «En curso» tiene sentido que tenga una persona.** RF-8 convierte «En curso» en la única señal que el producto existe para transmitir, pero nada limita cuántas puede acumular alguien a la vez. Si cada persona tiene cuatro, la respuesta a «¿en qué estás?» deja de ser una respuesta. La pregunta original es singular; el producto admite N.
*Para decidirlo hace falta:* elegir entre no hacer nada, un límite blando con aviso, o destacar una sola tarea como foco actual. Depende de cómo trabaje realmente el equipo, dato del que hoy no disponemos.

**PA-5 — El supuesto de la cola propia no lo verifica nadie.** La sección 3 afirma que la lista es la cola de trabajo de cada persona, y de ahí sale todo el intercambio de valor. El alcance retira la vista «lo mío» y el filtro por responsable, que son precisamente las lentes que harían cierta esa afirmación. Además, ningún requisito ni ninguna métrica comprueba si la gente usa FlowSync para decidir qué hacer a continuación. Es la viga maestra del producto y es lo único que nadie observa.
*Para decidirlo hace falta:* definir qué observación bastaría para dar el supuesto por bueno o por falso, y resolver si la lente personal vuelve. Ligado a PA-3.

**PA-6 — Tres superficies que la planificación cuenta como cero.** Los nueve puntos del alcance describen una lista, pero los requisitos exigen además abrir una tarea (RF-11, RF-13, RF-15), elegir a una persona entre todas las registradas (RF-10) y advertir de que los datos pueden no estar frescos (RNF-4). Son tres superficies con estados propios. La primera nace de la condición (b) de la fecha de vencimiento; **la fecha se queda dentro y no se discute** — lo que hay que corregir es la estimación, que hoy da por supuesto que la vertical es solo la lista.
*Para decidirlo hace falta:* reconocer las tres superficies al estimar el trabajo y, opcionalmente, decidir si el selector de personas admite una forma más simple.

**PA-7 — Transiciones permitidas y vuelta atrás desde «Hecho».** RF-8 fija tres estados, pero ningún requisito declara qué transiciones son legales. Combinado con RF-21, marcar algo como hecho por error lo hace desaparecer de la vista, y el camino de vuelta pasa por el filtro por estado — **que se queda dentro del alcance**. Lo abierto no es si el filtro existe, sino si ese camino basta para deshacer un error que RF-9 hace muy fácil de cometer: dos clics, sin confirmación.
*Para decidirlo hace falta:* declarar explícitamente si se puede volver de «Hecho», y si el filtro es recuperación suficiente o hace falta algo más inmediato.

**PA-8 — Qué se ve cuando dos personas chocan.** Los roles planos (RF-10, RF-11, RF-12) y la lista viva (RF-18) garantizan colisiones: alguien borra o reasigna la tarea que otro tiene abierta y editando. RF-19 solo protege el foco y el texto a medio escribir; qué ve esa persona cuando su tarea se desvanece bajo sus dedos no está escrito en ninguna parte.
*Para decidirlo hace falta:* elegir el comportamiento visible (avisar, cerrar, quién gana). Es poco trabajo, pero hoy está indefinido.

**PA-9 — Requisitos sin criterio que pueda suspender.** Varios requisitos no se pueden verificar tal y como están redactados: RF-6 («con holgura», «desmedido»), RF-15 («evidente sin cálculo mental»), RNF-3 («sin espera perceptible», sin umbral), RNF-9 («uso razonable en tablet»), y RF-9 junto con RNF-1, que fijan «2 interacciones» sin definir qué cuenta como interacción. P-1 fija 10 segundos sin decir si el sujeto conoce el producto o lo ve por primera vez, lo que da resultados opuestos. P-3 es el caso extremo: depende de que los títulos sean reconocibles (4.4), de modo que si falla siempre puede atribuirse a las convenciones del equipo — es infalsificable.
*Para decidirlo hace falta:* sustituir cada adjetivo por un umbral o un protocolo de comprobación, y dar a P-3 un criterio que pueda fallar de verdad.

**PA-10 — Registro abierto multiplicado por borrado irreversible.** El supuesto 1 mete dentro del espacio a cualquiera que se registre, y RF-12 permite borrar cualquier tarea sin vuelta atrás. Ninguna de las dos cosas es un descuido por separado, pero nadie las ha multiplicado: cualquier desconocido que llegue a la dirección puede entrar y vaciar el tablero del equipo. Para una demo local es irrelevante; en cuanto esto se despliegue en algún sitio accesible, deja de serlo.
*Para decidirlo hace falta:* decidir si el MVP se publica en algún entorno alcanzable. Si no, se queda tal cual y basta con dejarlo escrito.

**PA-11 — E1 no está tan terminada como afirma R-2.** R-2 da la épica por hecha y concentra el esfuerzo en E2 y E3, pero el criterio de RF-1 exige que quien se registra quede dentro de un espacio compartido, y ese espacio no existe todavía ni siquiera como concepto. Es poco trabajo, pero hoy se planifica como cero.
*No hay nada que decidir:* solo que la estimación deje de contarlo como gratis.
