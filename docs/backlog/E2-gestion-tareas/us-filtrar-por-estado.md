# FS-142. Filtrar las tareas por estado

**Identificador:** FS-142
**Épica:** E2. Gestión de tareas

**Como** integrante del equipo, **quiero** filtrar la lista de tareas por estado **para** centrarme en lo pendiente sin recorrer toda la lista.

Marcas: `[PROPUESTO]` es un criterio añadido para revisión; los demás salen directamente del PRD. `[SUPUESTO]` indica que depende de algo aún no decidido. Los estados usados son los supuestos del PRD: pendiente, en curso y hecha.

## Criterios de aceptación

### Camino feliz

**CA-1. Filtrar por un estado.**
- DADO que veo la lista completa
- CUANDO filtro por un estado
- ENTONCES solo se ven las tareas que están en ese estado.

**CA-2. Quitar el filtro.**
- DADO un filtro por estado activo
- CUANDO lo quito
- ENTONCES vuelve la lista completa, con todas las tareas de todos los estados.

**CA-3. Cambiar de un filtro a otro.** `[PROPUESTO]`
- DADO un filtro por estado activo
- CUANDO elijo otro estado
- ENTONCES se ven solo las tareas del nuevo estado, sin arrastrar las del anterior.

**CA-4. Las opciones son los estados que existen.** `[PROPUESTO]`
- DADO que abro el filtro
- CUANDO veo las opciones
- ENTONCES aparecen exactamente los estados que existen para las tareas, ni más ni menos.

### Errores

**CA-5. Estado que no existe.**
- DADO que pido ver las tareas de un estado que no existe (por ejemplo, desde un enlace guardado o escrito a mano)
- CUANDO se aplica ese filtro
- ENTONCES se me avisa con un mensaje claro en castellano de que ese estado no existe, y **no** se me muestra una lista vacía como si fuera un resultado válido.

**CA-6. Tras el error, salida a la lista completa.** `[PROPUESTO]`
- DADO el aviso de un estado que no existe
- CUANDO lo veo
- ENTONCES puedo volver a la lista completa o elegir un estado válido, y no me quedo en una pantalla sin salida.

**CA-7. La lista no se puede cargar.** `[PROPUESTO]`
- DADO un filtro por estado activo
- CUANDO la lista no se puede cargar (por ejemplo, por un fallo de conexión)
- ENTONCES se me avisa del fallo, y no aparece una lista vacía que parezca decir que no hay tareas.

### Edge cases

**CA-8. Estado válido sin tareas.** `[PROPUESTO]`
- DADO un estado que existe pero no tiene ninguna tarea
- CUANDO filtro por él
- ENTONCES veo un mensaje que dice que no hay tareas en ese estado. Esto no es un error: se distingue del caso de un estado inexistente (CA-5).

**CA-9. Cambiar el estado de una tarea con el filtro activo.** `[PROPUESTO]`
- DADO un filtro por estado activo
- CUANDO cambio una tarea a otro estado
- ENTONCES la tarea deja de mostrarse en la vista filtrada, porque ya no cumple el filtro, y no se pierde: aparece al quitar el filtro o al filtrar por su nuevo estado.

**CA-10. Crear una tarea con el filtro activo.** `[PROPUESTO]` `[SUPUESTO]`
- DADO un filtro por un estado que no es en el que empiezan las tareas nuevas (hoy, «pendiente» `[SUPUESTO]`)
- CUANDO creo una tarea
- ENTONCES no aparece en la lista filtrada, pero se me indica que se creó, para que no piense que se ha perdido.

**CA-11. Lo vencido sigue destacado.**
- DADO un filtro por estado activo
- CUANDO la lista muestra tareas vencidas de ese estado
- ENTONCES siguen destacadas como vencidas (véase FS-118).

**CA-12. La vista filtrada nunca muestra lo que no cumple.** `[PROPUESTO]` `[SUPUESTO]`
- DADO un filtro por estado activo
- CUANDO otra persona cambia el estado de una tarea, o crea una nueva, y mi lista se actualiza
- ENTONCES mi lista solo muestra tareas que cumplen el filtro. Depende de la actualización en vivo (RF-16, PA-5).

**CA-13. El filtro es solo mío.** `[PROPUESTO]`
- DADO que yo filtro por un estado
- CUANDO otra persona mira la lista al mismo tiempo
- ENTONCES ve su propia vista, sin mi filtro: la lista es la misma para todos (RF-12), pero el filtro no cambia lo que ven los demás.

**CA-14. Sin sesión no se ve nada.**
- DADO que no he iniciado sesión
- CUANDO intento abrir la lista, con o sin filtro
- ENTONCES se me lleva al inicio de sesión y no veo ninguna tarea.
