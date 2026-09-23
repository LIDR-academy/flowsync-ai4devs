# Validaciones del encargo `DELETE /api/v1/tasks/:id`

> **Encargo:** añadir `DELETE /api/v1/tasks/:id` en la capability `tasks` (borra la tarea y devuelve `204` sin cuerpo).
>
> **Fecha:** 2026-09-23

## Índice

- [Apuesta](#apuesta)
- [ParteA](#parte-A)
- [Validación 1](#validación-1)
- [Validación 2](#validación-2)
- [Validación 3](#validación-3)
- [Validación 4](#validación-4)
- [Validación 5](#validación-5)
- [ParteB](#parte-B)
---

## Apuesta

4 de 5. Escrita antes del primer intento, sin haber lanzado nada.

---

## Parte A

| # | Sesión | Rama | Commit | Control | README |
|:-:|---|---|---|:-:|:-:|
| 1 | `083a0eef` | `feat/delete-task` | `c6d2eca` | ✅ | ✅ |
| 2 | `d2066361` | `feat/borrar-tarea` | `0703681` | ✅ | ✅ |
| 3 | `c97755ff` | `feat/eliminar-tarea` | `37019be` | ✅ | ✅ |
| 4 | `b61431cb` | `feat/delete-task-endpoint` | `cc6599d` | ✅ | ✅ |
| 5 | `0a919817` | `feat/destroy-task` | `a72ebbf` | ✅ | ✅ |

---

## Validación 1

- **Sesión:** `083a0eef`
- **Rama:** `feat/delete-task`
- **Commit:** `c6d2eca`

### Comprobaciones

| Pregunta | Respuesta | Evidencia |
|---|:-:|---|
| ¿El `README.md` de `docs/capabilities/tasks` tiene la última modificación? | **Sí** | Fila `DELETE /tasks/:id` en la tabla de endpoints (l. 25).<br>Fila de regla de negocio (l. 92).<br>«seis operaciones» y código `204` en «El contrato, servido». |
| ¿Quedó declarada la ruta `DELETE`? | **Sí** | `router.delete(':id', [controllers.Tasks, 'destroy'])` |
| ¿Está registrado el nuevo endpoint? | **Sí** | `TasksController.destroy`.<br>Registro Tuyau regenerado en `backend/.adonisjs/` (`tasks.tasks.destroy`). |
| ¿Está en `backend/start/routes.ts`? | **Sí** | Línea 54, dentro del grupo `tasks` (con `middleware.auth()`). |
| ¿Se modificó `docs/api/openapi.json`? | **Sí** | +50 líneas: operación `delete` en `/api/v1/tasks/{id}` con `204`, `401` y `404`. |

### Resultado de la medición

**Control ✅ · README ✅**

### Incidencias de entorno

- Con Node 24.21 `node ace` no arranca (`Invalid URL` en `jsonschema` 1.5.0 al validar los comandos). `openapi:generate` y el arranque del servidor se hicieron con Node 22.23.2.
- `node ace test` no se pudo ejecutar: con Node 22 falla `better-sqlite3` (binario compilado para Node 24) y con Node 24 falla ace. Typecheck y eslint en verde.
- No se abrió PR ni se pasó el `adversarial-reviewer`: el intento se descarta en el paso 7.

---

## Validación 2

- **Sesión:** `d2066361`
- **Rama:** `feat/borrar-tarea`
- **Commit:** `0703681`

### Comprobaciones

| Pregunta | Respuesta | Evidencia |
|---|:-:|---|
| ¿El `README.md` de `docs/capabilities/tasks` tiene la última modificación? | **Sí** | Último commit que lo toca: `0703681`.<br>Fila `DELETE /tasks/:id` en la tabla de endpoints (l. 25).<br>«seis operaciones» y código `204` en «El contrato, servido» (l. 62).<br>Fila de regla de negocio (l. 92, marcada *sin requisito en la spec todavía*).<br>Paso 7 del recorrido con `curl`. |
| ¿Quedó declarada la ruta `DELETE`? | **Sí** | `router.delete(':id', [controllers.Tasks, 'destroy'])` |
| ¿Está registrado el nuevo endpoint? | **Sí** | `TasksController.destroy`.<br>`node ace list:routes` lo lista como `tasks.tasks.destroy` con middleware `auth`.<br>Registro Tuyau regenerado en `backend/.adonisjs/` (`routes.d.ts`, `client/registry/*`). |
| ¿Está en `backend/start/routes.ts`? | **Sí** | Línea 54, dentro del grupo `tasks` (con `middleware.auth()`), justo tras `GET :id`. |
| ¿Se modificó `docs/api/openapi.json`? | **Sí** | +50 líneas: operación `delete` en `/api/v1/tasks/{id}` con respuestas `204`, `401` y `404`. |

### Prueba a mano contra el servidor real

| Petición | Resultado |
|---|---|
| `DELETE` | `204` con cuerpo de 0 bytes |
| `DELETE` repetido | `404` |
| `DELETE` sin token | `401` |
| `GET` tras borrar | `404` |

Typecheck y eslint en verde.

### Resultado de la medición

**Control ✅ · README ✅**

### Incidencias de entorno

- El working tree de `s8/start` aparece con ~176 ficheros modificados que solo difieren en fin de línea (CRLF vs LF). Los ficheros del cambio se normalizaron a LF antes del commit para que el diff fuera solo el real.
- Con Node 24.21 `node ace` no arranca; con Node 22.23 falla `better-sqlite3` (compilado para Node 24). `openapi:generate` y el codegen de `.adonisjs/` se hicieron con Node 22; la prueba a mano, arrancando `bin/server.ts` directamente con Node 24.
- `node ace test` no se ejecutó por lo mismo.
- No se abrió PR ni se pasó el `adversarial-reviewer`: el intento se descarta en el paso 7.

---

## Validación 3

- **Sesión:** `c97755ff`
- **Rama:** `feat/eliminar-tarea`
- **Commit:** `37019be`

### Comprobaciones

| Pregunta | Respuesta | Evidencia |
|---|:-:|---|
| ¿El `README.md` de `docs/capabilities/tasks` tiene la última modificación? | **Sí** | Último commit que lo toca: `37019be`.<br>Fila `DELETE /tasks/:id` en la tabla de endpoints (l. 25).<br>Nota sobre la respuesta sin envoltorio (l. 31).<br>«seis operaciones» y código `204` en «El contrato, servido» (l. 63–66).<br>Fila de regla de negocio (l. 93, *sin requisito en la spec todavía*).<br>Paso 7 del recorrido con `curl` (l. 183). |
| ¿Quedó declarada la ruta `DELETE`? | **Sí** | `router.delete(':id', [controllers.Tasks, 'destroy'])` |
| ¿Está registrado el nuevo endpoint? | **Sí** | `TasksController.destroy`.<br>`node ace list:routes` lo lista como `tasks.tasks.destroy` con middleware `auth`.<br>Registro Tuyau regenerado en `backend/.adonisjs/` (`server/routes.d.ts`, `client/registry/*`). |
| ¿Está en `backend/start/routes.ts`? | **Sí** | Línea 54, dentro del grupo `tasks` (con `middleware.auth()`), justo tras `GET :id`. |
| ¿Se modificó `docs/api/openapi.json`? | **Sí** | +50 líneas: operación `delete` en `/api/v1/tasks/{id}` (l. 584) con respuestas `204`, `401` y `404`. |

### Prueba a mano contra el servidor real

| Petición | Resultado |
|---|---|
| `DELETE` | `204` con 0 bytes |
| `DELETE` repetido | `404` |
| `GET` tras borrar | `404` |
| `DELETE` sin token | `401` |

Typecheck y eslint en verde.

### Resultado de la medición

**Control ✅ · README ✅**

### Incidencias de entorno

- Como en los intentos anteriores, `s8/start` arranca con ~169 ficheros modificados solo por fin de línea (CRLF vs LF); el commit contiene únicamente los 8 ficheros del cambio (+115 / −4).
- La rama `feat/borrar-tarea` ya existía de un intento previo, así que se usó `feat/eliminar-tarea`.
- `openapi:generate` y el codegen de `.adonisjs/` con Node 22.23 (con Node 24.21 `node ace` no arranca); la prueba a mano, con `bin/server.ts` directamente en Node 24.
- `node ace test` no se ejecutó (conflicto `better-sqlite3` / Node).
- No se abrió PR ni se pasó el `adversarial-reviewer`: el intento se descarta en el paso 7.

---

## Validación 4

- **Sesión:** `b61431cb`
- **Rama:** `feat/delete-task-endpoint`
- **Commit:** `cc6599d`

### Comprobaciones

| Pregunta | Respuesta | Evidencia |
|---|:-:|---|
| ¿El `README.md` de `docs/capabilities/tasks` tiene la última modificación? | **Sí** | Último commit que lo toca: `cc6599d`.<br>Fila `DELETE /tasks/:id` en la tabla de endpoints (l. 25).<br>Nota sobre la respuesta `204` sin envoltorio (l. 31).<br>«seis operaciones» y código `204` en «El contrato, servido» (l. 63–66).<br>Fila de regla de negocio (l. 92, *sin requisito en la spec todavía*).<br>Paso 7 del recorrido con `curl` (l. 183). |
| ¿Quedó declarada la ruta `DELETE`? | **Sí** | `router.delete(':id', [controllers.Tasks, 'destroy'])` |
| ¿Está registrado el nuevo endpoint? | **Sí** | `TasksController.destroy`.<br>`node ace list:routes` lo lista como `tasks.tasks.destroy` con middleware `auth`.<br>Registro Tuyau regenerado en `backend/.adonisjs/` (`server/routes.d.ts`, `client/registry/*`). |
| ¿Está en `backend/start/routes.ts`? | **Sí** | Línea 54, dentro del grupo `tasks` (con `middleware.auth()`), justo tras `GET :id`. |
| ¿Se modificó `docs/api/openapi.json`? | **Sí** | +50 líneas: operación `delete` en `/api/v1/tasks/{id}` (l. 584) con respuestas `204`, `401` y `404`. |

### Prueba a mano contra el servidor real

| Petición | Resultado |
|---|---|
| `DELETE` | `204` con 0 bytes |
| `DELETE` repetido | `404` |
| `GET` tras borrar | `404` |
| `DELETE` sin token | `401` |

Typecheck y eslint en verde.

### Resultado de la medición

**Control ✅ · README ✅**

### Incidencias de entorno

- Como en los intentos anteriores, `s8/start` arranca con 176 ficheros modificados solo por fin de línea (CRLF vs LF) más `.claude/settings.local.json` sin seguimiento; el commit contiene únicamente los 8 ficheros del cambio (+116 / −4), normalizados a LF.
- Las ramas `feat/delete-task`, `feat/borrar-tarea` y `feat/eliminar-tarea` ya existían de intentos previos, así que se usó `feat/delete-task-endpoint`.
- `openapi:generate` y el codegen de `.adonisjs/` con Node 22.23; la prueba a mano, con `node --import=@poppinss/ts-exec bin/server.ts` en Node 24.21.
- `node ace list:routes` generó un `backend/.adonisjs/server/routes.json` nuevo que se dejó fuera del commit.
- `node ace test` no se ejecutó (conflicto `better-sqlite3` / Node).
- No se abrió PR ni se pasó el `adversarial-reviewer`: el intento se descarta en el paso 7.

---

## Validación 5

- **Sesión:** `0a919817`
- **Rama:** `feat/destroy-task`
- **Commit:** `a72ebbf`

### Comprobaciones

| Pregunta | Respuesta | Evidencia |
|---|:-:|---|
| ¿El `README.md` de `docs/capabilities/tasks` tiene la última modificación? | **Sí** | Último commit que lo toca: `a72ebbf`.<br>Fila `DELETE /tasks/:id` en la tabla de endpoints (l. 25).<br>Nota sobre el `204` sin envoltorio y el `404` (l. 31).<br>«seis operaciones» y código `204` en «El contrato, servido» (l. 64–67).<br>Fila de regla de negocio (l. 94, *sin requisito en la spec todavía*).<br>Paso 7 del recorrido con `curl` (l. 184–185). |
| ¿Quedó declarada la ruta `DELETE`? | **Sí** | `router.delete(':id', [controllers.Tasks, 'destroy'])` |
| ¿Está registrado el nuevo endpoint? | **Sí** | `TasksController.destroy`.<br>Registro Tuyau regenerado en `backend/.adonisjs/` (`server/routes.d.ts`, `client/registry/index.ts`, `schema.d.ts`, `tree.d.ts`). |
| ¿Está en `backend/start/routes.ts`? | **Sí** | Línea 54, dentro del grupo `tasks` (con `middleware.auth()`), justo tras `GET :id`. |
| ¿Se modificó `docs/api/openapi.json`? | **Sí** | +50 líneas: operación `delete` en `/api/v1/tasks/{id}` (l. 584) con respuestas `204`, `401` y `404`. |

### Prueba a mano contra el servidor real

| Petición | Resultado |
|---|---|
| `DELETE` | `204` con 0 bytes |
| `DELETE` repetido | `404` |
| `GET` tras borrar | `404` |
| `DELETE` sin token | `401` |

Typecheck y eslint en verde.

### Resultado de la medición

**Control ✅ · README ✅**

### Incidencias de entorno

- Como en los intentos anteriores, `s8/start` arranca con 176 ficheros modificados solo por fin de línea (CRLF vs LF) más `.claude/settings.local.json` sin seguimiento; el commit contiene solo los 8 ficheros del cambio (+116 / −4), normalizados a LF.
- Las ramas de intentos previos seguían existiendo, así que se usó `feat/destroy-task`.
- `openapi:generate` y el codegen de `.adonisjs/` (arrancando `node ace serve` unos segundos) con Node 22.23; la prueba a mano, con `node --import=@poppinss/ts-exec bin/server.ts` en Node 24.21.
- `node ace test` no se ejecutó (conflicto `better-sqlite3` / Node).
- No se abrió PR ni se pasó el `adversarial-reviewer`: el intento se descarta en el paso 7.


## Parte B

-Apuesta: Aposte 4 de 5 pensando qen habría un error, pero salió bien en los 5 intentos.
-Qué haría con ese número?: Convertirla en algo que se ejecute solo.
-Una cosa que tu medición no este midiendo: Pudiera adicionar un revisor adversarial para determinar si los tests realmente son correctos, del mismo modo que dice el README.