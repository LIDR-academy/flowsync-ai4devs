# Eval — la regla del README de capability

Medición de una sola regla de proceso de [`CLAUDE.md`](../../CLAUDE.md):

> Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra
> en el mismo commit con el documento OpenAPI y el README de esa capability al día.

## Parte A · la medición

**Apuesta previa: 3 de 5.**

**Encargo**, idéntico en los cinco intentos, pegado entero en una sesión nueva y sin recordar la regla:

> Añade a la capability tasks el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve
> 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás
> de tasks.

**Reset entre intentos:** `git checkout -f s8/start`, `git reset --hard upstream/s8/start`,
`git clean -fd`, comprobado con `git status -sb`.

**Comprobación:** sobre el diff de cada commit, no sobre lo que el agente dijo haber hecho.

| # | Commit | Control: ¿ruta `DELETE` declarada? | Resultado: ¿el README menciona el endpoint? |
|---|---|---|---|
| 1 | `030bd34` | sí | sí |
| 2 | `7072738` | sí | sí |
| 3 | `75b7d56` | sí | sí |
| 4 | `327a6c0` | sí | sí |
| 5 | `b9f5fd2` | sí | sí |

Los cinco añaden `router.delete(':id', [controllers.Tasks, 'destroy'])` en `backend/start/routes.ts`
y una fila `DELETE /tasks/:id` en `docs/capabilities/tasks/README.md`.

**Resultado: 5 de 5.** Ningún intento descartado: el control pasó las cinco veces.

### Lo que varía aunque las dos casillas salgan iguales

- **Tests.** Los intentos 1, 2 y 4 crearon `backend/tests/functional/tasks/delete.spec.ts`; el 3 y el
  5 no. Mismo encargo, misma regla, cobertura distinta.
- **Profundidad del README.** El diff del README va de 1 línea neta (`327a6c0`) a 20 (`7072738`).
  Los cinco "mencionan el endpoint"; no los cinco dicen lo mismo sobre él.
- **La otra mitad de la regla también salió 5/5.** Los cinco regeneran `docs/api/openapi.json` y
  `backend/.adonisjs/` en el mismo commit.

## Parte B

### 1. Apuesta y resultado

Aposté 3 de 5. Salió 5 de 5, con las cinco ejecuciones completas. Me quedé corto.

### 2. Qué haría con ese número

Dejarla escrita tal cual: ni borrarla ni reescribirla ni automatizarla todavía.

Automatizar una regla que no ha fallado nunca es escribir un check para un bug que no existe. Y
5/5 no es "100%": con n=5 el límite inferior al 95% de confianza es ≈55%, así que lo que he medido
no es que la regla sea infalible, es que no he encontrado su punto de rotura. El umbral para mover
ficha es un solo fallo, no un número mejor.

Lo que sí saco en claro es *por qué* esta regla en concreto aguanta, porque eso es lo transferible:
nombra la ruta exacta del fichero (`docs/capabilities/<nombre>/README.md`), su condición de disparo
es inequívoca —el encargo dice literalmente "declara su ruta"— y vive pegada a otra regla que ya
tiene CI (`openapi:check`). Una regla vaga en cualquiera de esos tres ejes no habría dado 5/5.

### 3. Una cosa que esta medición no está midiendo

**La independencia entre intentos.** El reset de git deja el código en `s8/start`, pero no toca la
memoria persistente: el hook `SessionStart` inyecta en cada sesión nueva las observaciones de las
anteriores, y ahí ya estaba escrito, literalmente, "DELETE /api/v1/tasks/:id implementado en rama
`feat/tasks-delete`... README de la capability actualizado". Los intentos 2 a 5 arrancaron sabiendo
cómo terminó el 1. Eso no son cinco medidas de lo mismo: es una medida y cuatro repeticiones con
pista. La medición limpia exige resetear también la memoria, no solo el árbol de trabajo.

Y una segunda, más barata de decir: la casilla pregunta si el README **menciona** el endpoint, no si
lo documenta bien. El intento 3 pasa con una fila en una tabla; el 2 pasa explicando además que el
borrado no tiene requisito en la spec. La misma casilla marcada esconde dos trabajos distintos.
