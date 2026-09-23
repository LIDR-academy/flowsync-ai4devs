# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

- **Herramienta:** ZCode (agente CLI interactivo) — no Claude Code.
- **Modelo:** GLM-4.7 (`builtin:zai-coding-plan/GLM-4.7`), el mismo en todos los prompts.
- **Sesión:** única, 2026-09-23. Un intento del encargo (1 de los 5 previstos).

---

## Prompt 1

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
Estoy realizando una actividad práctica del máster AI4Devs y necesito completar un encargo específico sobre este repositorio con un flujo de trabajo asistido muy controlado.

El encargo consiste en añadir a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve un código de estado 204 sin cuerpo.

REGLA DE INTERACCIÓN OBLIGATORIA:
Antes de ejecutar cualquier acción (leer o modificar archivos, ejecutar comandos o hacer commits), debes:
1. Explicarme brevemente qué paso vas a dar y por qué.
2. Pedirme autorización explícita para continuar.
3. Esperar a que yo te responda "adelante" o "aprobado" antes de ejecutar la acción.

Flujo de pasos a seguir para la actividad:

1. **Análisis previo e Implementación backend:**
   - Explicar qué archivo del controlador e inspección de rutas vas a modificar.
   - Implementar la lógica de borrado en el controlador de `tasks` existente y declarar la ruta `DELETE /api/v1/tasks/:id`.

2. **Verificación de tests:**
   - Explicar el comando que ejecutarás para validar los tests del backend: `(cd backend && npm test)`.

3. **Documentación (Paso clave del ejercicio):**
   - Explicar los cambios que harás en `docs/capabilities/tasks/README.md` y en la especificación OpenAPI para dejar la documentación al día con el nuevo endpoint.

4. **Cierre y Commit:**
   - Mostrar el estado del repositorio (`git status`) y pedir confirmación para realizar el commit final con los cambios de código y documentación.

Comienza presentándote, confirmando que has entendido esta dinámica de trabajo e indicándome cuál es el primer paso que propones dar.
```

**Qué salió:** funcionó a la primera; el agente inspectó antes de tocar nada y propuso los pasos
en el orden pedido. Ojo: el punto 3 del flujo le recuerda la regla del README/OpenAPI dentro del
propio encargo — está analizado en `docs/evals/GT.md`.

## Prompt 2

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
adelante
```

**Qué salió:** inspección de solo lectura (controlador, rutas, CLAUDE.md, README de la capability,
schemas OpenAPI, estado del entorno). Destapó que el clon aún no tenía `node_modules` ni `.env`.

## Prompt 3

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
adelante
```

**Qué salió:** creó la rama `feat/delete-task`, instaló dependencias (con los binarios nativos de
`@swc/core` y `better-sqlite3`, que requerían aprobación explícita), preparó `.env` y la BD, e
implementó `destroy` + ruta `DELETE`. Verificó la firma del 204 en los `.d.ts` reales en vez de
confiar en memoria.

## Prompt 4

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
Adelante
```

**Qué salió:** tests en verde (23/23), pero el diff de `.adonisjs/` quedó vacío: el registro Tuyau
solo se regenera arrancando el dev server, no con los tests. El agente lo diagnosticó leyendo el
código del hook y lo propuso como paso aparte.

## Prompt 5

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
Adelante
```

**Qué salió:** arranque efímero del dev server (25 s con timeout); registro Tuyau regenerado con
la ruta `DELETE` y verificado en el diff. Sin este paso, el commit habría llevado los tipos
generados obsoletos y las dos casillas de la medición habrían dado "sí" igualmente.

## Prompt 6

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
Adelante
```

**Qué salió:** `openapi:generate` + `openapi:check` en verde, y README de la capability al día
(tabla, "seis operaciones", envoltorio `{data}` excepto el 204, curl pasos 7/7b).

## Prompt 7

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
Adelante
```

**Qué salió:** commit único `fc6b081` con código + `.adonisjs/` + `openapi.json` + README, como
pide la regla medida. El `package.json` tocado por el setup local se dejó fuera a petición mía.

## Prompt 8

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
ye se entrego la tarea con el pull request?
```

**Qué salió:** respuesta honesta: no — todo estaba solo en local; me listó lo que faltaba
(ficheros de la entrega, push, PR).

## Prompt 9

**Modelo:** GLM-4.7
**Herramienta:** ZCode

```
has todo los procesos q se necesita para entregar la tarea
```

**Qué salió:** este mismo proceso: relleno de `prompts.md` y `docs/evals/GT.md` (con mis
respuestas a apuesta/intentos/decisión), commit, push al fork y apertura del PR.
