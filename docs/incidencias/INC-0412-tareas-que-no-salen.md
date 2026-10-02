# INC-0412 — Hay tareas que no salen en ninguna vista

**Abierta:** 2026-10-01 · **Origen:** soporte · **Estado:** sin reproducir

## Lo que cuenta el equipo

Desde hace meses, parte del equipo de operaciones dice que **tiene tareas que no aparecen en FlowSync**: ni en la lista por defecto, ni filtrando por «Pendiente», ni por «En curso», ni por «Hecho». Saben que existen porque las tienen apuntadas en la hoja de cálculo que usaban antes de FlowSync.

No es una tarea suelta: hablan de «unas cuantas, quizá veinte». Nadie las ha borrado: la API no tiene borrado.

## Lo que se ha probado

- **En desarrollo no se reproduce.** Con los datos de prueba, cada tarea sale en exactamente uno de los filtros, y la suite está en verde.
- No hay errores en los registros del backend: las peticiones de la lista devuelven 200.

## Lo que hay para investigar

**Producción ha mandado una copia de la base de anoche:** `backups/produccion-2026-10-02.dump` (`pg_dump`, formato custom).

> ⚠️ **La copia lleva datos personales reales**: nombres y correos del equipo, contraseñas (cifradas), tokens de sesión vigentes, y lo que la gente escribe en el título de las tareas, que a veces incluye datos de clientes. **No se abre, no se restaura en una base a la que llegue nadie más, y no se le enseña a ninguna herramienta externa** tal cual está.
