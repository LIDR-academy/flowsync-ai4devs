## Context

Ver `proposal.md` — Why. Este documento describe **decisiones ya tomadas y ya implementadas**: se escribe en pasado y en indicativo, no como plan.

Lo que condicionaba el diseño cuando se hizo: la lista era una sola consulta sin parámetros que devolvía todo el espacio; el estado ya existía como los tres valores fijos del dominio, declarados en el modelo y reutilizados por los validadores; toda respuesta pasa por un transformer; y la validación de entrada es VineJS, que ya produce errores por campo que el frontend sabe repartir. Filtrar no necesitaba nada nuevo que almacenar.

Dos restricciones marcaron el resultado: **sin tests** (la verificación fue manual) y la advertencia explícita de la historia de que perder la distinción entre *filtro inválido* y *filtro sin resultados* es un fallo que ya no se recupera en capas superiores.

## Goals / Non-Goals

**Goals:**

- Que un estado inventado sea **estructuralmente incapaz** de convertirse en una lista vacía, y no solo esté programado para no serlo.
- Que la vista por defecto sea una decisión de producto escrita y localizable, no un efecto colateral de otra cosa.
- Que marcar algo como hecho lo saque de la vista al instante, sin volver a pedir la lista.
- Que un vacío en pantalla diga siempre por qué está vacío.

**Non-Goals:**

- Ordenación propia de la vista acotada (pendiente de **PA-3**).
- Acotar por cualquier cosa que no sea el estado.
- Lista viva: nada se recompone por lo que hagan otras personas.
- Persistir el filtro entre visitas.

## Decisions

### 1. `status` es un parámetro opcional validado contra el enum, y el `optional()` es toda la decisión

`listTasksValidator` declara `status: vine.enum(TASK_STATUSES).optional()`. Ese `optional()` es lo que mantiene separados los dos caminos que nunca deben juntarse: *no pedir filtro* produce `undefined` y lleva a la vista por defecto; *pedir uno que no existe* no llega nunca al controlador, porque el validador corta con un `422` que señala el campo `status`.

**Alternativa descartada:** leer el parámetro en el controlador y comprobarlo a mano (`if (!TASK_STATUSES.includes(status)) ...`). Funciona, pero deja al alcance de una línea el fallo que la historia señala como irrecuperable: bastaría con un `else` que no devuelva nada para responder vacío en silencio. Con el validador delante, responder vacío a un estado inventado exigiría quitar el validador, que es un cambio que se ve.

El parámetro llega por query string y no por cuerpo, pero se valida igual porque el validador corre sobre `request.all()`, que mezcla ambos.

### 2. La vista por defecto se escribe explícita, no como una resta

`DEFAULT_LIST_STATUSES = ['pending', 'in_progress']` vive en el modelo, escrita entera.

**Alternativa descartada:** derivarla como `TASK_STATUSES` menos `'done'`. Es más corta y expresa lo contrario de lo que se quiere decir: qué merece ocupar la pantalla es una decisión de producto, no el resultado de quitar un elemento de una lista. Si mañana apareciera un cuarto estado, la resta lo metería en la vista por defecto sin que nadie lo hubiera decidido.

### 3. El filtro se aplica en la consulta, no sobre el resultado

El controlador ramifica antes de ejecutar: `where('status', status)` si hay filtro, `whereIn('status', DEFAULT_LIST_STATUSES)` si no. La lista sigue llegando entera y sin paginar dentro del alcance pedido, y el orden no cambia entre alcances.

### 4. El filtro vive en la URL, y eso resuelve a favor de CA-9 una incompatibilidad que la historia dejaba abierta

FS-142 señala que **CA-9 y CA-17 son incompatibles tal y como están escritas**: la primera exige poder llegar a la lista con un estado pedido desde fuera de la interfaz (filtro direccionable), la segunda exige que recargar devuelva a la vista por defecto.

Se resolvió a favor de CA-9: el estado va en `?status=` y se lee con el enrutador. Eso da gratis tres cosas que un estado interno no da —enlace compartible, «atrás» que deshace el filtro, y un camino real por el que llega un estado inventado, que deja de ser una hipótesis— y es lo que hace que el tercer camino del backend tenga un usuario de verdad.

**Desviación consciente respecto a CA-17:** recargar una dirección que lleva `?status=done` mantiene ese filtro. Lo que sí se cumple es la mitad que protege la promesa del producto: el filtro **no se guarda en ninguna parte** —ni en almacenamiento del navegador ni en el servidor—, así que entrar en `/tasks` sin pedir nada da siempre la vista por defecto, y nadie se encuentra con un «Hecho» pegado de ayer sin haberlo pedido. Queda anotado para que la conversación de producto que la historia pedía se tenga sobre lo que hay, no sobre lo que se supone.

### 5. El mismo predicado en las dos capas, a sabiendas de que está duplicado

El frontend repite `DEFAULT_LIST_STATUSES` y aplica el filtro también al pintar (`matchesFilter`). No es redundancia inútil: es lo que permite que marcar una tarea como hecha saque la fila **en el acto**, sin volver a pedir la lista, y que el estado se pinte antes de que conteste el servidor.

**Trade-off aceptado:** dos definiciones del mismo conjunto que tienen que coincidir y que nada comprueba automáticamente. La alternativa —recargar la lista tras cada cambio de estado— evita la duplicación a cambio de un viaje a la red donde el requisito pide inmediatez. Se documenta el riesgo en lugar de fingir que no existe.

### 6. Cuatro finales para una lista sin filas, y ninguno reutiliza el mensaje de otro

Una lista sin filas se resuelve en este orden, y cada rama tiene su propio texto:

1. **Filtro inválido** → aviso de error, que dice explícitamente que el problema es lo pedido y no la ausencia de trabajo, con un botón para volver a la vista por defecto.
2. **Filtro válido sin resultados** → «No hay ninguna tarea en «X»», sin tono de error.
3. **Vista por defecto vacía con tareas hechas** → «No queda nada pendiente ni en curso», con cuántas hay hechas y un camino para verlas.
4. **Espacio realmente vacío** → la bienvenida de siempre.

El error de filtro inválido se guarda en su propio estado (`invalidFilter`), separado del error genérico de carga, precisamente para que no puedan compartir salida. La rama 3 exige saber cuántas tareas hechas hay: se resuelve con una segunda consulta acotada por `done`, **solo** cuando la vista por defecto ha vuelto vacía y no hay filtro puesto. Es el único caso en que se paga esa consulta, y es el caso en que confundirse cuesta contarle al equipo que no ha hecho nada.

### 7. Botones nativos para el control, no un desplegable

El control son botones con `aria-pressed`, dentro de un grupo etiquetado. Se recorren y se accionan con el teclado sin escribir una línea de comportamiento propio, elegir uno sustituye al anterior por construcción, y el estado aplicado se anuncia. La primera opción se llama «Pendientes y en curso» y no «Todas» — un «Todas» devolvería a la pantalla justo lo que el filtro existe para quitar de en medio.

El valor que recibe el control se declara `string | null` y no `TaskStatus | null`: viene de la URL y puede ser cualquier cosa. Si no es ninguno de los tres, no se marca ninguna opción, que es la lectura correcta de lo que se está mostrando.

## Risks / Trade-offs

- **Fundir «filtro inválido» con «filtro sin resultados»** → hoy están separados en tres sitios a la vez (validador, estado propio en la pantalla, mensajes distintos). Cualquier simplificación que los junte reintroduce el fallo silencioso que la historia marca como irrecuperable.
- **`DEFAULT_LIST_STATUSES` duplicado en backend y frontend** → si divergen, una tarea puede quedarse pintada en una vista de la que el servidor ya la excluye. Sin test que lo sujete; los dos sitios están comentados apuntándose el uno al otro.
- **Sin tests** → los dos riesgos anteriores son exactamente los que FS-142.1 pedía cubrir con pruebas de integración de los cuatro caminos. La verificación fue manual.
- **La vista de «Hecho» crece sin límite y sin orden propio** → es el único conjunto que solo aumenta, y la lista no pagina. Con el tiempo esa vista se vuelve poco útil; depende de **PA-3**, que sigue sin decidir.
- **La segunda consulta del caso 3** → una petición extra en el momento más tranquilo posible (la vista por defecto está vacía). Si falla, se trata como cero tareas hechas y se cae al mensaje de espacio vacío.

## Open Questions

- **PA-3, el orden dentro de la lista acotada.** No cambia nada de lo especificado aquí: hoy el orden es el mismo en todos los alcances.
- **CA-17 frente a CA-9.** La decisión 4 documenta lo construido; si producto prefiere lo contrario, lo que cambia es de dónde se lee el filtro, no el contrato de la API.
