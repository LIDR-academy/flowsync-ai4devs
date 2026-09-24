# FS-118. Fecha de vencimiento y tareas vencidas

**Identificador:** FS-118
**Épica:** E2. Gestión de tareas

**Como** integrante del equipo, **quiero** poner, cambiar o quitar la fecha de vencimiento de una tarea y ver destacadas las que se han pasado de plazo, **para** que el equipo vea los plazos de un vistazo y se actúe antes de que alguien tenga que reclamarlos.

Marcas: `[PROPUESTO]` es un criterio añadido para revisión; los demás salen directamente del PRD. `[SUPUESTO]` indica que depende de algo aún no decidido.

## Criterios de aceptación

### Camino feliz

**CA-1. Poner fecha al crear.**
- DADO que estoy creando una tarea
- CUANDO indico una fecha de vencimiento futura
- ENTONCES la tarea aparece en la lista con esa fecha y sin destacar como vencida.

**CA-2. Crear sin fecha.**
- DADO que estoy creando una tarea
- CUANDO no indico fecha de vencimiento
- ENTONCES la tarea se crea igualmente y aparece sin fecha.

**CA-3. Cambiar la fecha.**
- DADO una tarea con fecha de vencimiento
- CUANDO la cambio por otra fecha válida
- ENTONCES la lista muestra la nueva fecha y todas las personas del espacio ven la misma.

**CA-4. Poner fecha a una tarea que no la tenía.** `[PROPUESTO]`
- DADO una tarea sin fecha
- CUANDO le pongo una fecha válida
- ENTONCES la tarea muestra esa fecha.

**CA-5. Quitar la fecha.** `[PROPUESTO]`
- DADO una tarea con fecha de vencimiento, vencida o no
- CUANDO la dejo vacía
- ENTONCES la tarea aparece sin fecha y deja de estar destacada como vencida.

**CA-6. Cualquier persona puede tocar la fecha.**
- DADO una tarea creada por o asignada a otra persona
- CUANDO yo cambio su fecha
- ENTONCES el cambio se acepta, porque en el MVP todos editan lo mismo.

### Regla de lo vencido

**CA-7. Tarea vencida.**
- DADO una tarea con fecha de vencimiento anterior a hoy y que no está en el estado final (hoy, «hecha» `[SUPUESTO]`)
- CUANDO veo la lista
- ENTONCES esa tarea aparece destacada de forma visible como vencida.

**CA-8. Tarea terminada con plazo pasado.**
- DADO una tarea con fecha anterior a hoy que está en el estado final
- CUANDO veo la lista
- ENTONCES no aparece destacada como vencida.

**CA-9. Tarea sin fecha nunca vence.**
- DADO una tarea sin fecha de vencimiento
- CUANDO veo la lista
- ENTONCES nunca aparece destacada como vencida, sea cual sea su estado.

**CA-10. El propio día de vencimiento no es «vencida».** `[PROPUESTO]`
- DADO una tarea cuya fecha de vencimiento es hoy
- CUANDO veo la lista
- ENTONCES no aparece destacada como vencida; empieza a estarlo al día siguiente.

### Edge cases

**CA-11. Cambiar la fecha reevalúa el destacado.**
- DADO una tarea vencida
- CUANDO le pongo una fecha de hoy o futura
- ENTONCES deja de estar destacada. Y a la inversa: si le pongo una fecha pasada a una tarea no terminada, pasa a estar destacada.

**CA-12. Reabrir una tarea terminada.** `[PROPUESTO]`
- DADO una tarea terminada con fecha pasada
- CUANDO cambio su estado a uno no final
- ENTONCES pasa a estar destacada como vencida.

**CA-13. Terminar una tarea vencida.** `[PROPUESTO]`
- DADO una tarea vencida y destacada
- CUANDO la paso al estado final
- ENTONCES el destacado desaparece sin tocar su fecha.

**CA-14. Fecha pasada al crear.** `[PROPUESTO]`
- DADO que estoy creando una tarea
- CUANDO indico una fecha anterior a hoy
- ENTONCES se permite y la tarea aparece destacada como vencida; no se me impide apuntar trabajo atrasado.

**CA-15. El destacado sobrevive al filtro por estado.**
- DADO un filtro por estado activo
- CUANDO la lista muestra tareas vencidas de ese estado
- ENTONCES siguen destacadas, y quitar el filtro no cambia cuáles están vencidas.

**CA-16. Misma vista de vencidas para todo el equipo.** `[PROPUESTO]` `[SUPUESTO]`
- DADO un equipo repartido en varios husos horarios
- CUANDO dos personas miran la lista en el mismo momento
- ENTONCES ambas ven las mismas tareas destacadas como vencidas, porque la fecha es un día de calendario y no una hora. Falta decidir qué zona horaria fija cuándo empieza «hoy» (PA-4).

**CA-17. Dos personas cambian la fecha a la vez.** `[PROPUESTO]` `[SUPUESTO]`
- DADO una tarea que dos personas editan casi a la vez
- CUANDO ambas cambian su fecha
- ENTONCES la tarea queda con una sola fecha coherente y ambas ven el resultado final. Se asume que prevalece el último cambio (RNF-10, aún abierto en PA-12).

### Errores

**CA-18. Fecha que no es una fecha.**
- DADO que estoy poniendo o cambiando la fecha de una tarea
- CUANDO escribo algo que no es una fecha válida
- ENTONCES se me avisa en castellano junto a ese dato, no se guarda nada y la tarea conserva la fecha que tenía.

**CA-19. Un error al guardar no pierde la fecha anterior.** `[PROPUESTO]`
- DADO que cambio la fecha de una tarea
- CUANDO el cambio no se puede guardar (por ejemplo, por un fallo de conexión)
- ENTONCES se me avisa y la lista sigue mostrando la fecha anterior, sin dar a entender que se guardó lo nuevo.

**CA-20. Sin sesión no se toca nada.**
- DADO que no he iniciado sesión
- CUANDO intento ver o cambiar fechas de tareas
- ENTONCES se me lleva al inicio de sesión y no veo ninguna tarea.
