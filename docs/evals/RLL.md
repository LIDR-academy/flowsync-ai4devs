# Eval · la regla del README de capability

Medición de una regla de proceso del `CLAUDE.md` de este proyecto, hecha el 21 de septiembre de 2026.

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

### La condición de control: el mismo encargo sin la regla

Un 5 de 5 no dice cuánto de eso lo hace la regla, así que se repitió el encargo una vez más con el `CLAUDE.md` del proyecto **sacado del repositorio**, y todo lo demás igual.

| Intento | Sesión | Turnos | Duración | Ruta `DELETE` | README al día | Rama que creó | Commiteó |
| --- | --- | --- | --- | --- | --- | --- | --- |
| control | `cb313720` | 40 | 6m 28s | sí | sí | ninguna, se quedó en `s8/start` | no |

Sin la regla escrita en ninguna parte, el README quedó al día igual, con la misma fila y el mismo formato. Lo que sí cambió al quitar el archivo fue otra cosa: los cinco intentos con `CLAUDE.md` crearon su rama `feat/…` y el control no, que es exactamente la otra regla del mismo archivo.

Coste de todo: 10,08 USD y unos 35 minutos de reloj para las seis ejecuciones.

### Un dato que salió de lado

La regla tiene dos mitades, y la otra se cumplió **2 de 5**: «se cierra en el mismo commit». Tres intentos dejaron todo el trabajo sin commitear. La mitad que el ejercicio manda medir es la que sale bien; la que no se mide es la que falla.

### En qué condiciones está medido

Las seis sesiones se lanzaron sin interfaz (`claude -p`, Claude Code 2.1.272 en WSL) desde la raíz del repositorio, con los permisos concedidos de antemano, y las resolvió Sonnet 5 (con Haiku 4.5 en subtareas). El control retira el `CLAUDE.md` del proyecto, no el `CLAUDE.md` de usuario de la máquina, que sigue cargándose en las seis. Una sesión interactiva, otro modelo u otro día son otra medición.

## Parte B · las tres líneas

**1. Apuesta y resultado.** Aposté 2 de 5 y salió 5 de 5, con las cinco ejecuciones hechas, más un control sin la regla que también salió al día: me equivoqué en la dirección de la sorpresa, que es justo para lo que servía escribir la apuesta antes.

**2. Qué haría con ese número.** Quitar la mitad del README de las instrucciones y convertirla en un check que se ejecute solo, porque el control dice que esa mitad se cumple igual sin la regla, así que hoy no está comprando el comportamiento que parecía comprar, y un 5 de 5 con cinco intentos tampoco distingue entre cumplirse siempre y cumplirse la mitad de las veces; la mitad del commit, que falla 3 de 5 y sí depende del archivo, es la que merece bajar a algo que mire el diff y se ponga en rojo.

**3. Una cosa que esta medición no está midiendo.** Si lo que el README dice es verdad: la comprobación es un `grep` que se conforma con que la línea exista, y nadie ejecutó el endpoint para ver si de verdad responde `204` sin cuerpo, así que un README que documentara mal el endpoint puntuaría igual de bien que uno correcto.
