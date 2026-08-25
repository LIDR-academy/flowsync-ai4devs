# FlowSync - Alcance del MVP

> Artefacto de discovery. Precede al PRD y no lo sustituye.
> Estado: propuesta, pendiente de firma humana.

## Idea de partida

> "Que los equipos remotos sepan en qué trabaja cada persona sin reuniones de sincronización. Con menos rollo que Jira."

Esa frase comunica intención, no comportamiento. No dice quién sufre el problema, qué hace hoy sin la herramienta, ni cómo sabremos que quedó resuelto. Este documento la convierte en decisiones.

## El problema, sin nombrar solución

En un equipo de 3 a 8 personas el estado real del trabajo vive repartido entre cabezas, hilos de chat y la memoria de quien lleva más tiempo. Nadie puede responder "¿qué está bloqueado, y por culpa de quién?" sin interrumpir a otras tres personas.

El coste no es la ausencia de una lista. Es que **el estado no es consultable**, y por eso existen reuniones de sincronización cuyo único propósito es leer en voz alta algo que debería poder mirarse.

Formulado como dolor observable: *el equipo gasta tiempo recurrente en reconstruir verbalmente un estado que ya existe, pero disperso.*

## Usuarios

**Usuario principal: quien coordina sin autoridad formal.** Tech lead, product owner de equipo único, o el desarrollador senior al que todos preguntan. Su síntoma diario es preguntar en voz alta "¿esto lo cogió alguien?".

Hoy sobrevive con una hoja de cálculo que actualiza a mano y que está desfasada desde el martes, más un canal de chat donde el estado se infiere leyendo hacia atrás.

**Usuario secundario: el miembro del equipo.** Quiere declarar en qué trabaja con el mínimo esfuerzo posible. Su umbral de abandono es bajo: si actualizar el estado cuesta más de dos clics, deja de hacerlo, y entonces el tablero miente. Un tablero que miente es peor que no tener tablero.

**Quién NO es usuario del MVP.** El manager que quiere reportes agregados, el cliente externo que quiere visibilidad, y el equipo de más de 15 personas. Servir a cualquiera de los tres obliga a permisos, roles y agregaciones antes de haber probado el núcleo.

## Propuesta de valor

Un lugar donde el estado del trabajo del equipo se puede **mirar** en lugar de **preguntar**, con un coste de actualización lo bastante bajo como para que la gente lo mantenga al día por su cuenta.

La apuesta que hace el MVP: si actualizar cuesta poco, el tablero se mantiene solo; y si se mantiene solo, la reunión de sincronización deja de ser necesaria.

## Alcance del MVP

### E1 - Cuentas

Ya implementado en el módulo anterior. Registro, login, perfil y cierre de sesión sobre tokens de acceso.

Entra en el alcance para dejar constancia de que existe, no como trabajo pendiente.

### E2 - Gestión de tareas

El núcleo del producto y lo único que este MVP construye de cero.

- Crear una tarea con título y estado inicial.
- Ver la lista de tareas del equipo con sus datos relevantes.
- Asignar un responsable, en la creación y después.
- Cambiar el estado de una tarea con el mínimo número de interacciones.
- Registrar una fecha de vencimiento y distinguir las tareas vencidas.
- Filtrar la lista por estado.

### E3 - Actividad

Registro consultable de qué cambió, cuándo y quién lo hizo.

Es lo que convierte el tablero en respuesta a "¿qué pasó desde ayer?" sin preguntarle a nadie. Sin esto, el producto obliga a comparar mentalmente contra un estado recordado.

## Fuera de alcance, con justificación

**Notificaciones y cualquier integración con chat.** Es el falso imprescindible clásico: parece barato y arrastra preferencias por usuario, canales, agrupación, silenciado y horarios. Además esconde el fallo de fondo, porque si el tablero necesita avisarte para ser útil, es que no se consulta solo. Prefiero que el MVP demuestre que la gente entra a mirar; si no lo hace, notificar solo añade ruido a un producto que ya falló.

**Roles y permisos avanzados.** Todos los miembros ven y editan todo. Introducir roles antes de saber si el equipo usa el producto es construir infraestructura de gobierno para un tablero que quizá nadie abre.

**Múltiples equipos, proyectos o tableros.** Un solo espacio compartido. La multi-tenencia cambia el modelo de datos entero y no aporta nada al aprendizaje que buscamos.

**Comentarios, adjuntos, subtareas y etiquetas.** Cada uno es un producto pequeño. Todos compiten por el mismo presupuesto de atención que necesita el núcleo.

**Tablero Kanban con arrastrar y soltar.** Es una decisión de interfaz, no de producto, y llega disfrazada de requisito. Cambiar de estado tiene que ser barato; que sea arrastrando o pulsando se decide al diseñar, no aquí.

**Informes, métricas y velocidad del equipo.** Requiere historia acumulada que un MVP no tiene.

## Lo que este MVP prueba, y solo eso

Que un equipo pequeño mantiene el tablero al día por su cuenta, sin que nadie tenga que perseguirlo.

Es la única hipótesis que importa. Si falla, ninguna de las features excluidas la habría salvado. Si se cumple, entonces sí tiene sentido discutir notificaciones, permisos o informes.

## Cómo sabremos que funcionó

Métricas de comportamiento, no de vanidad. Sin instrumentación todavía: son la definición del éxito, no un requisito técnico del MVP.

- **Frescura del tablero**: qué proporción de las tareas activas cambió de estado en los últimos 3 días. Si baja de forma sostenida, el tablero se está muriendo.
- **Coste de actualización**: número de interacciones para pasar una tarea de un estado a otro. Objetivo declarado: dos.
- **Adopción sin persecución**: cuántas actualizaciones de estado las hace el propio responsable, frente a las que hace quien coordina en nombre de otro. Si quien coordina actualiza el trabajo ajeno, el producto no resolvió el problema, solo movió el sitio donde se apunta.

## Supuestos declarados

Marcados como supuestos, no como hechos. Cada uno puede invalidar el alcance si resulta falso.

1. El equipo ya comparte una única forma de trabajar y no necesita configurar flujos de estado propios.
2. Tres estados (por hacer, en curso, hecha) bastan para el MVP. **A decidir**: si "bloqueada" es un cuarto estado o un atributo transversal.
3. Todos los miembros pertenecen al mismo equipo. No hay invitaciones ni gestión de altas más allá del registro que ya existe.
4. El volumen es pequeño: decenas de tareas activas, no miles. Esto condiciona si el filtrado y la paginación ocurren en cliente o en servidor, decisión que se toma en la spec, no aquí.

## Decisiones abiertas

| Decisión | Impacto | Responsable |
|---|---|---|
| ¿"Bloqueada" es estado o atributo? | Cambia el modelo de estados y el filtro | Producto |
| ¿Una tarea puede no tener responsable? | Afecta a creación rápida y a la lista | Producto |
| ¿La actividad de E3 es global o por tarea? | Cambia el alcance de la épica | Producto |
