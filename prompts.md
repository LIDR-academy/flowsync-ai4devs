Lee el siguiente contexto sobre el producto que se está construyendo en este proyecto . Dime si tienes preguntas adicionales qué realizar para pasar a la construcción de historias y la construcción del primer MVP
- Qué duele hoy: la daily de sincronización y el "¿en qué estás?" constante por Slack/chat. Nadie ve el estado del equipo sin interrumpir a alguien.
- Quién cobra el valor: los pares, no un lead. No hay reporte hacia arriba y a un manager le daría igual. Duele a los dos devs que descubren tarde que iban a lo mismo, y al que interrumpe a otro para preguntar.
- Episodio concreto: dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Dos días perdidos.
- Qué reunión desaparece (respuesta honesta, no la vendas de más): la daily NO desaparece entera. Desaparece la ronda de "¿en qué estás?", que hoy se come la mitad de los 15 minutos. La parte de bloqueos sigue, y este MVP no la resuelve.
- Usuarios / equipo: equipos remotos pequeños, 3–10 personas. Roles planos: en el MVP todos ven y editan lo mismo, sin jerarquía de permisos.
- Primer usuario concreto: equipo de 6 personas de producto SaaS, en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada. Es un CASO DE ESTUDIO, no un cliente real.
- Fronteras: un espacio único compartido, sin entidad "equipo". Varios equipos separados, o gente en más de uno, queda FUERA del MVP: se anota como supuesto en el PRD, no se construye.
- "Tiempo real" = ver los cambios de estado de las tareas sin refrescar ni preguntar. NO es chat, NO es videollamada, NO es colaboración simultánea sobre el mismo documento.
- Es frescura, no presencia: el estado es de la TAREA, no de la persona. Nada de "quién está conectado ahora" ni indicadores de actividad; eso es vigilancia y lo rechazamos a propósito.
- Forma de la señal: resumen que espera, no aviso que interrumpe. El caso es "llego por la mañana o vuelvo de una reunión y veo qué se ha movido". Sin notificaciones push.
- Qué decisión cambia: no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre. Si la única respuesta fuera "sentirse informado", el tiempo real no valdría lo que cuesta.
- De dónde sale el estado: lo teclea la persona que hace la tarea, en segundos. Derivarlo de señales externas (Git/PRs, CI, calendario) está FUERA del MVP: es otro producto, con integraciones y OAuth de terceros.
- Por qué se sostiene: no porque sea más agradable, sino porque son dos clics sobre una lista ya abierta, sin campos obligatorios, sin decidir sprint ni estimación. Y quien lo escribe cobra en el momento: esa misma lista es su cola de trabajo, la mira para decidir qué coge, y de paso deja de recibir interrupciones preguntándole cómo va. Si el beneficio fuera solo para los demás, no lo escribiría.
- Si la información se queda vieja: el producto pierde el sentido, y lo asumo. Es el riesgo #1 a validar, no un detalle. La mitigación es que actualizar cueste dos clics, no obligar a nadie.
- Es donde se hace el trabajo, no donde se cuenta: sustituye al gestor de tareas, no convive con él. FlowSync crea las tareas, no lee las de otro sitio. Convivir exigiría doble actualización, que es como muere esta categoría.
- Renuncia explícita a sprints, estimaciones, épicas, backlog priorizado e informes. Un equipo que necesite eso no es nuestro usuario.
- "Menos rollo que Jira" = crear una tarea y cambiarle el estado en segundos, sin flujos de configuración ni campos obligatorios. Lo mínimo para saber quién está en qué.
- Qué necesita una tarea en el MVP: título, responsable, estado y fecha de vencimiento. La fecha, para ver de un vistazo qué se ha pasado de plazo.
- Cómo se consume la lista: filtrando por estado, para centrarse en lo pendiente.
- Éxito para el usuario: dejar de hacer la ronda de "¿en qué estás?" de la daily porque el estado del equipo se ve de un vistazo.
- Criterio a una semana de uso real: que el equipo cancele esa ronda y nadie pida que vuelva. Si la siguen haciendo igual, no funcionó.
- Cuánto construir: una vertical fina y usable de punta a punta, no el andamiaje amplio de un producto. Prefiero una capability terminada a tres a medias.
Veredicto: quitar los filtros se puede defender. Quitar la última actualización, en mi opinión, no. Además, esta historia es la más barata de las dos.

Sin filtros: defendible, si sigue habiendo orden
A favor:

Con 3–10 personas la lista es corta y se recorre con la vista.
La HU-02 ya ordena por estado (en curso → pendiente → hecho) y cada fila muestra "Libre" o el responsable. Las dos decisiones que queremos cambiar, "¿quién está en esto?" y "¿qué está libre?", se responden mirando.
Riesgos:

Las tareas hecho se acumulan sin fin. A las pocas semanas lo terminado entierra lo vivo, y el "vistazo" deja de ser un vistazo. Este es el problema real, más que la falta de filtros.
Contradice tu propio contexto, que decía "cómo se consume la lista: filtrando por estado". Conviene anotar en el PRD que ha cambiado y por qué.
Mitigación sin filtros: que la sección hecho salga plegada por defecto, o que solo muestre las de los últimos 7 días. No es un filtro, es un valor por defecto, y cuesta muy poco.

Sin última actualización: poco defendible
En contra:

Es la única mitigación visible del riesgo #1. Sin ella, un estado de hace 5 días se ve igual que uno de hace 5 minutos. La lista afirma algo falso con total seguridad, y eso es peor que no tener lista.
Rompe justo la decisión que el producto quiere cambiar. Por ejemplo, "está en curso con Ana, no lo toco" puede ser una tarea que Ana abandonó hace una semana. Es otra forma del episodio de los dos días perdidos.
El tiempo real no la sustituye. El tiempo real cubre lo que pasa mientras tienes la lista abierta. El caso principal, "llego por la mañana y veo qué se ha movido", necesita saber desde cuándo.
Te quedas sin la señal para validar el riesgo #1. La métrica de la semana de prueba ("¿las tareas en curso tienen menos de un día?") deja de poder observarse.
Coste casi nulo. updated_at ya existe en toda tabla de Lucid. Mostrar "hace X" es una columna en la fila.
Además, en tu mensaje anterior pediste explícitamente que fuera en cada tarea.
Si el objetivo es recortar, propongo una versión mínima: solo "hace X", sin "por Nombre" y sin el tooltip en UTC. Así desaparecen la columna updated_by_id y su lógica, y se conserva lo que protege al producto.

Propuesta
Filtros: fuera del MVP, con hecho plegado por defecto.
Última actualización: dentro, en la versión mínima.
Cuando me confirmes la decisión, actualizo el PRD y las historias en la rama feat/prd-mvp-tareas.

ok, sólo vas a mostrar el campo del timestamp de última modificación.


Ejecutado 3 comandos
He actualizado el PRD y las historias en la rama feat/prd-mvp-tareas y los he subido:

Última modificación: cada tarea muestra solo la fecha y hora de su último cambio en UTC (p. ej. 2026-09-23 14:05 UTC), sin decir quién lo hizo. He dado por hecho que querías la hora exacta y no "hace X"; si prefieres el formato relativo, es un cambio de una línea. Como ya no se registra el autor, sale la columna updated_by_id del diseño de la tabla.
Filtros: la historia de filtros (HU-05) queda aplazada en "Siguiente iteración", con sus criterios intactos. La lista tiene orden fijo (en curso → pendiente → hecho, y dentro de cada estado primero lo modificado más recientemente). La sección hecho sale plegada por defecto.
PRD: ambas decisiones figuran en "Fuera" con su motivo, incluido que el contexto inicial pedía filtrar por estado.
El PR sigue sin abrir porque gh no tiene sesión iniciada. Puedes abrirlo tú desde este enlace: https://github.com/rmartinez-nomilinea-com-mx/flowsync-ai4devs/compare/s2/start...feat/prd-mvp-tareas?expand=1

O inicia sesión con el comando de abajo y lo abro yo:

gh auth login
Necesito que recortes el alcance lo más posible, acotándolo a estas cinco secciones, detallando el NO-alcance lo más posible.

Problema · usuarios · propuesta de valor · alcance · NO-alcance.


Editado 2 archivos, ejecutado 2 comandos, leyó 2 archivos
+110
-191
He reescrito el PRD en las cinco secciones: problema, usuarios, propuesta de valor, alcance y NO-alcance. Las historias bajan de 8 a 5 y ya están subidas a la rama feat/prd-mvp-tareas.

Alcance que queda (6 puntos):

Crear una tarea solo con el título.
Ver la lista, con el orden fijo por estado y hecho plegado.
Cambiar el estado.
Coger una tarea libre, con rechazo si otra persona la cogió antes.
Soltar una tarea.
La lista se refresca sola.
La última modificación en UTC se muestra en cada tarea.

Recortes nuevos respecto a la versión anterior (cada uno está justificado en el NO-alcance):

Fecha de vencimiento. Estaba en tu contexto inicial. La saco porque no ayuda a decidir ni "no empezar lo que otro tiene" ni "qué está libre".
Editar el título y borrar tareas. Lo erróneo o terminado se pasa a hecho.
Asignar una tarea a otra persona. Solo existen "Coger" y "Soltar", sin nadie que reparta trabajo. "Soltar" lo puede usar cualquiera, para que una tarea abandonada no se quede bloqueada.
Tiempo real por SSE. Lo sustituye un refresco automático de la lista cada 30 s como máximo y al volver a la pestaña. La promesa de "ver cambios sin recargar ni preguntar" se mantiene; lo que se pierde es la inmediatez, y sale mucho más barato.
Si alguno de los recortes nuevos te parece excesivo, se puede volver a meter; el que más peso tenía en tu contexto era la fecha de vencimiento.

El PR sigue sin abrir porque gh no tiene sesión iniciada. Puedes abrirlo desde este enlace: https://github.com/rmartinez-nomilinea-com-mx/flowsync-ai4devs/compare/s2/start...feat/prd-mvp-tareas?expand=1

O inicia sesión con el comando de abajo y lo abro yo con la revisión adversarial:

gh auth login

Editó 2 archivos
+110
-191

prd-mvp.md
+68
-82

historias-mvp.md
+42
-109
