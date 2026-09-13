## Why

**PA-3** del PRD, decidido el 2026-09-13. La vista por defecto de la lista mezcla pendientes y en curso de la más reciente a la más antigua. Con ese orden, una tarea en curso desde hace dos semanas queda debajo de diez pendientes recién apuntadas, y la pregunta que el producto existe para responder -«¿en qué anda el equipo?»- obliga a recorrer la lista filtrando estados a ojo.

El propio PRD dice que «En curso» es la única señal que el producto existe para transmitir (PA-4). Ponerla arriba responde a la pregunta sin mirar, y lo pendiente, justo debajo, responde «qué hay libre».

Lo que PA-3 decía y ya no es cierto: «ningún requisito fija el orden». La spec viva lo fijaba -recencia- desde que se construyó la lista. Lo que no se había decidido es si ese orden servía.

## What Changes

- La vista por defecto llega con **las tareas en curso primero y las pendientes después**; dentro de cada grupo, de la más reciente a la más antigua, con el mismo desempate que hoy.
- Las vistas acotadas por un estado **no cambian**: un solo estado, así que el orden sigue siendo la recencia.
- En la pantalla, **una tarea recién creada aparece encabezando las pendientes**, no encima de las que están en curso.
- En la pantalla, **cambiar el estado desde la fila no mueve la fila** hasta la siguiente vez que se carga la lista.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `tasks`: se modifican «Una sola lista compartida del espacio» (el orden), «Crear una tarea desde la lista» (dónde aparece la nueva) y «Cambiar el estado desde la propia fila» (la fila no salta).

## Impact

- Backend: el orden de `TasksController.index` y la descripción de la operación en el contrato, que se regenera.
- Frontend: dónde se inserta la tarea recién creada en `tasks-page.tsx`, con la regla en una función pura que Vitest puede probar.
- Sin dependencias nuevas, sin migración.
- **Sin agrupar por persona ni filtro por responsable**: los dos siguen fuera (RF-20, PA-5).
