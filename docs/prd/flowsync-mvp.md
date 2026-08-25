# PRD - FlowSync MVP

| Campo | Valor |
|---|---|
| Estado | Propuesta, pendiente de firma humana |
| Origen | `docs/prd/alcance-mvp.md` |
| Épicas | E1 Cuentas, E2 Gestión de tareas, E3 Actividad |
| Nivel | Producto. Sin decisiones técnicas |

> Este documento responde **qué** construimos y **por qué**. No decide tablas, endpoints ni componentes. Esas decisiones viven en las specs de cambio y en `docs/architecture/`.

## 1. Problema

Un equipo remoto de 3 a 8 personas no puede consultar el estado de su propio trabajo. Está repartido entre cabezas, hilos de chat y la memoria de quien lleva más tiempo.

La consecuencia medible es una reunión de sincronización recurrente cuyo único propósito es leer en voz alta un estado que ya existe pero disperso, y una interrupción constante entre personas para preguntar cosas que deberían poder mirarse.

## 2. Usuarios

| Usuario | Necesidad | Alternativa actual |
|---|---|---|
| Quien coordina sin autoridad formal | Responder "qué está bloqueado y por qué" sin interrumpir a nadie | Hoja de cálculo desfasada más lectura hacia atrás del chat |
| Miembro del equipo | Declarar en qué trabaja con esfuerzo mínimo | Lo cuenta en la reunión diaria, o no lo cuenta |

**Fuera del MVP como usuarios**: manager que quiere reportes agregados, cliente externo, equipos de más de 15 personas. Servir a cualquiera obliga a roles, permisos y agregaciones antes de validar el núcleo.

## 3. Propuesta de valor

Un lugar donde el estado del trabajo se **mira** en vez de **preguntarse**, con un coste de actualización lo bastante bajo como para que el equipo lo mantenga al día sin que nadie lo persiga.

## 4. Hipótesis del MVP

> Un equipo pequeño mantendrá el tablero al día por su cuenta si actualizarlo cuesta menos que contarlo en una reunión.

Es la única hipótesis que este MVP valida. Todo lo excluido se excluye porque no contribuye a probarla.

## 5. Alcance

### E1 - Cuentas · ya existente

Registro, inicio de sesión, perfil y cierre de sesión. Implementado en el módulo anterior. Se declara para dar contexto, no como trabajo pendiente.

### E2 - Gestión de tareas · núcleo del MVP

| ID | El sistema debe permitir | Verificable por | Bloqueo |
|---|---|---|---|
| RF-01 | Crear una tarea indicando su título | La tarea aparece en la lista | **Parcial**: si el responsable es obligatorio depende de D-02 |
| RF-02 | Consultar la lista de tareas visibles | La lista muestra título, estado, responsable y vencimiento | **Parcial**: qué significa "visibles" depende de D-05 |
| RF-03 | Asignar un responsable, al crear y después | La tarea muestra a quién pertenece, y reasignar actualiza ese responsable para todos sin crear una tarea nueva | **Parcial**: D-02 |
| RF-04 | Cambiar el estado de una tarea | El estado nuevo es visible para el resto al recargar | **Parcial**: la lista de estados depende de D-01 |
| RF-05 | Registrar una fecha de vencimiento, opcional | La tarea distingue visualmente si está vencida | **Parcial**: D-04 |
| RF-06 | Filtrar la lista por estado | La lista muestra solo las tareas del estado elegido | **Parcial**: las opciones dependen de D-01 |
| RF-08 | Corregir el título de una tarea | El título cambia sin crear una tarea nueva | -- |
| RF-09 | Retirar una tarea de la lista activa | La tarea deja de aparecer en la lista por defecto | **Bloqueado**: D-06 decide si es borrado o archivado |

**RF-04 tiene un requisito de coste**: cambiar de estado no debe superar dos interacciones. No es un detalle de interfaz, es la condición que sostiene la hipótesis del producto.

**RF-08 y RF-09 no estaban en la primera versión.** Salieron de la revisión adversarial: el producto describía cómo nacen y evolucionan las tareas, pero no cómo se corrigen ni cómo desaparecen. Para un MVP cuya promesa es que el tablero se mantiene solo, no poder arreglar una tarea mal creada es justo la fricción que provoca el abandono que este documento dice temer. Y sin RF-09 la lista crece sin límite, lo que choca con RNF-01.

### E3 - Actividad

| ID | El sistema debe permitir | Verificable por | Bloqueo |
|---|---|---|---|
| RF-07 | Consultar qué cambió, cuándo, quién lo hizo y quién era el responsable en ese momento | Un miembro responde "qué pasó desde ayer" sin preguntar | **Parcial**: alcance y retención dependen de D-03 |

**RF-07 registra dos personas distintas**: quien ejecutó el cambio y quién era el responsable de la tarea cuando ocurrió. Parece redundante y no lo es: la métrica "adopción sin persecución" de la sección 8 mide exactamente la diferencia entre ambas, y como RF-03 permite reasignar, sin capturar el responsable del momento esa métrica no se puede calcular hacia atrás.

**Acotación del registro**: el MVP conserva los eventos de los últimos 30 días. Sin este límite, "registro consultable" se convierte en silencio en un sistema de auditoría de propósito general, que es mucho más trabajo del que sugiere una sola fila de esta tabla.

## 6. No-alcance

Guardarraíl contra el scope creep, no lista de deseos aplazados.

| Excluido | Por qué |
|---|---|
| Notificaciones e integración con chat | Si el tablero necesita avisarte para ser útil, es que no se consulta solo. Notificar tapa el fallo en vez de revelarlo |
| Roles y permisos avanzados | Todos ven y editan todo. Gobernar el acceso antes de saber si alguien abre el producto es infraestructura prematura |
| Múltiples equipos, proyectos o tableros | Cambia el modelo de datos entero sin aportar aprendizaje |
| Comentarios, adjuntos, subtareas, etiquetas | Cada uno es un producto pequeño compitiendo por la atención del núcleo |
| Kanban con arrastrar y soltar | Decisión de interfaz disfrazada de requisito. El requisito real es RF-04: que cambiar de estado sea barato |
| Informes, métricas y velocidad | Requiere historia acumulada que un MVP no tiene |
| Recurrencias, recordatorios y días laborables | Complejidad de calendario desproporcionada para validar la hipótesis |

## 7. Requisitos no funcionales

Expresados como comportamiento observable, no como decisiones de arquitectura.

| ID | Requisito |
|---|---|
| RNF-01 | La lista carga en menos de 1 segundo con hasta 200 tareas activas, excluidas las retiradas por RF-09 |
| RNF-02 | El producto es usable desde un navegador de escritorio. Móvil no es objetivo del MVP |
| RNF-03 | Un cambio hecho por una persona es visible para el resto al recargar. Tiempo real no entra en el MVP |
| RNF-04 | Solo usuarios autenticados acceden a las tareas. Qué usuarios concretos depende de D-05 |

**RNF-01 cambió de 500 a 200** tras la revisión. La cifra anterior contradecía el supuesto 4, que habla de decenas de tareas: 500 es un orden de magnitud por encima y nadie había justificado el salto. Ahora además se declara que la cifra cuenta tareas **activas**, no histórico acumulado, que es la ambigüedad que hacía inverificable el requisito.

**RNF-03 merece atención.** La idea original decía "sin reuniones de sincronización", y es tentador leer ahí "tiempo real". No lo es. Recargar y ver el estado actual basta para eliminar la reunión. El tiempo real es una decisión técnica cara que este MVP no necesita para validar su hipótesis.

## 8. Métricas de éxito

| Métrica | Qué mide | Señal de fracaso |
|---|---|---|
| Frescura del tablero | Proporción de tareas activas con cambio de estado en los últimos 3 días | Descenso sostenido: el tablero se muere |
| Coste de actualización | Interacciones para cambiar de estado | Más de dos |
| Adopción sin persecución | Proporción de cambios hechos por el propio responsable frente a los hechos por quien coordina | Quien coordina actualiza el trabajo ajeno: el producto solo movió el sitio donde se apunta |

Ninguna es una métrica de vanidad tipo "número de usuarios". Las tres miden si el comportamiento del equipo cambió.

**Cómo se obtiene cada una**, porque no todas se miden igual:

| Métrica | Cómo se obtiene |
|---|---|
| Frescura del tablero | Derivable del registro de actividad, RF-07 |
| Adopción sin persecución | Derivable de RF-07, y **solo** porque registra el responsable del momento además del actor |
| Coste de actualización | **Por inspección de diseño**, no por medición continua |

El MVP no construye instrumentación de interacciones. "Dos clics" se valida revisando el diseño y probando con usuarios, no leyendo un panel. Es una decisión de producto declarada, no un olvido: instrumentar clics es infraestructura que no ayuda a validar la hipótesis.

## 9. Supuestos

Marcados como supuestos, no como hechos.

1. El equipo comparte una forma de trabajar y no necesita configurar flujos de estado propios.
2. Tres estados bastan: por hacer, en curso, hecha.
3. El volumen es de decenas de tareas activas, no miles.

**El supuesto "todos los miembros pertenecen al mismo equipo" se retiró.** No era un supuesto, era una afirmación falsa. Ver D-05.

## 10. Decisiones abiertas

| # | Decisión | Impacto si se resuelve tarde | Bloquea el arranque | Responsable |
|---|---|---|---|---|
| **D-05** | **¿Qué delimita "el equipo"?** | Sin frontera, cualquier persona registrada ve y edita todo | **Sí, es la primera** | Producto |
| D-01 | ¿"Bloqueada" es un cuarto estado o un atributo transversal? | Cambia el modelo de estados, RF-04 y RF-06 | Sí | Producto |
| D-02 | ¿Una tarea puede existir sin responsable? | Afecta a RF-01 y RF-03 | Sí | Producto |
| D-04 | ¿Qué zona horaria decide si una tarea está vencida? | Afecta a RF-05 y produce bugs sutiles | Sí | Producto |
| D-06 | ¿Retirar una tarea es borrado o archivado? | Afecta a RF-09 | No | Producto |
| D-03 | ¿La actividad de E3 es global o por tarea? | Cambia el alcance de E3 | No | Producto |

**D-05, D-01, D-02 y D-04 tocan el modelo de datos del núcleo.** No se puede escribir la primera spec de cambio de E2 sin resolverlas. D-03 y D-06 sí pueden esperar.

### D-05 en detalle

Es el hallazgo más grave de la revisión adversarial y merece explicación.

Todo este documento habla de "las tareas del equipo". **En el producto actual no existe ninguna frontera de equipo.** El registro es público: cualquiera con un email se da de alta. No hay tabla de equipos ni pertenencia. Y como los roles y permisos están en el no-alcance, todos ven y editan todo.

Combinando las tres cosas, "el equipo" significa hoy *cualquiera que se haya registrado alguna vez en la instancia*. La hipótesis del MVP habla de un equipo pequeño y de confianza, y no hay nada en el sistema que lo sostenga.

Las salidas posibles, todas decisión de producto:

1. **Asumirlo y declararlo**: una instancia por equipo, autoalojada, y el PRD dice explícitamente que cualquier persona registrada ve todo. Es defendible para un MVP interno, pero hay que escribirlo.
2. **Controlar el alta**: código de invitación, lista blanca de dominio de correo, o aprobación manual. Añade un requisito a E1, que hoy se daba por cerrada.
3. **Modelar el equipo**: tabla de equipos y pertenencia. Es lo correcto a largo plazo y lo más caro, y contradice el no-alcance de "múltiples equipos".

Hasta que se decida, RF-02 y RNF-04 están incompletos y la palabra "equipo" en este documento es una aspiración, no una descripción.

Los criterios de aceptación que dependan de estas decisiones se marcan **a decidir**. No se inventan.

## 11. Checklist de cierre

- [x] El problema se explica sin nombrar una solución
- [x] Usuarios, contexto actual y exclusiones definidos
- [x] El alcance no contiene diseño técnico
- [x] Cada métrica declara cómo se obtiene
- [x] Supuestos marcados y decisiones abiertas con responsable e indicación de si bloquean
- [x] Versionado dentro del repositorio
- [ ] **Requisitos verificables sin condiciones**: seis de los nueve RF están parcialmente bloqueados por D-01, D-02, D-04 o D-05
- [ ] **Resueltas las decisiones bloqueantes de arranque**: D-05, D-01, D-02, D-04
- [ ] **Firmado por la persona responsable de producto**

Las tres últimas casillas no las marca la IA. Y este PRD **no está listo para bajar a specs técnicas** hasta que se cierren las decisiones bloqueantes: hacerlo antes significa que la primera migración de la tabla de tareas se escribe sobre supuestos que nadie firmó.

## 12. Historial

| Versión | Cambio |
|---|---|
| 1 | Primera redacción a partir de `alcance-mvp.md` |
| 2 | Revisión adversarial. Nueve hallazgos aplicados: se añade D-05 sobre la frontera de equipo, se añaden RF-08 y RF-09 para cerrar el ciclo de vida de la tarea, RF-07 pasa a registrar también el responsable del momento, RNF-01 baja de 500 a 200 tareas activas, se declara cómo se obtiene cada métrica, se marcan los RF parcialmente bloqueados, y se indica qué decisiones bloquean el arranque |
