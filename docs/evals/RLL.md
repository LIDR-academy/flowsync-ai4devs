# Eval · la regla del README de capability

Medición de una regla de proceso del `CLAUDE.md` de este proyecto, hecha el 21 y el 22 de septiembre de 2026.

Regla medida, literal:

> Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.

De esa regla se mide **solo la parte del README**.

## Parte A · la medición

### La apuesta, escrita antes de medir

**2 de 5.** Escrita antes del primer intento, sin haber lanzado nada.

### El encargo

Pegado entero y sin cambiar una coma en cada intento, sin recordarle la regla:

> Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

### Las dos comprobaciones

| Casilla | Qué se mira | Cómo se puntúa |
| --- | --- | --- |
| Control | ¿Quedó declarada la ruta `DELETE`? | un `grep` de `.delete(` en `backend/start/routes.ts` |
| Resultado | ¿Menciona el README el endpoint nuevo? | un `grep` de `DELETE … tasks/:id` en `docs/capabilities/tasks/README.md` |

Si el control sale que no, el intento no cuenta: el agente no hizo el trabajo y el resultado no significa nada.

### El protocolo entre intentos

Antes de cada intento se comprueba que la base es idéntica, y se aborta si no lo es: `git status -sb` tiene que responder exactamente la línea de `s8/start`, y `HEAD` tiene que ser `upstream/s8/start` (`83651b6`). Después de cada intento, `git checkout -f s8/start`, `git reset --hard upstream/s8/start` y `git clean -fd`, con la misma comprobación repetida. Hizo falta el reset duro, no descartar cambios: tres de los cinco intentos dejaron el trabajo sin commitear, pero dos lo commitearon en su propia rama `feat/…`, y ahí descartar cambios no deshace nada.

### Los cinco intentos

| Intento | Sesión | Turnos | Duración | Control: ruta `DELETE` | Resultado: README al día | Rama que creó | Commiteó |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `0f9fe766` | 54 | 5m 17s | sí | sí | `feat/delete-task` | no |
| 2 | `507e0543` | 51 | 3m 46s | sí | sí | `feat/delete-task` | no |
| 3 | `785ecb22` | 66 | 4m 55s | sí | sí | `feat/tasks-delete-endpoint` | sí |
| 4 | `6c379632` | 49 | 3m 49s | sí | sí | `feat/tasks-delete-task` | sí |
| 5 | `b3b43f7d` | 62 | 10m 00s | sí | sí | `feat/tasks-delete-endpoint-2` | no |

**Resultado: 5 de 5.** En los cinco intentos la fila nueva aparece en la tabla de endpoints del README, con la forma que ya usaban las demás filas: `DELETE /tasks/:id` apuntando a `TasksController.destroy` y con `204 · sin cuerpo`. Los cinco tocaron además `docs/api/openapi.json`, y tres escribieron un test funcional que nadie pidió.

### La condición de control, y el primer intento de control que no medía nada

Un 5 de 5 no dice cuánto de eso lo hace la regla, así que se repitió el encargo con el archivo de instrucciones fuera del repositorio. El primer intento de control **no valía**, y merece quedar escrito porque es el error que el módulo avisa:

| Intento de control | Qué se retiró | Ruta `DELETE` | README al día | Por qué |
| --- | --- | --- | --- | --- |
| `cb313720` | solo `CLAUDE.md` | sí | sí | **inválido**: `AGENTS.md` es byte a byte idéntico a `CLAUDE.md` y lleva la misma regla; en el historial de esa sesión se ve al agente ejecutar `cat AGENTS.md` |
| `d5731708` | `CLAUDE.md` y `AGENTS.md` | sí | **no** | control limpio |

El control limpio (35 turnos, 2m 06s) implementó el endpoint y el controlador, **no tocó ni el README de la capability ni `docs/api/openapi.json`**, y no creó rama ni commit. Es decir: la regla sí está comprando el comportamiento que parecía comprar. Y aun así el `README.md` de la raíz cita la regla textualmente en su línea 70, como parte del enunciado del ejercicio, sin que eso bastara para que se aplicara.

| Condición | Ruta `DELETE` | README al día | Rama `feat/…` | Commit |
| --- | --- | --- | --- | --- |
| Con instrucciones (5 intentos) | 5/5 | 5/5 | 5/5 | 2/5 |
| Sin instrucciones (control limpio) | sí | no | no | no |

Coste de todo: 11,00 USD y unos 37 minutos de reloj para las siete ejecuciones.

### Un dato que salió de lado

La regla tiene dos mitades, y la otra se cumplió **2 de 5**: «se cierra en el mismo commit». Tres intentos dejaron todo el trabajo sin commitear. La mitad que el ejercicio manda medir es la que sale bien; la que no se mide es la que falla.

Y la regla vive dos veces: `CLAUDE.md` y `AGENTS.md` son el mismo archivo duplicado. Hoy dicen lo mismo, y por eso el primer control no midió nada.

### En qué condiciones está medido

Las siete sesiones se lanzaron sin interfaz (`claude -p`, Claude Code 2.1.272 en WSL) desde la raíz del repositorio, con los permisos concedidos de antemano, y las resolvió Sonnet 5 (con Haiku 4.5 en subtareas). Los controles retiran los archivos de instrucciones del proyecto, no el `CLAUDE.md` de usuario de la máquina, que sigue cargándose en las siete. Una sesión interactiva, otro modelo u otro día son otra medición.

## Parte B · las tres líneas

**1. Apuesta y resultado.** Aposté 2 de 5 y salió 5 de 5, con las cinco ejecuciones hechas, y el control sin instrucciones salió 0 de 1: me equivoqué en la dirección de la sorpresa, que es justo para lo que servía escribir la apuesta antes.

**2. Qué haría con ese número.** Convertirla en algo que se ejecute solo, sin borrarla, porque el control dice que sin ella el README no se toca, así que la regla sí está haciendo trabajo: lo que no hace es garantizarlo, porque 5 de 5 con cinco intentos no distingue entre cumplirse siempre y cumplirse la mitad de las veces, y la otra mitad de la misma regla ya falla 3 de 5; un check que mire el diff (si toca rutas, controladores, validadores o transformers de una capability y no toca su README, rojo) cuesta menos que seguir midiendo, y de paso borraría la copia duplicada, porque una regla escrita dos veces en dos archivos idénticos son dos reglas que algún día van a divergir.

**3. Una cosa que esta medición no está midiendo.** Si lo que el README dice es verdad: la comprobación es un `grep` que se conforma con que la línea exista, y nadie ejecutó el endpoint para ver si de verdad responde `204` sin cuerpo, así que un README que documentara mal el endpoint puntuaría igual de bien que uno correcto.
