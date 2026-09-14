## 1. Pruebas primero

- [x] 1.1 `lista_compartida.spec.ts`: sin acotar, una en curso antigua llega antes que dos pendientes recientes; acotada, recencia. Verla en rojo contra el orden actual
- [x] 1.2 Vitest: la función que coloca una tarea recién creada la deja la primera de las pendientes, debajo de las en curso. Verla en rojo contra «delante de todo»

## 2. Backend

- [x] 2.1 Ordenar `TasksController.index` por rango de estado, recencia y desempate
- [x] 2.2 Actualizar la descripción de la operación y regenerar `docs/api/openapi.json`

## 3. Frontend

- [x] 3.1 Función pura en `src/lib/` que coloca la recién creada, y usarla en `tasks-page.tsx` en lugar de ponerla delante de todo
- [x] 3.2 Dejar el cambio de estado sin reordenar (D2), con el comentario que lo explique

## 4. Cierre

- [x] 4.1 Entradas en el catálogo de mutaciones para el orden del backend y la colocación del frontend
- [x] 4.2 En navegador: crear con tareas en curso a la vista, y cambiar un estado sin que la fila salte
- [x] 4.3 PRD (PA-3), backlog y trazabilidad al día; recuentos de CLAUDE.md
- [x] 4.4 Suites, lint, typecheck, `openapi:check`, verificador y catálogo en verde
