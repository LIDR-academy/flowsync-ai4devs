## Context

`TasksController.index` ordena por `createdAt desc` con desempate por `id desc`, y la pantalla de la lista pinta en el orden que llega. Al crear, `tasks-page.tsx` pone la nueva **delante de todo**, con un comentario que da por hecho la recencia. Al cambiar un estado, sustituye la fila en su sitio.

## Goals / Non-Goals

**Goals:** que la vista por defecto responda «¿en qué anda el equipo?» sin recorrerla, y que la pantalla no contradiga ese orden al crear.

**Non-Goals:** agrupar por persona, filtrar por responsable, cambiar el orden de las vistas acotadas, o limitar cuántas tareas en curso tiene alguien (PA-4).

## Decisions

### D1 · El orden lo decide la base, no el frontend

Se ordena en la consulta, con una expresión que da a `in_progress` un rango menor que a `pending`, antes de la recencia y del desempate. Así la API y cualquier cliente reciben el mismo orden, y el escenario «El contenido no depende de quién mira» sigue siendo cierto.

**Alternativa descartada: ordenar en el frontend.** La lista es la misma para todas las cuentas; si cada cliente la reordenara, el contrato dejaría de describir lo que se ve.

### D2 · La fila no salta al cambiar el estado

Pasar una tarea a «En curso» desde su fila **no la mueve** a la cabeza hasta la siguiente carga. Mover una fila bajo el cursor justo después de pulsarla hace perder de vista lo que se acaba de tocar, y deja el siguiente clic sobre otra tarea. El requisito exige ver el estado nuevo al momento, y eso se cumple sin mover nada.

**Alternativa descartada: reordenar al momento.** Coherente con la API, pero a costa de la fila bajo el cursor.

### D3 · La nueva sí entra en su sitio

Al crear no hay cursor sobre ninguna fila, y la nueva siempre nace pendiente: su sitio es el primero de las pendientes. Dejarla encima de las que están en curso contradiría el orden que la lista acaba de prometer. La regla va en una función pura de `src/lib/`, para que la pruebe Vitest: la pantalla no tiene runner.

## Risks / Trade-offs

- **Entre un cambio de estado y la siguiente carga, la vista no coincide con el orden de la API.** Declarado en el requisito, y acotado: la siguiente carga lo recompone.
- **D2 y D3 no se pueden satisfacer a la vez en todos los casos.** Si una tarea que encabeza la lista pasa de «En curso» a «Pendiente» sin moverse, y justo después se crea otra, la nueva entra delante de esa -que ya es pendiente- y por tanto encima de las en curso que vengan detrás, hasta la siguiente carga. Insertar tras la última en curso de la lista rompería el caso contrario: una pendiente pasada a «En curso» en mitad de la lista mandaría la nueva debajo de pendientes que ya había. Se elige el bloque que encabeza, que acierta en el caso común, y la prueba de Vitest fija los dos bordes.
- **La expresión de orden depende de los valores de estado.** Si se añadiera un cuarto estado, caería al final sin avisar. El conjunto es cerrado por requisito («Tres estados fijos»), y la prueba nueva fija el orden de los dos que importan.
