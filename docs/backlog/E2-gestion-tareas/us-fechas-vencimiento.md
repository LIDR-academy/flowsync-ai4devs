---
id: FS-118
epica: E2 - Gestión de tareas
prd: docs/prd/flowsync-mvp.md
requisito: RF-05
estado: propuesta
depende_de: [FS-101, FS-102]
---

# FS-118 - Fecha de vencimiento y tareas vencidas

**Como** miembro de un equipo pequeño
**quiero** poner fecha de vencimiento a una tarea y ver cuáles ya vencieron
**para** priorizar sin tener que recordar de memoria qué corre prisa.

## Alcance

- Asignar, modificar y quitar la fecha de vencimiento de una tarea.
- Distinguir en la lista las tareas vencidas de las que no lo están.

## Fuera de alcance

- Recordatorios y avisos. Excluidos en el PRD, sección 6.
- Recurrencias y cálculo de días laborables. Excluidos en el PRD, sección 6.
- Ordenar la lista por vencimiento. Es otra historia, no un criterio de esta.

## Reglas de negocio

1. Una tarea tiene cero o una fecha de vencimiento. La fecha es opcional.
2. Una tarea está **vencida** si su fecha de vencimiento es anterior al día de hoy y la tarea no está en estado "hecha".
3. Una tarea que vence **hoy** no está vencida. Vence al terminar el día.
4. Una tarea sin fecha nunca está vencida.

La regla 2 tiene una consecuencia que conviene declarar: cerrar una tarea vencida hace que deje de estar vencida. Es deliberado. Una tarea terminada tarde ya no es un problema que reclame atención, y mantenerla en rojo convierte el indicador en ruido.

## Criterios de aceptación

### CA-1 · Asignar una fecha de vencimiento

**Dado** que existe una tarea sin fecha de vencimiento
**Cuando** el usuario le asigna una fecha futura
**Entonces** la tarea muestra esa fecha en la lista
**Y** la tarea no aparece como vencida.

### CA-2 · Una tarea con fecha pasada aparece vencida

**Dado** que existe una tarea en estado "por hacer" con fecha de vencimiento anterior a hoy
**Cuando** el usuario consulta la lista
**Entonces** la tarea se distingue visualmente como vencida.

### CA-3 · La tarea que vence hoy no está vencida

**Dado** que existe una tarea cuya fecha de vencimiento es hoy
**Cuando** el usuario consulta la lista
**Entonces** la tarea no se muestra como vencida.

### CA-4 · Quitar la fecha de vencimiento

**Dado** que existe una tarea con fecha de vencimiento
**Cuando** el usuario elimina la fecha
**Entonces** la tarea deja de mostrar fecha
**Y** deja de aparecer como vencida si lo estaba.

### CA-5 · Cerrar una tarea vencida la saca del estado vencido

**Dado** que existe una tarea vencida
**Cuando** el usuario la pasa a estado "hecha"
**Entonces** la tarea deja de mostrarse como vencida.

### CA-6 · Una tarea sin fecha nunca está vencida

**Dado** que existe una tarea sin fecha de vencimiento
**Cuando** el usuario consulta la lista
**Entonces** la tarea no se muestra como vencida, sin importar su antigüedad.

## Casos borde

| Caso | Comportamiento esperado |
|---|---|
| Fecha de vencimiento en el pasado al crear la tarea | Se permite. Sirve para registrar trabajo que ya venía retrasado |
| El día cambia con la pantalla abierta | **A decidir**. Depende de D-04 |
| Usuarios en zonas horarias distintas | **A decidir**. Depende de D-04 |
| Fecha con formato inválido | El sistema la rechaza y explica por qué, sin perder el resto de lo escrito |
| Fecha absurdamente lejana, año 9999 | **A decidir**. ¿Hay un límite superior razonable? |

## Decisiones pendientes que bloquean criterios

**D-04 del PRD: qué zona horaria decide si una tarea está vencida.**

No es un detalle menor y no puede resolverse en implementación. Con equipos remotos, dos personas pueden ver estados distintos de la misma tarea a la misma hora si cada cliente calcula con su reloj local. Las opciones son la zona del proyecto, la del usuario o UTC, y cada una da un resultado distinto para la misma tarea.

Los criterios CA-2 y CA-3 quedan **incompletos** hasta que se decida. Están escritos con "hoy" a propósito, sin precisar el hoy de quién.

## Trazabilidad

- PRD: `docs/prd/flowsync-mvp.md`, RF-05
- Épica: E2 - Gestión de tareas
- Decisión abierta: D-04
