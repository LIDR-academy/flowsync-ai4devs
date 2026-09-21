---
allowed_tools: [Read, Glob, Grep, Edit, Write]
max_turns: 30
timeout_seconds: 600
---
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
