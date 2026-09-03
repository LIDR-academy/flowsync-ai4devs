## 1. Persistir la fecha de vencimiento

- [x] 1.1 Crear la migración que añade a `tasks` una columna de fecha de vencimiento nulable, con su reverso que la elimina y deja el esquema como estaba
- [x] 1.2 Añadir en `database/schema_rules.ts` la regla que estrecha esa columna a `string | null` en el esquema generado, repitiendo los decoradores (una regla de columna sustituye al tipo por defecto, no se fusiona con él)
- [x] 1.3 Ejecutar la migración con el comando del proyecto y commitear el `database/schema.ts` regenerado, sin editarlo a mano
- [x] 1.4 Comprobar sobre la base ya poblada que las tareas anteriores siguen siendo válidas y quedan sin fecha, y que al leerlas la columna llega como el texto `AAAA-MM-DD` y no como otra cosa (decisión 1 del diseño: si el driver la interpretara, pasar a columna de texto)

## 2. La regla de vencimiento, en el dominio

- [x] 2.1 Añadir al modelo de tarea el método que decide si está vencida a partir de un día de referencia recibido, con las tres condiciones y la comparación **estricta** —vencer hoy no es estar vencida
- [x] 2.2 Comprobar a mano los cuatro bordes de la regla (día anterior, mismo día, día posterior y sin fecha) y que una tarea en `done` con la fecha pasada no está vencida

## 3. API: leer una tarea y fijar su fecha

- [x] 3.1 Escribir el validador del día de referencia `today`: obligatorio, día real del calendario, sin valor por defecto
- [x] 3.2 Escribir el validador de la fecha de vencimiento, que acepta un día real del calendario o `null`, y reducir el resultado a `AAAA-MM-DD` antes de que salga del controlador
- [x] 3.3 Verificar que un día imposible como `2026-02-31` se **rechaza** y no se desplaza en silencio a otro día; si el parser lo desplazara, añadir la comprobación de ida y vuelta descrita en la decisión 4
- [x] 3.4 Crear el transformer del detalle de una tarea, que añade la fecha y la condición de vencida y recibe el día de referencia al construirse; dejar el transformer de la lista intacto
- [x] 3.5 Añadir el endpoint de consulta de una tarea suelta, con `404` si no existe
- [x] 3.6 Añadir el endpoint que fija, cambia y retira la fecha, devolviendo la tarea ya actualizada
- [x] 3.7 Registrar ambas rutas bajo el grupo de tareas, con sesión obligatoria y sin comprobar propiedad
- [x] 3.8 Confirmar que la respuesta de la lista sigue sin traer fecha ni condición de vencida, y que sigue sin exigir día de referencia
- [x] 3.9 Arrancar el servidor para regenerar los tipos del cliente y commitear el diff de `.adonisjs/`
- [x] 3.10 Verificar contra el servidor real: fijar, cambiar y retirar; fecha pasada aceptada; fecha inválida rechazada señalando el campo y sin tocar la que había; `today` ausente e inválido; tarea inexistente; sin sesión; y que cambiar la fecha no altera título, estado ni responsable
- [x] 3.11 Dejar el backend en verde de lint, formato y typecheck

## 4. Capa de acceso a la API en el frontend

- [x] 4.1 Añadir a los tipos compartidos la fecha de vencimiento y la condición de vencida del detalle de una tarea, sin tocar el tipo que usa la lista
- [x] 4.2 Añadir al único punto de contacto con la API la consulta de una tarea suelta y el fijado de su fecha, incluyendo el día local de quien mira en las peticiones que lo necesiten
- [x] 4.3 Traducir al castellano los errores nuevos de fecha y de día de referencia, reutilizando el mecanismo de errores por campo que ya existe

## 5. Pantalla de la tarea

- [x] 5.1 Crear la pantalla de una tarea con su título, responsable, estado y fecha, bajo la ruta protegida `/tasks/:id`
- [x] 5.2 Enlazar a esa pantalla desde el título de cada fila de la lista, dejando los botones de estado como están
- [x] 5.3 Añadir la forma visible de volver a la lista
- [x] 5.4 Resolver la tarea que no existe con una explicación y la vuelta a la lista, en lugar de una pantalla vacía o en carga perpetua
- [x] 5.5 Añadir el campo de fecha nativo, que guarda al elegir una fecha completa, sin botón de guardar y de forma optimista con vuelta atrás si el servidor lo rechaza
- [x] 5.6 Añadir el botón de quitar la fecha, visible solo cuando hay una, sin diálogo de confirmación; el campo vacío por sí solo no borra nada
- [x] 5.7 Añadir la señal de tarea vencida con texto además de color, y comprobar que no aparece con la fecha de hoy ni en una tarea hecha
- [x] 5.8 Comprobar que una tarea sin fecha no recibe aviso, recordatorio ni marca de que le falte algo, ni en la lista ni abierta
- [x] 5.9 Confirmar que la lista sigue sin mostrar fechas ni marcas de vencida, y que crear una tarea sigue sin pedir ni sugerir fecha
- [x] 5.10 Dejar el frontend en verde de formato, lint y build

## 6. Verificación de punta a punta

- [ ] 6.1 Recorrer en el navegador el camino completo: abrir una tarea, ponerle fecha, verla reflejada al instante, cerrarla y volver a abrirla para comprobar que se guardó sola
- [ ] 6.2 Comprobar la regla con las tres fechas: una de ayer marca la tarea como vencida, la de hoy no, y una futura tampoco
- [ ] 6.3 Comprobar que marcar como hecha una tarea vencida deja de mostrarla vencida y le conserva la fecha, y que aplazarla también resuelve el vencimiento
- [ ] 6.4 Comprobar con dos cuentas que cualquiera puede poner y quitar la fecha de una tarea ajena
- [x] 6.5 Comprobar el paso del día llamando a la API con dos días de referencia distintos sobre la misma tarea sin tocarla: una lectura vencida y otra no, ambas correctas
- [ ] 6.6 Recorrer la pantalla de la tarea solo con el teclado, incluidos el campo de fecha y el botón de quitarla

## Lo que no se ejecutó

> Añadido el 2026-09-02 al cerrar **H-18**. Cinco casillas sin marcar, todas de verificación a mano, y el change se archivó igual.

| Casilla | Qué pasó |
|---|---|
| 6.1 · el camino completo en navegador | Sin ejecutar entonces. Recorrido el 2026-09-02 |
| 6.2 · la regla con las tres fechas | **Sin ejecutar, y es el caso que enseña.** La regla comprobaba dos de sus tres condiciones. Se registró como **H-15**, y la habría cazado esta casilla |
| 6.3 · una tarea hecha deja de mostrarse vencida | Sin ejecutar. Es literalmente H-15. Cubierto ahora por `vencimiento.spec.ts` |
| 6.4 · dos cuentas sobre una tarea ajena | Sin ejecutar. Cubierto después por `lista_compartida.spec.ts` |
| 6.6 · la pantalla solo con teclado | Sin ejecutar, y **sigue sin cubrir**: no hay runner de navegador |

**La lección**: dos de las cinco describían exactamente el defecto que se escapó. Estaban escritas, en el sitio correcto, y sin ejecutar.
