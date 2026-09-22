# Prompts

El mismo prompt, lanzado cinco veces, cada vez en una sesión nueva y con el proyecto limpio en
`s8/start`. No se le recordó la regla en ningún intento.

## Prompt 1 (intentos 1 a 5)

**Modelo:** Claude Opus 5.5
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** funcionó a la primera en los cinco intentos. La ruta quedó declarada y el README de
la capability al día en todos. `docs/api/openapi.json` no se regeneró en los intentos 2 y 4.
