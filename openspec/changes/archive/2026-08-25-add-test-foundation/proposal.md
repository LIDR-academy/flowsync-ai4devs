## Why

FlowSync no tiene **ni una sola prueba automatizada**. El backend trae Japa configurado con dos suites declaradas y cero ficheros; el frontend no tiene runner instalado. `npm test` responde `NO TESTS EXECUTED`.

El backlog lo registra como bloqueo transversal **R-7**: no impide escribir código, impide **cerrar** cualquier ticket cuyo Definition of Done pida pruebas. Y anota lo importante: su coste se paga una sola vez, así que el primer trabajo que lo necesite carga con él y los siguientes no.

Este es ese trabajo. La capability `tasks` acaba de entrar sin una sola prueba, y toda su verificación fue manual. Eso no escala: cada cambio futuro sobre el dominio obliga a repetir a mano los 29 escenarios.

**Hay un problema que hay que resolver antes de escribir el primer test.** `backend/config/database.ts` define una única conexión SQLite con la ruta escrita a fuego y **sin override por entorno**, y `backend/.env.test` contiene exactamente una línea: `SESSION_DRIVER=memory`. No toca la base de datos.

Las suites funcionales escribirían sobre el **mismo fichero** que el servidor de desarrollo. Dos formas de que reviente: un test crea datos y contamina la siguiente ejecución, o un `migration:fresh` borra los datos con los que alguien estaba probando a mano. Y falla de forma **intermitente**, que es la categoría de fallo más cara de depurar.

Está documentado como **H-01** en `docs/hallazgos.md`, con severidad alta.

## What Changes

- **Aislar la base de datos de los tests.** Que ejecutar la suite no toque nunca el fichero de desarrollo.
- **Suite funcional del backend** sobre las dos capabilities que ya existen, `auth` y `tasks`, derivada de los escenarios de sus specs vivas.
- **Runner del frontend**, para poder cubrir la lógica de `lib/api.ts`: el desenvolvimiento de la respuesta, la traducción de errores y el desglose por campo.
- Actualizar `docs/hallazgos.md`: H-01 y H-02 dejan de estar abiertos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

Ninguna. **Este cambio declara `skip_specs: true`.**

Las specs describen **comportamiento observable**, y montar infraestructura de pruebas no cambia ninguno: el producto hace exactamente lo mismo antes y después. Escribir un requisito aquí sería inventarlo para satisfacer la validación, que es justo lo que la guía de OpenSpec prohíbe.

Es también la otra mitad del criterio del módulo. Saber cuándo **no** escribir una spec importa tanto como saber escribirla.

Las pruebas no sustituyen a las specs: **verifican que el código cumple las que ya existen**. Los casos salen de `openspec/specs/auth/spec.md` y `openspec/specs/tasks/spec.md`, no se inventan aquí.

## Impact

**Backend.** Configuración de base de datos y entorno de test. Ficheros de prueba nuevos bajo `tests/functional/`. `tests/bootstrap.ts` ya trae enganchados `assert`, `apiClient` con el registro tipado de Tuyau, `dbAssertions`, `authApiClient` y `sessionApiClient`, así que no hay que configurar el arnés: solo escribir casos.

**Frontend.** Una dependencia de desarrollo nueva para el runner, y su script en `package.json`.

**Dependencias.** Aquí sí entra una, y es la excepción que confirma la regla del cambio anterior: no hay forma de tener pruebas de frontend sin runner. Requiere aprobación humana explícita antes del apply.

**Comportamiento del producto.** Ninguno. Si algún test obliga a cambiar código de producto, ese cambio **no cabe aquí**: significaría que hay un defecto, y un defecto se arregla en su propio cambio con su propia discusión.

## Puntos abiertos

| # | Punto abierto | Efecto |
|---|---|---|
| **Cómo aislar** | Hooks de `testUtils.db()` con truncado o transacción, frente a fichero separado por entorno | El primero no toca configuración; el segundo es más limpio pero modifica `config/database.ts`, que es fichero del repo del curso. Se decide en `design.md` |
| **Qué runner** | Vitest es lo natural con Vite, pero es una dependencia y una decisión que perdura | Requiere aprobación explícita |
| **Hasta dónde cubrir** | Cubrir los 62 escenarios de las dos specs es mucho para un primer cambio | Se acota en `design.md`, y lo que quede fuera se declara |

## Fuera de alcance

- **Pruebas de navegador de punta a punta.** Otra decisión y otra dependencia.
- **Cualquier corrección de producto.** Incluido **H-11**, el email que distingue mayúsculas: es un cambio de comportamiento, toca la spec de `auth`, y merece su propio contrato.
- **Cobertura del frontend más allá de `lib/api.ts`.** Los componentes se prueban cuando haya algo que se rompa al cambiarlos.
