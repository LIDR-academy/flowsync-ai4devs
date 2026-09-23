# Registro de prompts — Prework 8

> **Fecha:** 2026-09-23
>
> **Encargo:** añadir `DELETE /api/v1/tasks/:id` en la capability `tasks`.

## Índice

- [Contenido del archivo prework8.md](#contenido-del-archivo-prework8md)
- [Resumen de sesiones](#resumen-de-sesiones)
- [Sesión 1](#sesión-1)
- [Sesión 2](#sesión-2)
- [Sesión 3](#sesión-3)
- [Sesión 4](#sesión-4)
- [Sesión 5](#sesión-5)

---

## Contenido del archivo prework8.md

### Paso 1. Preparar la rama de partida

Comprueba dónde estás:

```bash
git status -sb
```

Tiene que responder `## s8/start...upstream/s8/start`.

### Paso 2. Preparar el cuaderno, fuera del repositorio

Verifica que exista una carpeta llamada `ai4devs-cuaderno` en la ruta `../Repositorios/ai4devs-cuaderno` dsino existe, creala

```bash
mkdir -p ~/ai4devs-cuaderno
```

Crea un archivo `encargo.txt` en esa misma carpeta, con esta única línea dentro:

```text
Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.
```

### Paso 4. Ejecuta Encargo

Dentro de la ruta `../Repositorios/ai4devs-cuaderno` lee y ejecuta el contenido del archivo `encargo.txt`

### Paso 5. Validación

Al finalizar el paso anterior, valida y NO realices ninguna modificación, si el archivo `README.md` dentro de `../flowsync-ai4devs/docs/capabilities/tasks` tiene la última modificación que realizaste.

- Quedo declarada la ruta DELETE?
- Esta registrado el nuevo End Point?
- El End Point se encuentra registrado en el archivo `routes.ts` dentro de la ruta `../flowsync-ai4devs/backend/start/` ?
- Modificaste el archivo `docs/api/openapi.json`

### Paso 6. Regstro de Información

Los resultados de la sección anterior, registralos en un archivo llamado `jccc.md` dentro de la ruta `../Repositorios/ai4devs-cuaderno`, si el archivo no existe, crealo, si el archivo existe, no borres el contenido y agrega una nueva sección con las respuestas a las preguntas anteriores. La información que agregues debera tener el formato Markdown.

Todos los prompts de la sesión registralos en un archivo llamado `prompts.md` en la ruta `../Repositorios/ai4devs-cuaderno`, , si el archivo no existe, crealo, si el archivo existe, no borres el contenido y agrega una nueva sección con los prompts de la sesión. Se deberá adicionar una línea con los detales del modelo utilizado, el esfuerzo, la herramienta utilizada, el ID de la sesión que se esta ejecutando y el tiempo de la sesión. La información que agregues debera tener el formato Markdown.

### Paso 7. Comprobar que la base está limpia

Si ya terminaste el paso anterior, continua con este.

```bash
git status -sb
```

Tiene que responder **solo** `## s8/start...upstream/s8/start`. Si aparece cualquier otra línea, ve al paso 7.1 y limpia antes de empezar.

Si respondes de forma correcta cierra la sesión con `exit`

#### Paso 7.1. Dejar el proyecto exactamente como estaba

Los tres comandos van juntos, siempre:

```bash
git checkout -f s8/start
git reset --hard upstream/s8/start
git clean -fd
```

Y se verifica:

```bash
git status -sb
```

Tiene que responder solo la línea que empieza por `## s8/start`. Si aparece algo más, todavía queda algo dentro.

Si respondes de forma correcta cierra la sesión con `exit`

---

## Resumen de sesiones

| # | ID de sesión | Esfuerzo | Horario | Duración | Skill |
|:-:|---|---|---|:-:|---|
| 1 | `083a0eef-713e-4f77-85e2-44eba974593b` | Por defecto | 14:55 – 15:02 | ≈ 7 min | — |
| 2 | `d2066361-f990-427e-ad5b-c9d602cc0de0` | Bajo | 15:11 – 15:18 | ≈ 7 min | `/commit` |
| 3 | `c97755ff-eed8-4348-8988-adcec2ec23d5` | Bajo | 15:21 – 15:28 | ≈ 7 min | `/commit` |
| 4 | `b61431cb-9b77-4d47-ae3f-358699470a49` | Bajo | 15:31 – 15:38 | ≈ 7 min | `/commit` |
| 5 | `0a919817-f1a4-470c-8070-b17d1ab0884d` | Bajo | 15:43 – 15:48 | ≈ 5 min | `/commit` |

Todas las sesiones usaron **Claude Opus 5.5** (`claude-opus-5-5`) en **Claude Code**.

---

## Sesión 1

| Campo | Valor |
|---|---|
| **Modelo** | Claude Opus 5.5 (`claude-opus-5-5`) |
| **Esfuerzo** | El configurado por defecto en la sesión |
| **Herramienta** | Claude Code (CLI, WSL2) |
| **ID de sesión** | `083a0eef-713e-4f77-85e2-44eba974593b` |
| **Tiempo** | 14:55 – 15:02 (≈ 7 min) |

### Prompts

1. Prompt inicial:

   ```text
   Lee y ejecuta el archivo prework8.md que se encuentra en la ruta ../Repositorios/ai4devs-cuaderno
   ```

2. Prompt ejecutado a partir de `encargo.txt` (paso 4):

   > Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

---

## Sesión 2

| Campo | Valor |
|---|---|
| **Modelo** | Claude Opus 5.5 (`claude-opus-5-5`) |
| **Esfuerzo** | Bajo |
| **Herramienta** | Claude Code (CLI, WSL2, modo auto) |
| **ID de sesión** | `d2066361-f990-427e-ad5b-c9d602cc0de0` |
| **Tiempo** | 15:11 – 15:18 (≈ 7 min) |

### Prompts

1. Prompt inicial:

   ```text
   Lee y ejecuta el archivo prework8.md que se encuentra en la ruta ../Repositorios/ai4devs-cuaderno
   ```

2. Prompt ejecutado a partir de `encargo.txt` (paso 4):

   > Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

**Skill invocada durante la sesión:** `/commit`

---

## Sesión 3

| Campo | Valor |
|---|---|
| **Modelo** | Claude Opus 5.5 (`claude-opus-5-5`) |
| **Esfuerzo** | Bajo |
| **Herramienta** | Claude Code (CLI, WSL2, modo auto) |
| **ID de sesión** | `c97755ff-eed8-4348-8988-adcec2ec23d5` |
| **Tiempo** | 15:21 – 15:28 (≈ 7 min) |

### Prompts

1. Prompt inicial:

   ```text
   Lee y ejecuta el archivo prework8.md que se encuentra en la ruta ../Repositorios/ai4devs-cuaderno
   ```

2. Prompt ejecutado a partir de `encargo.txt` (paso 4):

   > Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

**Skill invocada durante la sesión:** `/commit`

---

## Sesión 4

| Campo | Valor |
|---|---|
| **Modelo** | Claude Opus 5.5 (`claude-opus-5-5`) |
| **Esfuerzo** | Bajo |
| **Herramienta** | Claude Code (CLI, WSL2, modo auto) |
| **ID de sesión** | `b61431cb-9b77-4d47-ae3f-358699470a49` |
| **Tiempo** | 15:31 – 15:38 (≈ 7 min) |

### Prompts

1. Prompt inicial:

   ```text
   Lee y ejecuta el archivo prework8.md que se encuentra en la ruta ../Repositorios/ai4devs-cuaderno
   ```

2. Prompt ejecutado a partir de `encargo.txt` (paso 4):

   > Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

**Skill invocada durante la sesión:** `/commit`

---

## Sesión 5

| Campo | Valor |
|---|---|
| **Modelo** | Claude Opus 5.5 (`claude-opus-5-5`) |
| **Esfuerzo** | Bajo |
| **Herramienta** | Claude Code (CLI, WSL2, modo auto) |
| **ID de sesión** | `0a919817-f1a4-470c-8070-b17d1ab0884d` |
| **Tiempo** | 15:43 – 15:48 (≈ 5 min) |

### Prompts

1. Prompt inicial:

   ```text
   Lee y ejecuta el archivo prework8.md que se encuentra en la ruta ../Repositorios/ai4devs-cuaderno
   ```

2. Prompt ejecutado a partir de `encargo.txt` (paso 4):

   > Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

**Skill invocada durante la sesión:** `/commit`
