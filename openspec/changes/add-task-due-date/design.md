## Context

Ver `proposal.md` — Why. Lo que condiciona el diseño es el estado actual del código y tres restricciones que no se negocian.

Una tarea hoy es título, estado, responsable y fechas de auditoría. El estado se persiste como texto del dominio con el tipo estrechado en `database/schema_rules.ts`, los cambios sobre una tarea existente entran por controladores dedicados (`PATCH /tasks/:id/status`) y toda respuesta pasa por un transformer. La interfaz es una sola pantalla: la lista, que desde FS-142 se acota por estado con el filtro en la URL.

Las restricciones: **sin dependencias nuevas** (no hay componente de calendario ni se va a traer), **sin tests** (la verificación es manual), y **CA-11 y CA-12 son requisitos de que no pase nada**, así que el diseño tiene que hacer difícil incumplirlos, no solo prometerlo.

Y una que viene de la propia historia: CA-19 y CA-20 juntas obligan a que el vencimiento **se resuelva al mirar y contra el día de quien mira**. Ese es el eje del que cuelga casi todo lo demás.

## Goals / Non-Goals

**Goals:**

- Que el día de referencia sea siempre explícito y de quien consulta, sin que ningún camino pueda caer en el reloj del servidor por descuido.
- Que la regla de vencimiento exista escrita una sola vez.
- Que la comparación de fechas no pueda tener un día de más ni de menos por culpa de un huso horario.
- Que la lista sea estructuralmente incapaz de enseñar el vencimiento, no solo esté programada para no hacerlo.

**Non-Goals:**

- Recordatorios, avisos, notificaciones o cualquier forma de que el sistema se dirija a alguien por una fecha.
- Ordenar, filtrar o agrupar la lista por fecha de vencimiento.
- Fechas con hora, rangos, fechas de inicio o recurrencia.
- Historial de cambios de la fecha.

## Decisions

### 1. La fecha se guarda y se compara como un día en texto, `AAAA-MM-DD`

La columna se declara `date` y es nulable, pero el tipo generado se estrecha a `string | null` con una regla en `database/schema_rules.ts`, igual que ya se hizo con `status`. En TypeScript la fecha nunca es un `DateTime`.

El motivo es que dos fechas ISO en texto se comparan con `<` y esa comparación **es** la comparación de días del calendario: no hay hora, ni huso, ni instante intermedio donde meter un día de más. Es el mismo tipo de decisión que estrechar `status`: hacer que el tipo impida el error en vez de confiar en recordarlo.

*Alternativa descartada:* `@column.date()` con luxon, que es lo idiomático en Lucid. Cada lectura sería un `DateTime` con hora y zona, y decidir si «es anterior a hoy» pasaría por normalizar a inicio de día — exactamente la operación donde vive el bug que la historia marca como el más peligroso de FS-118.

*A verificar al implementar:* que el driver de SQLite devuelve la columna `date` como el texto que se escribió y no como otra cosa. Si la interpretara, se cambia a una columna de texto de 10 caracteres; el resto del diseño no se entera.

### 2. La regla de vencimiento es un método del modelo, y recibe el día

```
isOverdueOn(referenceDay) = dueDate !== null
                         && status !== 'hecho'
                         && dueDate < referenceDay
```

Escrita una sola vez, en el dominio, y con `<` estricto: **vencer hoy no es estar vencida** (CA-5). Ninguna otra capa la reimplementa, y en particular el frontend nunca compara fechas.

Que reciba el día en lugar de leer un reloj es lo que hace imposible el fallo de CA-19: la función no tiene acceso a «hoy», así que no puede equivocarse de «hoy». Y como se evalúa en cada lectura, CA-20 sale gratis: la misma tarea sin tocar da otra respuesta al día siguiente porque el día que se le pasa es otro.

*Alternativa descartada:* guardar un `is_overdue` calculado al escribir. Congelaría el vencimiento en el momento de guardar, que es justo lo que CA-19 y CA-20 prohíben.

### 3. El día de referencia viaja como parámetro obligatorio, sin valor por defecto

Toda petición que informe del vencimiento lleva `today=AAAA-MM-DD`, y si falta la respuesta es `422`.

Que sea obligatorio es deliberado y es el corazón del diseño. Un valor por defecto —el día del servidor— sería un camino silencioso hacia el incumplimiento de CA-19: funcionaría en todas las pruebas hechas desde el mismo huso, y fallaría solo en producción y solo para quien estuviera lejos. Un `422` ruidoso el primer día vale más que un bug que no se manifiesta hasta que alguien cruza la medianoche.

*Alternativa descartada:* deducir el huso de una cabecera o del token. Es adivinar; y el día local depende del huso del dispositivo, que solo el cliente conoce con certeza.

### 4. El vencimiento se valida de verdad, no solo con un patrón

`2026-02-31` encaja en cualquier expresión regular de forma `AAAA-MM-DD` y no existe. Se valida con `vine.date({ formats: 'YYYY-MM-DD' })`, que comprueba el calendario, y el resultado se reduce a `AAAA-MM-DD` en el acto: el `DateTime` que devuelve el validador no sobrevive al borde del controlador.

*A verificar al implementar:* que un día imposible se **rechaza** y no se **desplaza** silenciosamente al día siguiente. Si el parser lo desplazara, se añade una comprobación de ida y vuelta —reformatear y comparar con lo recibido— antes de aceptarlo. Sin esta verificación, `2026-02-31` podría guardarse como `2026-03-03` y el criterio se incumpliría en silencio, que es el peor final posible.

### 5. Dos transformers, y el de la lista no sabe qué es una fecha de vencimiento

`TaskTransformer` (la lista) se queda **exactamente como está**. El detalle usa uno nuevo que añade la fecha y la condición de vencida, y que recibe el día de referencia como segundo argumento de construcción —algo que `BaseTransformer` ya soporta de serie.

Así CA-11 deja de ser una promesa: la lista no puede enseñar el vencimiento porque el objeto que devuelve no lo contiene. Es la misma decisión que en su día hizo que `TaskAssigneeTransformer` no reutilizara `UserTransformer` para no arrastrar el email.

*Alternativa descartada:* un solo transformer con la fecha siempre incluida y la interfaz encargada de no pintarla. Convierte un requisito estructural en una convención, y las convenciones se rompen en la siguiente pantalla que consuma la lista.

### 6. Fijar y retirar la fecha son la misma operación

`PUT /api/v1/tasks/:id/due-date`, con `{"dueDate": "AAAA-MM-DD"}` o `{"dueDate": null}`. Quitar no es un `DELETE` aparte: es poner el valor «sin fecha», que es un valor legítimo del campo y no la ausencia del recurso. Un controlador dedicado, como `TaskStatusesController`.

*Alternativa descartada:* `PATCH /tasks/:id` genérico. Abriría la puerta a editar cualquier campo, y este change no permite cambiar ni el título ni el responsable.

### 7. La interfaz usa el campo de fecha nativo del navegador

`<input type="date">`. Cero dependencias, localizado por el navegador, operable con teclado, y su valor es siempre `AAAA-MM-DD` o vacío — el mismo formato que habla la API, sin conversiones por medio. Resuelve la decisión que FS-118.4 pedía tomar antes de empezar.

*Alternativa descartada:* traerse un calendario de shadcn, que arrastra `react-day-picker` y `@radix-ui/react-popover`. Prohibido por el encargo, y desproporcionado para un campo que se rellena a lo sumo una vez por tarea.

### 8. Vaciar el campo no borra la fecha; para eso hay un botón

Un `<input type="date">` a medio escribir vale exactamente lo mismo que uno vacío: cadena vacía. Si el vacío se interpretara como «quitar», escribir una fecha a medias **borraría la que había en silencio** — que es justo lo que CA-14 prohíbe.

Así que el vacío no dispara nada, y retirar la fecha es un botón explícito de «Quitar fecha» que solo aparece cuando hay una. Sin diálogo de confirmación (CA-15) y sin botón de guardar (CA-16): se guarda al elegir una fecha completa, y al pulsar el botón.

Efecto secundario que conviene saber: con el campo nativo, una fecha imposible es prácticamente inalcanzable desde la interfaz —el navegador no la produce—, así que **CA-14 se verifica contra la API, no contra la pantalla**. La pantalla sigue sabiendo pintar el error por campo si llega, pero no es el camino por el que se comprueba.

### 9. El cambio de fecha es optimista, con vuelta atrás

Igual que el cambio de estado: se pinta antes de que conteste el servidor y, si falla, la pantalla vuelve a la fecha real y se avisa. «Al instante» (CA-2) no admite esperar a la red, y una pantalla que miente es peor que una lenta.

### 10. Se llega a la tarea desde el título de su fila

El título de cada fila pasa a ser un enlace a `/tasks/:id`. Los botones de estado siguen donde están y haciendo lo mismo: cambiar el estado sigue sin requerir abrir la tarea.

*Alternativa descartada:* hacer clic en toda la fila. Convertiría los tres botones de estado en zonas muertas dentro de una superficie pulsable, que es una trampa clásica.

## Risks / Trade-offs

- **El día de más de CA-5.** Un `<=` en lugar de `<` incumple el criterio y nada falla ruidosamente. → La regla está en un solo sitio y con la comparación escrita en texto ISO; la verificación manual tiene que incluir explícitamente el caso «fecha igual a hoy».

- **Sin tests, los dos riesgos que la historia marca como graves quedan sin red.** FS-118.2 pedía pruebas de los cuatro bordes y de dos días de referencia distintos; no se van a escribir. → El diseño empuja el riesgo hacia sitios donde un error es visible pronto: parámetro obligatorio (falla ruidosamente), comparación en texto (no hay huso que interpretar), regla en un solo sitio (un fallo se arregla en un sitio). Aun así, **este es el riesgo residual más alto del change** y se asume a conciencia.

- **El parser de fechas podría desplazar un día imposible en vez de rechazarlo.** → Verificación explícita al implementar, con la comprobación de ida y vuelta como plan B. Es una tarea, no una nota.

- **`today` obligatorio hace la API menos cómoda de probar a mano** y rompería a cualquier cliente que llamara al detalle sin él. → Es un endpoint nuevo, así que no hay nada que romper; y la incomodidad es el precio de que no exista un camino por defecto que incumpla CA-19.

- **CA-4 sigue marcado como PROPUESTO.** Se construye una señal propia con texto y no solo color, sin validar. → Vive en un solo sitio de la pantalla de detalle; si la señal cambia, se cambia ahí.

- **La lista y el detalle piden la tarea por separado**, así que al volver de editar una fecha la lista se recarga entera. → Irrelevante al tamaño de este producto, y mantiene la lista sin saber nada del vencimiento, que es lo que se quería.

- **CA-18 no se puede verificar**: no existe reasignación de responsable. → Se deja escrito en la propuesta para que nadie dé la historia por cubierta del todo.

## Migration Plan

Una migración que añade la columna nulable a `tasks`. No toca las filas existentes: todas quedan sin fecha, que es un valor válido y el estado normal de una tarea. El reverso elimina la columna y deja el esquema como estaba.

El esquema generado se regenera con el comando del proyecto y se commitea; no se edita a mano. La base de desarrollo y la de pruebas son el mismo fichero, así que migrar toca también el estado local.

Como la columna es nulable y ningún endpoint anterior la consulta, el backend nuevo convive con la interfaz vieja: nada se rompe entre el momento de migrar y el de desplegar la pantalla.
