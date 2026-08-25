---
id: FS-142
epica: E2 - Gestión de tareas
prd: docs/prd/flowsync-mvp.md
requisito: RF-06
estado: propuesta
depende_de: [FS-102, FS-105]
---

# FS-142 - Filtrar la lista por estado

**Como** persona que coordina el trabajo del equipo
**quiero** ver solo las tareas de un estado concreto
**para** responder "qué está en curso" sin leer la lista entera.

## Alcance

- Filtrar la lista del equipo por un estado.
- Volver a la lista completa.
- Que el filtro aplicado sea visible.

## Fuera de alcance

- Filtrar por responsable, por vencimiento o por texto. Cada uno es su propia historia.
- Seleccionar varios estados a la vez. Es una historia distinta, no un criterio de esta.
- Ordenar la lista. No es filtrar.

## Reglas de negocio

1. Los estados disponibles son los tres del MVP: por hacer, en curso, hecha. Ver supuesto 2 del PRD.
2. Existe una opción para ver todas las tareas, que es el estado por defecto al entrar.
3. El filtro no modifica ninguna tarea. Solo cambia lo que se muestra.
4. El filtro aplicado siempre está visible mientras esté activo. Una lista recortada sin indicación es una lista que miente.

## Criterios de aceptación

### CA-1 · Filtrar por un estado

**Dado** que el equipo tiene tareas en los tres estados
**Cuando** el usuario filtra por "en curso"
**Entonces** la lista muestra únicamente las tareas en curso
**Y** el filtro aplicado es visible en pantalla.

### CA-2 · Volver a la lista completa

**Dado** que hay un filtro de estado aplicado
**Cuando** el usuario selecciona "todas"
**Entonces** la lista vuelve a mostrar todas las tareas del equipo.

### CA-3 · Un filtro sin resultados se explica

**Dado** que el equipo no tiene ninguna tarea en estado "hecha"
**Cuando** el usuario filtra por "hecha"
**Entonces** la lista aparece vacía con un mensaje que indica que no hay tareas en ese estado
**Y** el usuario puede quitar el filtro desde ahí mismo.

### CA-4 · El filtro no altera las tareas

**Dado** que hay un filtro aplicado
**Cuando** el usuario quita el filtro
**Entonces** todas las tareas siguen en el mismo estado en el que estaban.

### CA-5 · Cambiar el estado de una tarea filtrada

**Dado** que el usuario está filtrando por "por hacer"
**Y** cambia una tarea a "en curso"
**Cuando** la lista se actualiza
**Entonces** esa tarea desaparece de la vista filtrada
**Y** el usuario recibe una indicación de que la tarea sigue existiendo, pero fuera del filtro actual.

CA-5 es el criterio que más se olvida y el que peor se siente si falta. Sin él, la tarea se desvanece de la pantalla al tocarla y parece que se borró.

### CA-6 · Pedir un estado que no existe avisa del error

**Dado** que se solicita la lista filtrando por un estado que no está entre los válidos
**Cuando** el sistema procesa la petición
**Entonces** avisa del error indicando cuáles son los estados válidos
**Y** no devuelve una lista vacía en silencio.

CA-6 distingue dos situaciones que se ven igual y no lo son: **no hay resultados** para un filtro legítimo, que es CA-3, y **el filtro pedido no existe**, que es un error. Devolver lista vacía en ambos casos oculta el fallo y hace que un enlace mal formado parezca un tablero vacío.

## Casos borde

| Caso | Comportamiento esperado |
|---|---|
| El equipo no tiene ninguna tarea | Lista vacía con mensaje distinto al de "sin resultados para este filtro". Son situaciones distintas y confundirlas oculta el problema real |
| Se recarga la página con un filtro aplicado | **A decidir**. Ver más abajo |
| Se comparte el enlace de la lista filtrada | **A decidir**. Ver más abajo |
| Se añade un cuarto estado en el futuro | El filtro debe reflejarlo sin cambios en esta historia. Depende de D-01 |
| Llega un estado inexistente por URL manipulada o enlace viejo | Cubierto por CA-6: avisa, no finge lista vacía |

## Decisiones pendientes que bloquean criterios

**El filtro no sobrevive a nada, y nadie ha decidido si debería.**

Ni la historia ni el PRD dicen si el filtro persiste al recargar, si va en la URL, ni si el enlace se puede compartir. Lo tercero es lo que más pesa en este producto: el usuario principal es alguien que coordina, y su gesto natural es pegar un enlace en el chat. Sin filtro en la URL, "mira los bloqueados" se convierte en "entra, filtra por bloqueados, y luego mira".

CA-1 y CA-2 son válidos sin resolverlo, pero el valor real de la historia baja bastante.

**D-01 del PRD: si "bloqueada" es un estado o un atributo.**

Si acaba siendo un cuarto estado, la regla 1 cambia y con ella la lista de opciones del filtro.

## Supuesto declarado

Todos los miembros ven todas las tareas del equipo. Sale del no-alcance del PRD, sección 6, donde se excluyen roles y permisos. Si mañana hubiera tareas con visibilidad restringida, el filtro tendría que respetarla y esta historia cambiaría.

## Trazabilidad

- PRD: `docs/prd/flowsync-mvp.md`, RF-06
- Épica: E2 - Gestión de tareas
- Decisiones abiertas: D-01, y la persistencia del filtro, sin identificador todavía
