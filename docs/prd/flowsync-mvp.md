# PRD del MVP: FlowSync

> Estado: borrador para revisión
> Fecha: 2026-09-24
> Base: `docs/prd/alcance-mvp.md` (alcance consensuado). Si este PRD y el alcance difieren, manda el alcance hasta que se actualice.
> Convención: `[SUPUESTO]` marca lo que no está decidido o no se ha validado. No hay cifras de mercado en este documento.

## 1. Problema y contexto

En equipos remotos pequeños, nadie puede ver en qué trabaja cada persona sin interrumpir a alguien. Hoy se resuelve con una reunión diaria de sincronización (daily, 15 minutos por videollamada) y con preguntas constantes del tipo «¿en qué estás?» por Slack o chat. Esa ronda ocupa aproximadamente la mitad de la daily.

El coste es doble: interrupciones continuas y trabajo duplicado. Caso que motiva el producto: dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera, y se perdieron dos días. El problema afecta sobre todo a los pares que trabajan en paralelo; no hay necesidad de reportar hacia arriba.

Contexto del producto:

- FlowSync es la lista de tareas donde se hace el trabajo. Sustituye al gestor de tareas actual del equipo, no convive con él.
- Los cambios de estado de las tareas deben poder verse sin preguntar. «Tiempo real» significa solo eso, no es chat ni edición simultánea.
- Hoy existen registro, inicio de sesión y perfil. Las tareas aún no existen.
- El primer usuario es un caso de estudio (equipo de 6 personas de un producto SaaS en 3 husos horarios), no un cliente real. El éxito medido con él es simulado.

## 2. Usuarios y jobs-to-be-done

**Usuario principal:** integrante de un equipo remoto de 3 a 10 personas, con roles planos (todos ven y editan lo mismo).

**No es el usuario:** managers que quieren informes hacia arriba; equipos que necesitan sprints, estimaciones, épicas o backlog priorizado; personas que pertenecen a varios equipos.

| Cuando... | Quiero... | Para... |
|---|---|---|
| Llego por la mañana o vuelvo de una reunión | ver qué ha cambiado desde la última vez que miré | ponerme al día sin preguntar a nadie |
| Voy a elegir mi siguiente trabajo | ver qué tareas están libres y cuáles ya tiene alguien | no empezar algo que otra persona ya está tocando |
| Cambia mi situación en una tarea | reflejarlo en segundos, sin campos ni trámites | que el equipo lo vea sin que me lo pregunten |
| Se acerca o pasa un plazo | ver de un vistazo qué está vencido | actuar antes de que alguien tenga que reclamarlo |
| Tengo varias tareas abiertas | filtrar la lista por estado | centrarme en lo pendiente |

Incentivo de quien escribe: la misma lista es su cola de trabajo, y mantenerla al día le evita recibir interrupciones preguntándole cómo va. Si el beneficio fuera solo para los demás, la información se quedaría vieja.

## 3. Propuesta de valor

Para equipos remotos pequeños, FlowSync es la lista de tareas donde se hace el trabajo y donde cualquiera ve de un vistazo qué se ha movido y qué está libre, sin preguntar a nadie ni hacer una ronda de sincronización.

- **Actualizar cuesta segundos:** cambiar el estado son dos clics sobre la lista ya abierta, sin campos obligatorios ni decisiones de sprint o estimación.
- **Señal que espera, no que interrumpe:** el equipo consulta el estado cuando quiere; no hay notificaciones push.
- **El estado es de la tarea, no de la persona:** no hay presencia ni indicadores de actividad.
- **Menos rollo que un gestor pesado:** crear una tarea y cambiarle el estado no requiere configuración previa.

## 4. Alcance / Fuera de alcance

**Dentro del MVP**

- Un único espacio compartido para todo el equipo, sin entidad «equipo» propia.
- Cuentas y acceso (ya implementados y reutilizados; ver E1).
- Crear, editar y asignar tareas con título, responsable, estado y fecha de vencimiento; solo el título es obligatorio.
- Cambio de estado en dos clics desde la lista.
- Filtro por estado y destacado de tareas vencidas.
- Ver los cambios de otras personas sin refrescar.
- Ver qué ha cambiado desde la última vez que la persona miró la lista. `[SUPUESTO]` Se trata como pieza central del MVP, por encima de la actualización automática, porque el equipo objetivo está en 3 husos horarios y rara vez coincide conectado. Pendiente de confirmar.

**Fuera del MVP** (con su motivo)

- **Varios equipos, o personas en más de uno:** se anota como supuesto, no se construye.
- **Presencia o actividad de las personas:** es vigilancia y se rechaza a propósito.
- **Notificaciones push:** la señal es un resumen que espera, no un aviso que interrumpe.
- **Chat, videollamada y edición simultánea de un documento.**
- **Derivar el estado de Git, pull requests, CI o calendario:** es otro producto, con integraciones y acceso de terceros.
- **Convivir o sincronizarse con otro gestor de tareas:** obligaría a actualizar en dos sitios.
- **Sprints, estimaciones, épicas, backlog priorizado e informes.**
- **Roles y permisos diferenciados.**
- **Resolver los bloqueos:** la parte de bloqueos de la daily sigue existiendo; este MVP solo elimina la ronda de «¿en qué estás?».

## 5. Épicas del MVP

- **E1. Cuentas y acceso:** registro, inicio y cierre de sesión, perfil y acceso restringido a personas autenticadas.
- **E2. Gestión de tareas:** crear, editar, asignar y cambiar el estado de las tareas, y consultarlas filtradas por estado y por vencimiento.
- **E3. Actividad del equipo:** ver los cambios de otras personas sin refrescar y saber qué se ha movido desde la última visita.

## 6. Requisitos funcionales

Cada requisito indica su épica. Los criterios de aceptación se redactan para poder comprobarse con una persona usando la aplicación.

### E1. Cuentas y acceso (ya implementado; se reutiliza tal cual)

- **RF-1.** Una persona puede crear una cuenta con nombre, correo y contraseña, y confirmar la contraseña. No se admite un correo ya registrado. La contraseña debe tener entre 8 y 32 caracteres. Si la confirmación no coincide o hay un error de validación, el mensaje aparece en castellano junto al campo afectado.
- **RF-2.** Una persona con cuenta puede iniciar sesión con su correo y contraseña. Con credenciales incorrectas ve un mensaje de error en castellano y no entra.
- **RF-3.** Una persona con sesión iniciada puede cerrarla y, tras cerrarla, no puede ver las tareas sin volver a iniciar sesión.
- **RF-4.** Una persona con sesión iniciada puede ver su perfil (nombre y correo).
- **RF-5.** La sesión se mantiene al recargar la página del navegador y se restablece sola mientras siga siendo válida.
- **RF-6.** Ninguna tarea es visible para quien no ha iniciado sesión: al intentar abrir la lista sin sesión se le lleva al inicio de sesión.

### E2. Gestión de tareas

- **RF-7.** Cualquier persona con sesión puede crear una tarea indicando solo el título. El título vacío no se acepta y se avisa de ello. Responsable y fecha de vencimiento son opcionales.
- **RF-8.** Cada tarea tiene un estado, que se elige de un conjunto pequeño y fijo de valores. `[SUPUESTO]` Tres valores: pendiente, en curso y hecha; una tarea nueva empieza en «pendiente». Los nombres y el número definitivos se confirman antes de construir.
- **RF-9.** Cualquier persona con sesión puede cambiar el estado de cualquier tarea en dos clics como máximo, desde la lista y sin abrir otra pantalla.
- **RF-10.** Cualquier persona con sesión puede asignar una tarea a un integrante del espacio, reasignarla o dejarla sin responsable. Las tareas sin responsable se distinguen a simple vista en la lista.
- **RF-11.** Cualquier persona con sesión puede editar el título y la fecha de vencimiento de una tarea.
- **RF-12.** La lista muestra, para cada tarea, su título, responsable, estado y fecha de vencimiento, y es la misma para todas las personas del espacio.
- **RF-13.** La lista puede filtrarse por estado. Con un filtro activo solo se ven las tareas en ese estado, y quitar el filtro devuelve la lista completa.
- **RF-14.** Una tarea con fecha de vencimiento anterior a hoy que no esté en el estado final se destaca visualmente como vencida.
- **RF-15.** `[SUPUESTO]` Cualquier persona con sesión puede eliminar una tarea. No está en el alcance consensuado; se propone porque sin ello los errores de creación quedan para siempre en una lista compartida. Pendiente de confirmar.

### E3. Actividad del equipo

- **RF-16.** Cuando otra persona crea una tarea o cambia su estado, su responsable, su título o su fecha, la lista de quien la tiene abierta se actualiza sin recargar la página y sin acción alguna.
- **RF-17.** Al abrir la lista, las tareas que otras personas han creado o modificado desde la última vez que esta persona la miró se marcan como cambiadas. `[SUPUESTO]` «Última vez que miró» es la última vez que abrió la lista con sesión iniciada. Pendiente de confirmar. Para ello el sistema guarda, por persona, el momento de su última visita. Es un dato privado de esa persona: ninguna pantalla lo muestra a otras personas y no se usa para nada más.
- **RF-18.** Una tarea marcada como cambiada indica qué cambió (nueva, cambio de estado, cambio de responsable o cambio de fecha), no solo que algo cambió. Los cambios que hizo la propia persona no se marcan para ella. Para poder excluirlos, el sistema conserva el autor de cada cambio; no lo presenta como actividad por persona.
- **RF-19.** La marca de «cambiada» desaparece cuando la persona ha visto la lista, de modo que la próxima vez solo se marque lo nuevo.
- **RF-20.** El sistema no muestra a nadie quién está conectado, cuándo se conectó por última vez ni ningún otro indicador de actividad o presencia de otras personas. Sí guarda, sin mostrarlos a otras personas, los dos datos por persona que necesitan RF-17 (última visita) y RF-18 (autor de cada cambio). La garantía es que no se ven ni se usan para vigilar, no que no se registre nada.
- **RF-21.** El sistema no envía notificaciones push ni avisos fuera de la propia aplicación.

## 7. Requisitos no funcionales

- **RNF-1. Rapidez de uso.** Crear una tarea es posible sin rellenar más que el título; cambiar un estado requiere dos clics como máximo. Se comprueba cronometrando a una persona que nunca ha usado la aplicación.
- **RNF-2. Frescura.** Un cambio hecho por una persona debe verse en la lista de otra sin que esta la recargue. `[SUPUESTO]` El umbral de tiempo aceptable se fija en la fase de diseño, tras observar el uso real del equipo.
- **RNF-3. Privacidad y no vigilancia.** Ninguna pantalla muestra a otras personas datos sobre cuándo o cuánto se conecta alguien. Los datos que el sistema guarda para RF-17 y RF-18 no se exponen a otras personas ni se usan para medir actividad (véanse RF-20 y RF-21).
- **RNF-4. Seguridad de acceso.** Las contraseñas no se muestran ni se devuelven nunca. Ninguna tarea es accesible sin sesión (véase RF-6). Cerrar sesión invalida el acceso desde ese dispositivo.
- **RNF-5. Idioma.** Toda la interfaz y todos los mensajes de error están en castellano.
- **RNF-6. Zonas horarias.** El equipo objetivo está en 3 husos horarios. `[SUPUESTO]` La fecha de vencimiento es un día del calendario, no una hora, y se muestra igual a todos.
- **RNF-7. Capacidad.** El MVP se diseña para un equipo de 3 a 10 personas en un único espacio. `[SUPUESTO]` No se fija un número máximo de tareas.
- **RNF-8. Compatibilidad.** `[SUPUESTO]` Navegadores de escritorio actuales; el uso en móvil no es requisito del MVP.
- **RNF-9. Accesibilidad básica.** `[SUPUESTO]` Las acciones principales (crear tarea, cambiar estado, filtrar) se pueden hacer con teclado.
- **RNF-10. Coherencia de la información.** Dos personas que cambian la misma tarea casi a la vez no deben dejarla en un estado inconsistente. `[SUPUESTO]` Basta con que prevalezca el último cambio y que ambas personas vean el resultado final.

## 8. Restricciones

- **Stack actual:** el producto se construye sobre lo existente: AdonisJS 7 para el servidor y React 19 para la interfaz. No se reabre esa decisión en el MVP.
- **Cuentas ya existentes:** registro, inicio de sesión, cierre de sesión y perfil ya funcionan y se reutilizan; el MVP no los rediseña.
- **Sin pruebas automáticas hoy:** el servidor no tiene tests y la interfaz no tiene un ejecutor de tests. Que los requisitos sean comprobables no implica que ya haya forma automática de comprobarlos.
- **Un único espacio:** el registro es hoy abierto, así que cualquiera que se registre vería todas las tareas. `[SUPUESTO]` Es aceptable solo mientras sea un caso de estudio con una instalación para un único equipo.
- **Sin integraciones externas:** ni con otros gestores de tareas ni con Git, CI o calendario.
- **Caso de estudio:** los resultados de uso son simulados y no deben presentarse como validación con clientes reales.

## 9. Métricas de éxito

**Métrica principal (la que decide si funcionó):** tras una semana de uso real, el equipo cancela la ronda de «¿en qué estás?» de la daily y nadie pide que vuelva. Si la siguen haciendo igual, no funcionó.

**Métricas de apoyo**

| Métrica | Cómo se comprueba | Objetivo |
|---|---|---|
| Menos interrupciones de estado | El equipo cuenta las preguntas «¿en qué estás?» por chat en la semana con FlowSync frente a la anterior | Menos que en la semana previa `[SUPUESTO]` |
| Información al día | Se revisa si el estado de las tareas en curso coincide con lo que la persona dice estar haciendo | La gran mayoría coincide `[SUPUESTO]`; el umbral exacto se fija antes de medir |
| Se mira antes de empezar | Declaración de cada persona al final de la semana. El sistema no lo mide: hacerlo exigiría registrar la actividad de cada persona, lo que este PRD excluye (RF-20, RNF-3) | Sin objetivo numérico. Es evidencia débil, autodeclarada, no una medida |
| Cero trabajo duplicado | El equipo reporta si dos personas empezaron lo mismo sin saberlo | Ningún caso en la semana |
| Velocidad de uso | Prueba con una persona nueva: crear tarea y cambiar estado | Cumple RNF-1 (solo título; dos clics como máximo) |

**Riesgo principal a vigilar:** que la información se quede vieja. Es el riesgo que invalida el producto, y se mide con «Información al día». La mitigación elegida es que actualizar cueste dos clics; no se obliga a nadie.

**Límite de lectura:** el equipo es un caso de estudio, así que estas métricas validan el diseño del producto, no su aceptación en el mercado.

## 10. Puntos abiertos

Cada punto viene de la revisión adversarial del borrador. Ninguno está decidido. Se recoge el argumento resumido y lo que haría falta para decidirlo. La fecha de vencimiento y el filtro por estado siguen dentro del alcance, bajo E2; los puntos que los mencionan preguntan cómo se comportan, no si entran.

**PA-1. Migración desde el gestor actual.**
- *Argumento:* el producto sustituye al gestor y no convive con él, pero el MVP no tiene importación. Un equipo con backlog ya cargado tendría que reescribirlo a mano, o acabaría con dos herramientas y doble actualización.
- *Para decidirlo:* saber cuántas tareas vivas tiene hoy el equipo del caso de estudio, si acepta empezar en limpio y qué costaría una importación básica.

**PA-2. Que la lista evite el trabajo duplicado.**
- *Argumento:* el episodio que motiva el producto fue empezar a trabajar sin avisar. La lista solo lo evita si alguien registra la tarea *antes* de empezar y su título permite reconocer que se pisa con otra. Nada lo promueve ni lo comprueba.
- *Para decidirlo:* observar con el equipo si el título basta para detectar solapes, y decidir si hace falta algún dato más en la tarea o si es aceptable que dependa del hábito.

**PA-3. Qué ve cada persona en la lista: filtros, orden y tareas terminadas.**
- *Argumento:* los JTBD «ver qué está libre» y «elegir mi siguiente trabajo» piden ver «mis tareas» y «sin responsable», y RF-13 filtra solo por estado. El orden por defecto no está definido, y las tareas «hechas» se acumulan y empeoran el «de un vistazo».
- *Para decidirlo:* decidir el orden por defecto, si hay filtro por responsable y qué pasa con lo terminado (mostrarlo, ocultarlo o archivarlo). RF-13 no cambia.

**PA-4. Definición del día vencido (RF-14).**
- *Argumento:* «anterior a hoy» no es el mismo día para 3 husos horarios, y el «estado final» solo está supuesto en RF-8.
- *Para decidirlo:* elegir la zona horaria de referencia del espacio y confirmar los estados. La fecha de vencimiento sigue en E2.

**PA-5. Prioridad de la actualización en vivo (RF-16).**
- *Argumento:* es lo más caro del MVP, y el propio alcance dice que el equipo, en 3 husos, rara vez coincide conectado. Aun así, RF-16 está como requisito obligatorio, mientras la sección 4 dice que lo central es RF-17.
- *Para decidirlo:* confirmar con el equipo cuánto se solapan sus horarios y decidir si RF-16 es imprescindible o deseable.

**PA-6. Qué es «ver» y cuándo se borra la marca de cambiado (RF-17, RF-19).**
- *Argumento:* «ver» no está definido. Un vistazo rápido, o abrir la lista desde otro dispositivo, borra la marca sin que la persona haya leído nada, y no se recupera; el caso «vuelvo de una reunión» se rompe con un segundo vistazo. Tampoco dice si un cambio que llega en directo con la lista abierta se marca.
- *Para decidirlo:* elegir cuándo se considera vista la lista y si la marca se borra por tarea o en bloque. Probarlo con una persona real del equipo.

**PA-7. Umbrales que hoy no pueden fallar en una prueba (RNF-1, RNF-2).**
- *Argumento:* «sin recargar» no tiene límite de tiempo y RNF-1 cronometra sin decir cuánto es aceptable. Con esos textos, cualquier resultado pasa. Tampoco está definido qué pasa al reconectar tras suspender el portátil.
- *Para decidirlo:* observar el uso real del equipo, fijar los umbrales y decidir cómo se recupera el estado al volver.

**PA-8. Duración de la sesión (RF-5).**
- *Argumento:* «mientras siga siendo válida» no fija la duración. En el código, el proveedor de tokens no configura ninguna caducidad; no he comprobado el valor por defecto de la librería. Si expira pronto, quien abre la aplicación cada mañana se encuentra con el inicio de sesión.
- *Para decidirlo:* comprobar el valor por defecto real y decidir cuánto debe durar una sesión.

**PA-9. RF-1 frente a lo ya implementado.**
- *Argumento:* RF-1 dice «con nombre, correo y contraseña» y el resto del PRD afirma que el registro se reutiliza tal cual. En el código el nombre es opcional (el validador lo admite nulo y la pantalla lo envía vacío como nulo).
- *Para decidirlo:* decidir si el nombre pasa a ser obligatorio (entonces el registro deja de reutilizarse tal cual) o se corrige la redacción de RF-1.

**PA-10. Métrica principal y línea base.**
- *Argumento:* hay un solo equipo, simulado, y una semana es la ventana de mayor entusiasmo, no la de información que se queda vieja. Además la daily persiste por los bloqueos, y nadie ha medido cuánto dura hoy la ronda de «¿en qué estás?».
- *Para decidirlo:* medir esa ronda antes de empezar, fijar una ventana de observación más larga y acordar quién y cómo juzga «nadie pide que vuelva».

**PA-11. Umbrales y fuente de las métricas de apoyo.**
- *Argumento:* «la gran mayoría» no es un umbral. «Información al día» se comprueba preguntando a quien tiene incentivo a decir que sí. «Cero trabajo duplicado» en una semana no dice nada, porque el incidente original fue puntual. «Menos preguntas por chat» no tiene línea base.
- *Para decidirlo:* elegir umbrales, quién mide y con qué datos, o decir sin rodeos que estas métricas validan el diseño y no la adopción.

**PA-12. Requisitos añadidos que exceden el alcance consensuado.**
- *Argumento:* RF-15 (eliminar tareas), RF-18 (indicar qué cambió, que ya es un historial), RNF-8 (compatibilidad), RNF-9 (teclado) y RNF-10 (el último cambio gana en silencio, que es la misma pisada que el producto quiere evitar) no estaban en el alcance. RF-10 («integrante del espacio») implica una noción de pertenencia que el alcance descartó.
- *Para decidirlo:* decidir uno a uno si entran en el MVP, se posponen o se descartan.

**PA-13. Registro abierto y visibilidad de las tareas (RF-6).**
- *Argumento:* RF-6 dice que nadie ve tareas sin sesión, pero cualquiera puede registrarse y verlas todas. Si se despliega con datos reales, es una exposición.
- *Para decidirlo:* decidir si el registro se restringe (por invitación o cerrado) antes de usar datos reales, o si se mantiene abierto solo mientras sea un caso de estudio.

**PA-14. Valor esperado frente a coste.**
- *Argumento:* la daily se reduce, no desaparece. No se ha puesto cifra al ahorro (minutos de la ronda) frente al coste de migrar y mantener la lista.
- *Para decidirlo:* medir hoy la duración de la ronda y estimar el coste de mantener la lista con el equipo.
