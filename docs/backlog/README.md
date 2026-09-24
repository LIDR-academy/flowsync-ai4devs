# Backlog de FlowSync

Backlog del MVP derivado del [PRD](../prd/flowsync-mvp.md). Las historias guardan sus criterios de aceptación en su propio fichero, y los tickets los heredan sin añadir criterios nuevos.

## Índice

### E2 «Gestión de tareas»

| Documento | Contenido |
|---|---|
| [`us-fechas-vencimiento.md`](E2-gestion-tareas/us-fechas-vencimiento.md) | Historia **FS-118** y sus criterios de aceptación |
| [`us-filtrar-por-estado.md`](E2-gestion-tareas/us-filtrar-por-estado.md) | Historia **FS-142** y sus criterios de aceptación |
| [`tickets-FS-118.md`](E2-gestion-tareas/tickets-FS-118.md) | Tickets de FS-118, grafo de dependencias, orden de implementación y estimación |
| [`tickets-FS-142.md`](E2-gestion-tareas/tickets-FS-142.md) | Tickets de FS-142 |
| [`priorizacion.md`](E2-gestion-tareas/priorizacion.md) | Matriz de impacto y complejidad de E2 (más el tiempo real de E3) y orden priorizado del backlog |

## Convenciones de los tickets

- **ID:** se deriva de la historia: FS-118.1, FS-118.2… Los identificadores de las historias los fija producto.
- **Tipo:** uno de estos: Endpoint/API, Migración/DB, Modelo/Dominio, Frontend, Bug o Test.
- **Tamaño:** cada ticket es una unidad de trabajo que una persona termina en una sesión, de media jornada como máximo.
- **Criterios:** el ticket **hereda** los criterios de su historia. Su Definition of Done dice *cómo se entrega* (tests, manejo de errores, convenciones); no añade criterios.
- **Capa:** el ticket **dice qué capa toca** (migración, modelo, endpoint o UI), pero **no la diseña**. Tipos de columna, si un campo admite nulos, índices, nombres de ruta y códigos de estado se deciden al implementar.
- **Estimación:** se da en tallas (S, M, L), nunca en horas. Si una historia todavía no se ha estimado, se indica en su fichero de tickets.

## Dependencias externas

Son dependencias que vienen de trabajo fuera de estas historias. Hoy el repo no tiene tareas: solo existen la autenticación y los usuarios.

| ID | Qué hace falta | De dónde viene |
|---|---|---|
| **EXT-1** | Que la tarea exista, con título, responsable y los estados Libre, En curso y Terminada, y que se pueda crear | HU-E2-01 y el resto de E2 |
| **EXT-2** | Que existan las suites `tests/unit` y `tests/functional`, con la base de datos aislada mediante `testUtils.db()` | **Nadie la tiene asignada.** Hoy solo existe `tests/bootstrap.ts`, y la base de datos de test es la misma que la de desarrollo |
| **EXT-3** | Que la lista de tareas exista de punta a punta: la API que la devuelve y la pantalla que la muestra | RF-18 (E3) |
| **EXT-4** | Que se pueda crear y tomar una tarea | HU-E2-01 y HU-E2-02 (solo afecta a CA-10 y CA-11 de FS-142) |

## Definition of Done por tipo

Cada ticket cumple la DoD de su tipo más la DoD propia que aparezca en su ficha.

### Migración/DB
- [ ] La migración se crea con `node ace make:migration` y tiene `up` y `down`.
- [ ] Sobre una base de datos que ya tiene tareas, `migration:run`, después `migration:rollback` y otra vez `migration:run` se ejecutan sin errores.
- [ ] `database/schema.ts` se regenera con `migration:run`, nunca se edita a mano, se formatea con `npm run format` para que el lint quede limpio, y se commitea.
- [ ] El modelo no declara columnas: las hereda del esquema generado.
- [ ] `npm run lint` y `npm run typecheck` del backend pasan.

### Modelo/Dominio
- [ ] La regla vive en una sola capa de dominio, no repartida entre el controlador y el componente.
- [ ] Hay tests en la suite `unit`, uno por cada criterio heredado, incluidos los casos límite.
- [ ] Los tests fijan la fecha de «hoy» y no dependen del reloj real.
- [ ] Lint y typecheck pasan.

### Endpoint/API
- [ ] El validador es de VineJS, está en `app/validators/`, se crea con `vine.create` y reutiliza los builders de campo que ya existan.
- [ ] La respuesta pasa por `serialize()` con un transformer de `app/transformers/`, nunca se devuelve el modelo sin transformar.
- [ ] La ruta está en el grupo protegido con `middleware.auth()`, y el controlador se referencia vía `#generated/controllers`.
- [ ] Los errores de validación salen en el formato de VineJS que `lib/api.ts` ya traduce.
- [ ] Hay tests en la suite `functional` que cubren el camino feliz, el error de validación y la petición sin sesión, aislados con `testUtils.db()`.
- [ ] `.adonisjs/` (registro de controladores y de Tuyau) se regenera y se commitea.
- [ ] `lint`, `typecheck` y `format` del backend pasan.

### Frontend
- [ ] Todas las llamadas pasan por `src/lib/api.ts`, y los tipos de `src/lib/types.ts` reflejan el transformer.
- [ ] Los errores se muestran a través de `ApiError`, con el mensaje en castellano. Cada campo nuevo tiene su etiqueta en `FIELD_LABELS`.
- [ ] Los componentes de shadcn se traen con `npx shadcn@latest add`, y `src/components/ui/` no se edita a mano.
- [ ] Se cumple RNF-7: todo se puede hacer con el teclado y el color nunca es la única señal.
- [ ] `npm run build` (incluye el typecheck), `npm run lint` (oxlint) y Prettier pasan.
- [ ] **El frontend no tiene runner de tests.** La verificación manual de cada criterio heredado se documenta en el PR, con los pasos seguidos y el resultado.

### Test
- [ ] Cada criterio de la historia tiene su caso de prueba.
- [ ] Se ejecuta sobre un entorno limpio, empezando por `migration:fresh`.
- [ ] El resultado de cada criterio (pasa o falla, con evidencia) queda registrado en el PR.
- [ ] Cada criterio que falle se registra como ticket de tipo Bug.

### Bug
- [ ] Hay un test o un procedimiento que reproduce el fallo antes de corregirlo.
- [ ] Se corrige el fallo.
- [ ] El test o el procedimiento pasa después de la corrección.
