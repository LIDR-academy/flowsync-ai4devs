## Prompt 1

**Modelo:** Sonnet 5 <br>
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** Actualizó el README.md


## Prompt 2

**Modelo:** Sonnet 5 <br>
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** Actualizó el README.md, pero agregó mas información que el intento Nº1.


## Prompt 3

**Modelo:** Sonnet 5 <br>
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** Actualizó el README.md, mantuvo la misma información que el intento Nº2.


## Prompt 4

**Modelo:** Sonnet 5 <br>
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** Actualizó el README.md, mantuvo la misma información que el intento Nº3.


## Prompt 5

**Modelo:** Sonnet 5 <br>
**Herramienta:** Claude Code

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** Actualizó el README.md, pero en este último intento la sección de los test no la completó de buena manera. <br><br>
Resultado:
Los tests de esta capability están en
[`backend/tests/functional/tasks/`](../../../backend/tests/functional/tasks/). **Hoy solo hay dos**:
`assignee.spec.ts`, que cubre 3 de los 124 scenarios de la spec (los del requisito *Lo que cada tarea
muestra de su responsable*), y `destroy.spec.ts`, que fija el contrato de `DELETE /tasks/:id` —que aún
no tiene requisito en la spec—. Todo lo demás está sin cubrir, así que el verde de la suite **no** es
señal de que la capability cumpla su spec.