# FlowSync — PRD del MVP

> Documento de producto. Se basa en el alcance consensuado de [`alcance-mvp.md`](./alcance-mvp.md); si hay discrepancia, manda el alcance y este PRD se corrige, salvo lo marcado como **[DESVIACIÓN DEL ALCANCE]**: son propuestas pendientes de aprobar que, si se aceptan, obligan a actualizar `alcance-mvp.md`, y si se rechazan, se retiran de aquí.
>
> No incluye diseño técnico (modelo de datos, arquitectura, endpoints); §8 solo recoge las restricciones que impone el stack que ya existe. Lo marcado como **[SUPUESTO]** no está validado y debe confirmarse o descartarse con uso real.
>
> Etiquetas en los requisitos: **[EXISTE]** = ya implementado en el repo; **[NUEVO]** = a construir en este MVP.

## 1. Problema y contexto

En un equipo remoto pequeño, saber en qué está cada uno exige interrumpir a alguien:

- **En la daily**: la ronda de «¿en qué estás?» se come la mitad de una daily de 15 minutos.
- **Fuera de la daily**: la pregunta llega por Slack o chat e interrumpe a quien está trabajando.

Cuando nadie pregunta, el trabajo colisiona. Episodio de referencia: dos personas tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Se perdieron dos días.

**Contexto del producto.** FlowSync ya tiene registro, login, perfil y cierre de sesión. No existen tareas ni ningún otro concepto de trabajo. El MVP añade la primera capability de negocio sobre esa base.

**Qué no resuelve.** La parte de bloqueos de la daily sigue existiendo. El MVP elimina la ronda de «¿en qué estás?», no la daily.

## 2. Usuarios y jobs-to-be-done

**Segmento.** Equipos remotos de 3 a 10 personas, repartidos en varios husos horarios, con roles planos: todas las personas ven y editan lo mismo. El valor lo cobran los pares. No hay lead ni manager consumiendo la información ni reporte hacia arriba.

**Usuario de referencia.** Equipo de 6 personas de un producto SaaS, en 3 husos horarios, que usa un gestor de tareas pesado y una daily de 15 minutos por videollamada. **[SUPUESTO] Es un caso de estudio, no un cliente real.** Nada de este PRD está validado con usuarios.

**No es nuestro usuario** un equipo que necesite sprints, estimaciones, épicas, backlog priorizado o informes.

### Jobs-to-be-done

| # | Cuando… | quiero… | para… |
|---|---|---|---|
| JTBD-1 | termino algo y voy a elegir lo siguiente | ver qué tareas están libres y cuáles tiene ya alguien | no empezar algo que otra persona ya está tocando |
| JTBD-2 | empiezo a trabajar en una tarea | dejar constancia de que la tengo yo, en segundos | que nadie la coja en paralelo y que no me pregunten cómo va |
| JTBD-3 | llego por la mañana o vuelvo de una reunión | ver de un vistazo quién está en qué | ponerme al día sin interrumpir a nadie ni esperar a la daily |
| JTBD-4 | termino una tarea | marcarla como terminada al momento | que el equipo sepa que está hecha y que yo vea mi cola limpia |

## 3. Propuesta de valor

Una lista de tareas compartida que es, a la vez, **la cola de trabajo de cada persona**. Marcar en qué estás cuesta dos clics sobre una lista que ya tienes abierta, sin campos obligatorios, y de un vistazo se ve qué está libre y qué ya tiene alguien.

> **Eliges qué coger sin preguntar a nadie, y a ti dejan de preguntarte.**

- **Decisión que cambia:** no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre.
- **[SUPUESTO] Hipótesis central:** el estado se mantendrá al día porque actualizarlo es barato y quien lo actualiza obtiene algo en el momento (es su cola de trabajo y deja de recibir interrupciones), no porque se obligue a nadie.
- **Condición para que funcione:** el hábito «primero me la asigno, luego trabajo». Si la tarea no existe cuando alguien empieza, la colisión se repite.
- **Por qué no Jira:** crear una tarea y cambiarle el estado cuesta segundos, sin configurar flujos ni rellenar campos obligatorios. FlowSync **sustituye** al gestor de tareas, no convive con él.

## 4. Alcance / Fuera de alcance

### Alcance

1. Una lista de tareas compartida en **un único espacio**, visible y editable por cualquier usuario autenticado.
2. Crear una tarea escribiendo **solo el título**.
3. Asignar responsable (a uno mismo o a otra persona) desde la lista.
4. Cambiar el estado **en dos clics como máximo** desde la lista, sin formularios. El usuario ve tres estados: **Libre**, **En curso** y **Terminada**.
5. Filtrar por estado.
6. Fecha de vencimiento opcional por tarea, con las vencidas visibles de un vistazo.
7. La lista muestra los datos al día **cada vez que se abre o se recarga**.

**Criterio de «completo»:** una persona entra, ve qué está libre y se la asigna, y el resto del equipo lo ve la siguiente vez que abre la lista.

### Fuera de alcance

| Excluido | Motivo |
|---|---|
| Cambios en vivo sin recargar | La decisión «¿cojo esto?» se toma al abrir la lista, y para eso bastan datos al día al cargar. Actualizar en vivo no evita que el estado se quede viejo si nadie lo cambia. Es lo primero que entra si la hipótesis se sostiene. |
| «Qué ha cambiado desde tu última visita» | Es otra capability. Con 3 a 10 personas, la lista entera se lee de un vistazo. |
| Descripción, comentarios, adjuntos, etiquetas | Para saber quién está en qué basta con el título. |
| Editar el título | No figura en el alcance consensuado. Si una tarea se crea con el título mal, se marca como terminada y se crea otra. **[SUPUESTO]** Los errores en el título serán raros. Si no lo son, es la primera ampliación de E2. |
| Borrar tareas | Marcarla como terminada cubre el caso normal. |
| Invitar o dar de alta usuarios desde la app | El registro ya existe: quien se registra, entra. |
| Búsqueda y otros filtros (por responsable, por texto…) | Con 3 a 10 personas, el filtro por estado y el vistazo bastan. |
| App móvil nativa, modo sin conexión | El uso es abrir la lista en el navegador de trabajo. |
| Varios equipos, «equipo» como concepto, personas en más de un equipo | **[SUPUESTO]** Cada instalación de FlowSync corresponde a un único equipo. |
| Roles y permisos | Entre pares con roles planos, restringir solo añade fricción. |
| Presencia, «quién está conectado», indicadores de actividad | Es vigilancia, y se rechaza a propósito. El estado pertenece a la tarea, no a la persona. |
| Notificaciones push, chat, videollamada | Lo que se busca es un resumen que espera a que lo mires, no un aviso que interrumpe. |
| Varias personas editando lo mismo a la vez | «Tiempo real» aquí significa ver cambios de estado, no coeditar. Prevalece el último cambio (el alcance lo fija así; RF-12 propone una excepción pendiente de aprobar). |
| Deducir el estado de Git/PRs, CI o el calendario | Exige integraciones y OAuth de terceros, y eso es otro producto. |
| Importar o sincronizar con otros gestores | Tener las tareas en dos sitios obliga a actualizar dos veces, y así muere esta categoría. |
| Sprints, estimaciones, épicas, backlog priorizado, informes | Es justo «el rollo» del que se quiere huir. |
| Gestión de bloqueos | La parte de bloqueos de la daily sigue existiendo. |

## 5. Épicas del MVP

- **E1 «Cuentas y acceso»**: registro, login, sesión y cierre de sesión (ya existen), más la regla de que todo usuario registrado pertenece al único espacio.
- **E2 «Gestión de tareas»**: crear tareas, cambiar quién las tiene y en qué estado están (tomar, asignar, soltar, terminar, reabrir), la fecha de vencimiento y el filtrado por estado.
- **E3 «Actividad del equipo»**: ver de un vistazo quién está en qué y qué está libre, con la lista al día al cargar.

> **Nota sobre E3.** El nombre no implica un feed de actividad, un histórico, actualizaciones en vivo ni presencia de personas: todo eso está fuera de alcance. En este MVP, «actividad del equipo» es el **estado actual de las tareas** del equipo.

## 6. Requisitos funcionales

### E1 — Cuentas y acceso

- **RF-1 [EXISTE]** Una persona puede registrarse con email, contraseña (con confirmación) y nombre opcional. Si el email ya está registrado, el registro se rechaza con un mensaje en castellano.
- **RF-2 [EXISTE]** Una persona registrada puede iniciar sesión con email y contraseña. Si las credenciales son incorrectas, ve un error y no accede.
- **RF-3 [EXISTE]** La sesión se mantiene al recargar el navegador hasta que la persona la cierra.
- **RF-4 [EXISTE]** Al cerrar sesión, ese navegador deja de tener acceso y vuelve a la pantalla de login.
- **RF-5 [NUEVO]** Sin sesión iniciada no se puede ver ni modificar ninguna tarea. Quien intente acceder a la lista es redirigido al login.
- **RF-6 [NUEVO]** Todo usuario registrado forma parte del único espacio: ve todas las tareas, puede modificarlas y aparece como posible responsable. Tras registrarse o iniciar sesión, la persona llega a la lista de tareas.
- **RF-7 [NUEVO]** En la lista, cada responsable se identifica por su nombre o, si no lo tiene, por su email.

### E2 — Gestión de tareas

- **RF-8 [NUEVO]** Desde la lista, sin abrir un formulario aparte, una persona puede crear una tarea escribiendo solo el título y confirmando. La tarea nace **Libre** y sin responsable, y aparece en la lista.
- **RF-9 [NUEVO]** No se puede crear una tarea con el título vacío o formado solo por espacios, y se muestra un error en castellano. **[SUPUESTO]** El título admite hasta 200 caracteres.
- **RF-10 [NUEVO] Tomar.** Desde la lista, en dos clics como máximo, una persona puede tomar una tarea **Libre**: pasa a ser la responsable y la tarea queda **En curso**.
- **RF-11 [NUEVO] Asignar.** Desde la lista, una persona puede asignar como responsable a cualquier usuario registrado, incluida ella misma, en cualquier tarea no terminada. La tarea queda **En curso** con ese responsable.
- **RF-12 [NUEVO] [DESVIACIÓN DEL ALCANCE] No pisar a otro.** Puede pasar que alguien intente *tomar* una tarea que ya tiene otra persona, porque su lista no estaba actualizada. En ese caso la tarea **no** se reasigna en silencio: se informa de quién la tiene y la lista se actualiza. La reasignación deliberada con RF-11 sigue permitida. *Desviación:* `alcance-mvp.md` fija que, en ediciones simultáneas, prevalece el último cambio. Aplicado a *tomar*, eso reproduce en silencio la colisión que el producto existe para evitar. Si no se aprueba, se retira este RF y *tomar* sigue la regla general.
- **RF-13 [NUEVO] Soltar.** El responsable de una tarea **En curso**, u otra persona, puede quitarle el responsable. La tarea vuelve a **Libre**.
- **RF-14 [NUEVO] Terminar.** Una tarea **Libre** o **En curso** se puede marcar como **Terminada** en dos clics como máximo, desde la lista. Si tenía responsable, lo conserva, para que se vea quién la terminó.
- **RF-15 [NUEVO] Reabrir.** Una tarea **Terminada** se puede reabrir. Vuelve a **En curso** si tiene responsable y a **Libre** si no lo tiene.
- **RF-16 [NUEVO] Coherencia visible.** En ningún momento se ve una tarea **Libre** con responsable, ni una tarea **En curso** sin responsable.
- **RF-17 [NUEVO]** Todo cambio confirmado (crear, tomar, asignar, soltar, terminar, reabrir) persiste. Lo ve cualquier usuario al abrir o recargar la lista, y lo sigue viendo después de cerrar sesión y volver a entrar.
- **RF-19 [NUEVO]** La lista se puede filtrar por estado: *Pendientes* (Libre + En curso), *Libre*, *En curso*, *Terminada* y *Todas*. El filtro por defecto es *Pendientes*.
- **RF-23 [NUEVO] [DESVIACIÓN DEL ALCANCE — aprobada] Fecha de vencimiento.** Desde la lista, una persona puede poner, cambiar o quitar una fecha de vencimiento en cualquier tarea. Nunca es obligatoria (RNF-2). Las tareas no terminadas cuya fecha ya ha pasado se distinguen como vencidas en la propia lista. **[SUPUESTO]** Una tarea está vencida a partir del día siguiente a su fecha, según el calendario de quien mira. *Desviación aprobada:* `alcance-mvp.md` la excluye todavía y hay que actualizarlo.

### E3 — Actividad del equipo

- **RF-18 [NUEVO]** La lista muestra, para cada tarea, el título, el estado y el responsable (si lo hay).
- **RF-20 [NUEVO]** El estado se distingue de un vistazo en la propia lista, sin abrir cada tarea.
- **RF-21 [NUEVO]** Al abrir o recargar la lista se ven todos los cambios confirmados por cualquier persona hasta ese momento. Mientras no se recarga, la lista **no** se actualiza sola (queda fuera de alcance).
- **RF-22 [NUEVO]** **[SUPUESTO]** Las tareas aparecen ordenadas de más reciente a más antigua según su creación, y el orden no cambia al cambiar el estado, para que nadie pierda su sitio en la lista.

## 7. Requisitos no funcionales

- **RNF-1 Fricción.** Tomar, terminar, soltar o reabrir una tarea cuesta **2 clics como máximo** desde la lista. Crear una cuesta escribir el título y confirmar. Se comprueba contando interacciones en una prueba guiada.
- **RNF-2 Sin campos obligatorios** salvo el título, en todo el MVP.
- **RNF-3 Resultado visible.** Tras cada cambio **propio**, quien lo hace ve el resultado en la lista sin recargar a mano. Los cambios de **otras personas** solo aparecen al abrir o recargar (RF-21). Si un cambio no se guarda, lo ve con un mensaje en castellano y la lista no lo muestra como guardado.
- **RNF-4 Privacidad.** El producto no muestra ni registra, para mostrarlo, ningún dato de actividad de las personas: conexión, «visto por última vez», tiempo en la app. Se comprueba revisando que ninguna pantalla muestra esa información.
- **RNF-5 Acceso.** Ningún dato de tareas es accesible sin sesión (ver RF-5). Las contraseñas nunca se muestran. **[SUPUESTO]** La instalación no está expuesta a desconocidos, porque cualquiera que pueda registrarse entra en el espacio (RF-6).
- **RNF-6 Idioma.** Toda la interfaz y todos los mensajes de error están en castellano.
- **RNF-7 Accesibilidad.** Todas las acciones de E2 y E3 se pueden hacer solo con teclado. El estado no se comunica solo con color: también con texto o icono con etiqueta.
- **RNF-8 Volumen.** **[SUPUESTO]** La lista sigue siendo usable, sin paginación, con 10 usuarios y hasta 500 tareas.
- **RNF-9 Navegadores.** **[SUPUESTO]** Funciona en las dos últimas versiones de Chrome, Firefox, Safari y Edge en escritorio. En móvil no se garantiza nada.

## 8. Restricciones

- **Stack actual, que no se cambia:** backend AdonisJS 7 (Lucid + SQLite) y frontend React 19 + Vite. El MVP se construye sobre él, sin añadir servicios externos.
- **La autenticación ya existe** (registro, login, perfil, logout) y se reutiliza tal cual. E1 no rehace nada de lo que ya funciona.
- **Una sola base de datos por instalación.** Encaja con el supuesto de «una instalación = un equipo».
- **Sin integraciones de terceros ni OAuth externo.**
- **Construcción por capability vertical:** una capability terminada de punta a punta antes de empezar la siguiente. El orden es E1 (cerrar RF-5 a RF-7), luego E2 y luego E3.
- **Validación sin cliente real:** el usuario de referencia es un caso de estudio (ver §2). Las métricas de §9 son un protocolo a aplicar con un equipo real, no resultados.

## 9. Métricas de éxito

Todas se miden **tras una semana de uso real** por un equipo que haya dejado su gestor anterior para el trabajo del día a día.

| # | Métrica | Umbral de éxito | Cómo se mide |
|---|---|---|---|
| M-1 **(principal)** | Ronda de «¿en qué estás?» en la daily | Se cancela durante la semana y **nadie pide que vuelva** | Observación de la daily y pregunta explícita al equipo al final de la semana |
| M-2 | Preguntas «¿en qué estás?» o «¿cómo va X?» por chat sobre tareas que ya estaban en la lista | **[SUPUESTO]** Como máximo 1 en toda la semana y todo el equipo | Autoinforme diario de cada persona (sí/no + tarea) |
| M-3 | Colisiones: dos personas trabajando en lo mismo sin saberlo | **[SUPUESTO]** 0 en la semana | Pregunta explícita en la retro de fin de semana |
| M-4 | Frescura del estado | **[SUPUESTO]** Al menos el 90 % de las tareas En curso las está trabajando de verdad su responsable | Muestreo diario: cada persona confirma sus tareas En curso |
| M-5 | Adopción: todas las personas del equipo toman al menos una tarea por sí mismas (RF-10) durante la semana | — | **No medible en este MVP.** La lista solo muestra el responsable actual (RF-18) y el histórico está fuera de alcance (nota de E3). Al final de la semana no se puede saber quién tomó una tarea y a quién se la asignaron, ni qué tareas pasaron por cada persona. |
| M-6 (alarma) | Convivencia con el gestor anterior | Nadie mantiene el trabajo en paralelo en otra herramienta | Pregunta explícita al equipo |

**Señal temprana de fallo:** alguien pregunta por chat por una tarea que ya está en la lista (M-2), o una tarea aparece En curso sin que nadie la esté trabajando (M-4).

**Riesgos que miden estas métricas:**

- **Riesgo #1, estado viejo** (incluidas tareas que nunca se crean): lo miden M-3 y M-4.
- **Riesgo #2, migración cara** porque las tareas tienen muy pocos campos: lo mide M-6. M-5 no es medible en este MVP.
- **Riesgo #3, validación sin cliente real:** ninguna métrica lo cubre. Se resuelve consiguiendo un equipo real.

## 10. Puntos abiertos

Hallazgos de la revisión adversarial que no se aplican en este documento. Cada uno necesita una decisión antes de construir la parte a la que afecta.

### Decisiones de producto

- **PA-1 ¿Sustituir el gestor actual o convivir con él?** (§3, §9)
  - *Argumento:* con tareas de solo título (sin descripción ni enlaces, y sin poder editar el título), lo probable es que el contexto que necesita el trabajo se quede en el gestor pesado, y el equipo acabe actualizando dos sitios. Si pasa, no se cumple la condición previa de §9 y no se mide nada.
  - *Para decidir:* observar con un equipo real qué contexto consultan al trabajar una tarea y dónde lo guardan. Con eso, o se añade un campo mínimo de contexto o se reescribe §3 aceptando la convivencia.
- **PA-2 JTBD-3 («ponerme al día») no lo cubre ningún requisito.**
  - *Argumento:* sin «qué ha cambiado» ni rastro temporal, quien vuelve ve el estado actual pero no qué se ha movido. En un equipo repartido en 3 husos horarios, ese es el caso asíncrono principal.
  - *Para decidir:* si JTBD-3 se mantiene (y entonces hace falta alguna señal de cambio) o se retira. Validarlo con un equipo repartido en varios husos.
- **PA-3 El hábito «primero me la asigno, luego trabajo» no tiene requisito ni métrica.**
  - *Argumento:* el episodio de referencia pasó porque alguien empezó sin avisar, y el producto ni cambia eso ni lo observa. Medirlo exige un registro mínimo de transiciones, que hoy está fuera de alcance.
  - *Para decidir:* si el MVP debe facilitar o medir ese hábito, y si eso justifica guardar ese registro mínimo.
- **PA-4 M-1 a M-4 son difíciles de medir con fiabilidad.**
  - *Argumento:*
    - M-1: un solo equipo, una sola semana y efecto novedad, y hoy no hay equipo real.
    - M-2: llevar el autoinforme cuesta más que usar el producto.
    - M-3: con un único episodio conocido, cero colisiones en una semana es lo esperable con o sin FlowSync.
    - M-4: «trabajando de verdad» no está definido, y lo confirma la misma persona que se olvidó de actualizar.
  - *Para decidir:* un equipo real; la frecuencia actual de colisiones, medida antes de empezar; una definición de «trabajando de verdad»; y si se aceptan métricas autoinformadas o se guarda algún dato en el producto (ver PA-3).
- **PA-5 Bajas, registro abierto y quién instala.** (RF-6, RNF-5)
  - *Argumento:* sin roles, nadie puede quitar el acceso a quien se va ni sacarlo de la lista de posibles responsables. Con el registro abierto, el control de acceso depende de un supuesto operativo que el producto no puede comprobar. Y no está definido quién monta la instancia de un equipo.
  - *Para decidir:* cómo se da de baja a una persona y quién puede hacerlo sin romper los roles planos, y cómo consigue un equipo su instancia.
- **PA-6 Alcance que añadió el PRD y que no estaba en el alcance consensuado.**
  - *Argumento:* los requisitos siguientes tienen coste y no venían del alcance:
    - RNF-7: todo operable con teclado.
    - RNF-9: cuatro navegadores, Safari incluido.
    - RNF-3: resultado inmediato y marcha atrás si falla.
    - RF-12: detectar el conflicto al tomar una tarea.
    - RF-19: cinco opciones de filtro, con *Pendientes* por defecto. Lo que se cuestiona es el detalle; el filtrado por estado sigue dentro de E2.
    - RF-6: cambiar la pantalla a la que se llega tras el login, que hoy es el perfil.
  - *Para decidir:* estimar el coste de cada uno y elegir cuáles entran en el MVP.
- **PA-7 Fecha de vencimiento (RF-23).** Sigue dentro de E2.
  - *Argumento* (de la fase de alcance): no ayuda a elegir qué coger ni a evitar colisiones, y es un campo más que puede quedarse viejo. Además, con 3 husos horarios, que una tarea esté «vencida» depende de quién mira.
  - *Para decidir:* confirmar con uso real que el equipo la usa, y fijar qué calendario manda para marcar una tarea como vencida.

### Subsanables durante la construcción

- **PA-8 RF-12 se puede esquivar con RF-11.**
  - *Argumento:* asignarse una tarea con RF-11 no tiene la protección que RF-12 da a *tomar*. Tampoco está definido qué pasa con otras acciones hechas sobre una lista desactualizada: terminar una tarea que otra persona acaba de reasignar, soltar una ya terminada o reabrir una que ya ha cogido alguien.
  - *Para decidir:* si la misma regla se aplica a toda acción que dependa de lo que el usuario estaba viendo.
- **PA-9 Cualquiera puede soltar la tarea de otra persona (RF-13).**
  - *Argumento:* quita sin avisar el «esto es mío» de un compañero, y eso puede provocar la colisión que el producto quiere evitar.
  - *Para decidir:* si solo puede soltarla su responsable, o si soltar la de otro exige confirmación o un aviso.
- **PA-10 Al reabrir, la tarea vuelve a En curso con el responsable anterior (RF-15).**
  - *Argumento:* por diseño genera tareas En curso que nadie está trabajando, que es justo lo que castiga M-4.
  - *Para decidir:* si al reabrir queda Libre o se pide un responsable.
- **PA-11 Requisitos sin criterio de aprobado: RF-20 («de un vistazo») y RNF-8 («usable»).**
  - *Para decidir:* un criterio que se pueda comprobar en una prueba guiada.
- **PA-12 RNF-1 no fija límite para todas las acciones.**
  - *Argumento:* asignar a otra persona no tiene límite de interacciones, y el límite se cuenta en clics mientras RNF-7 exige que todo se pueda hacer con teclado.
  - *Para decidir:* un límite para asignar y cuánto equivale en teclado.
- **PA-13 Se puede terminar una tarea Libre (RF-14).**
  - *Argumento:* queda terminada sin responsable, así que no se ve quién la hizo.
  - *Para decidir:* si se permite, o si terminarla implica asignársela.
- **PA-14 RF-16 fija una máquina de estados.**
  - *Argumento:* el alcance dejaba los estados internos para más adelante.
  - *Para decidir:* reformularlo en términos de lo que ve el usuario, o aceptarlo ya como regla.
- **PA-15 El email queda visible (RF-7).**
  - *Argumento:* cuando alguien no tiene nombre, todo el equipo ve su email.
  - *Para decidir:* si es aceptable con RNF-4 o si se exige el nombre.
