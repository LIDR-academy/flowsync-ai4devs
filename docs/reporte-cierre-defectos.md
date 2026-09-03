# Reporte de cierre de defectos

> Qué se arregló, por qué se arregló así, y qué estaba escrito de forma que no correspondía con el código.
>
> Rama `s3/start` · PR [#15](https://github.com/LIDR-academy/flowsync-ai4devs/pull/15) · 2026-08-26
>
> Versión navegable: [`artefactos/reporte-cierre-defectos.html`](artefactos/reporte-cierre-defectos.html), también publicada en https://claude.ai/code/artifact/9e67b41f-59e7-48ff-868a-85d376ced163
>
> Describe trabajo hecho sobre la rama `s3/start`. Se conserva aquí porque varios de sus hallazgos siguen vigentes y el registro de cómo se verificaron no debería quedarse en otra rama.

| | |
|---|---|
| Pruebas backend | 37 |
| Pruebas frontend | 21 |
| Hallazgos abiertos | 0 |
| Dependencias nuevas | 0 |

---

## 1. Los tres defectos que quedaban abiertos

Estaban documentados desde el Módulo 3 y sin arreglar porque los tres cambian comportamiento observable, y no cabían en un cambio cuyo objeto era montar el arnés de pruebas. Se cerraron en el change `fix-defectos-abiertos`, que es además el primero que **modifica** una spec viva en vez de crear una.

### H-11 · El email distinguía mayúsculas (alta)

**Por qué dolía.** La parte de dominio de un correo no distingue mayúsculas, así que `Ada@…` y `ada@…` designan el mismo buzón. Se creaban dos cuentas con dos identidades dentro del mismo espacio compartido, y luego la persona no podía entrar porque escribía su correo como lo escribe siempre.

**Arreglo.** Normalización a minúsculas declarada en el validador, **antes** de la regla de unicidad.

**Por qué ahí.** Un hook en el modelo parece lo natural y rompe: la regla de unicidad consultaría el valor sin normalizar, daría por libre un email que sí existe, y el índice de la base reventaría después. El usuario vería un `500` en lugar de «ese email ya está registrado». VineJS muta el valor según avanza, así que el orden de las reglas es la solución.

**Además.** Migración que normaliza las cuentas ya guardadas. Sin ella, quien se registró con mayúsculas dejaba de poder entrar en cuanto el acceso normalizara.

### H-13 · Una sesión caducada dejaba sin salida (media)

**Por qué dolía.** La pantalla decía «Vuelve a iniciar sesión» y a la vez lo impedía: el aviso no ofrecía navegación, el estado local seguía marcado como válido, y el guard rebotaba `/login` de vuelta a `/tasks`. El producto daba una instrucción que él mismo bloqueaba.

**Arreglo.** Un punto de suscripción en `lib/api.ts`, al que se engancha el proveedor de sesión. Cualquier `401`, en cualquier operación, descarta la sesión y deja escrito el motivo.

**Por qué ahí.** Poner un botón en el aviso de la lista habría arreglado la pantalla que ya conocíamos y dejado el defecto en todas las que vinieran. `lib/api.ts` es el único punto de contacto con el backend, así que es el único sitio por el que pasan todas las respuestas.

### H-14 · `updatedAt` valía distinto según el endpoint (baja)

**Por qué dolía.** La escritura devolvía el objeto en memoria, con milisegundos; la lectura siguiente devolvía lo persistido, truncado al segundo. Sin impacto visible hoy, pero es el mismo campo con dos valores.

**Arreglo.** La escritura relee lo persistido antes de serializar, trayendo el responsable con `preload`.

> **Corregido el 2026-09-02.** Aquí decía «en una sola consulta». Son dos: `preload` emite siempre una consulta aparte por relación. Medido con `DEBUG=knex:query` en la sexta revisión adversarial.

**Por qué ahí.** Truncar al serializar escondía el desajuste en la capa de presentación y dejaba el objeto en memoria diciendo una cosa y la base otra.

---

## 2. Lo que la revisión adversarial destapó del propio arreglo

El grupo de cierre de ese change se archivó sin ejecutar, y era justo el que existía para pillar lo que sigue.

### Grave · Se me olvidó una excepción, y reabrió H-11 por otra puerta

Al apagar las transformaciones por proveedor de `normalizeEmail` no incluí `yandex_convert_yandexru`, que viene activa y convierte `yandex.com`, `yandex.ua` y `ya.ru` a `yandex.ru`. Una cuenta creada antes quedaba bloqueada, y al reintentar el alta se creaba una segunda cuenta para el mismo buzón.

El comentario del código afirmaba que estaban todas apagadas. Una lista de excepciones escrita a mano y un comentario que dice «están todas» son la misma clase de error.

```
"Ada@yandex.com" -> "ada@yandex.ru"
"ada@ya.ru"      -> "ada@yandex.ru"    <- dos cuentas distintas colapsadas
```

### Grave · La migración y el validador normalizaban distinto

La migración usaba `lower()` de SQL y el validador normaliza con JavaScript. `lower()` de SQLite solo baja el ASCII, así que una cuenta como `JOSÉ@…` quedaba en `josÉ@…`: un valor que la aplicación no genera nunca, y con el que esa cuenta no podía volver a entrar.

El arreglo no fue corregir la migración. Fue exportar la función del validador y usarla allí, para que las dos no puedan discrepar por construcción.

### Media · Las pruebas por proveedor no vigilaban nada

Usaban `+etiqueta` para todas las familias, pero Yahoo separa con guion y Gmail convierte `googlemail.com`. Un caso de prueba con la sintaxis equivocada pasa siempre. Se comprobó activando las siete transformaciones destructivas de una en una: ahora cada una tumba exactamente una prueba.

### Media · Escritura y lectura se comparaban saliendo del mismo transformer

Las dos pruebas de H-14 comparaban la respuesta de escritura con la de lectura. Ambas salen del mismo transformer, así que borrar `updatedAt` -el campo del que trata H-14- las dejaba iguales y las dos pasaban. Verificaban que coinciden, no que digan algo. Se añadió el conjunto cerrado de campos de tarea.

### Media · Salir a propósito aterrizaba con un aviso de sesión caducada

El arreglo de H-13 avisaba ante cualquier `401`, incluido el de la propia llamada de cierre de sesión cuando el token ya estaba revocado. Regresión introducida por el mismo commit que arreglaba H-13.

### Media · El validador solo no hacía imposible el duplicado

El índice de la tabla compara byte a byte, así que cualquier escritura que no pase por el validador reabre el defecto sin que nada avise. El diseño decía «mejor imposible que disciplinado» y lo que había construido era disciplinado. Se añadió un índice único sobre `lower(email)`, verificado insertando un duplicado directamente en la base. Su límite queda escrito: `lower()` de SQLite es ASCII.

### Menor · Seguía habiendo una pantalla sin salida, para los errores que no son 401

Con el backend caído, la lista mostraba una caja roja sin cabecera, sin enlaces y sin botones. Misma forma de callejón que H-13, distinto disparador. Ahora ofrece reintentar y cerrar sesión.

### Menor · Dos consultas donde el diseño decía una

`refresh()` seguido de `load('assignee')` lanza dos consultas por escritura. Sustituido por `preload`.

> **Este hallazgo se dio por cerrado y no lo estaba**, descubierto el 2026-09-02. `preload` también emite dos: una por la tarea y otra por la relación. El diseño decía una y el arreglo tampoco daba una. Medido, no supuesto.
>
> Se deja abierto como lo que es: dos consultas por escritura, aceptadas. Bajarlo a una exigiría un join a mano, y son tres rutas.

---

## 3. Inconsistencias entre lo escrito y lo que hace el código

Son la parte más incómoda del informe. Ninguna rompía nada, y todas mandaban a quien las leyera en la dirección equivocada.

### H-05 describía un código que nunca ha existido

El hallazgo, escrito en el Módulo 1, decía que `api.ts` traducía los errores mediante un diccionario indexado por el **texto literal** del mensaje, con el ejemplo `'The email has already been taken'`. Ese código no existe en ninguna rama del repositorio.

```
$ for r in main s1/start s1/end s2/start s3/start; do
    git show upstream/$r:frontend/src/lib/api.ts | grep -c "has already been taken"; done
0 0 0 0 0
```

`api.ts` ya mapeaba por `rule` y `field` desde la primera rama, que es exactamente lo que el propio hallazgo proponía como solución. **Un hallazgo documentado no es un hallazgo verificado.**

Reescrito con el riesgo que sí existe: los nombres de regla los emiten VineJS y Lucid, no nosotros. Ahora lo vigilan las dos mitades, el backend asertando `rule` en cada rechazo y el frontend cubriendo el diccionario.

### H-03 describía una función que no existe

Decía que `api.ts` «separa `send()` de `request()`, y logout usa el primero». No hay ningún `send()`.

### El `CLAUDE.md` del proyecto quedó mintiendo en tres frases

Tras montar el arnés de pruebas seguía diciendo que los directorios de test no existen, que el frontend no tiene runner, y -la peor- que la base de datos de tests pega contra la de desarrollo y que te montes los hooks a mano.

Esa última manda directamente hacia la alternativa que el diseño había descartado, y es el primer fichero que lee cualquiera que llegue al repo. **Actualizar la documentación de contexto es parte del cambio, no algo que se hace después.**

### El propio registro de hallazgos se contradecía

La tabla del índice marcaba tres entradas como resueltas mientras sus cuerpos seguían diciendo «Abierto», la cabecera llevaba una fecha anterior a las entradas, y la severidad de H-11 no coincidía entre documentos.

### Un escenario colgaba del requisito equivocado

«Lo que devuelve crear es lo que devuelve leer» estaba bajo el requisito de cambiar el estado desde la lista. Crear una tarea no es cambiarle el estado.

---

## 4. Un error de reporte propio

Se reportó `npm run lint` del backend como limpio cuando estaba fallando. El `| tail -1` del comando se comió el error y quedó a la vista la última línea, que no era la del fallo. Arreglado, y desde entonces la verificación se hace por código de salida y no por lo que imprime la última línea.

---

## 5. Cómo se verificó

Cada arreglo se comprobó revirtiéndolo. Una prueba que no falla cuando el código está roto no es una prueba.

| Mutación aplicada al código de producción | Pruebas que caen |
|---|---|
| Quitar la normalización del email | 4 |
| Activar cualquiera de las 7 transformaciones por proveedor | 1 cada una |
| Quitar la relectura de lo persistido | 2 |
| Quitar `updatedAt` del transformer de tarea | 1 |
| Quitar `initials` y `createdAt` del transformer de usuario | 4 |
| Invertir el orden de las reglas del validador | 1 |
| Sustituir la respuesta 404 por una excepción lanzada | 1 |

Y en navegador real, sobre el sistema levantado:

| Comprobación | Resultado |
|---|---|
| Alta con `Sonda@Yandex.COM` | Se guarda `sonda@yandex.com`, sin conversión de dominio |
| Acceso escribiendo el email en mayúsculas | Entra a la lista |
| Crear tarea y cambiar estado desde la lista | Correcto, con el responsable y el estado inicial que pone el servidor |
| Escritura frente a lectura de una tarea | Idénticas campo por campo |
| Credencial revocada con la lista abierta | Lleva al acceso **sin recargar**, explicando por qué |
| Error de servidor en la carga de la lista | Ofrece reintentar y cerrar sesión, y conserva la sesión |

---

## 5 bis. Lo que se arrastra

> Sección añadida el 2026-09-02, cuando se estableció la regla de arrastrar el registro de hallazgos entre módulos. Refleja el estado **al cerrar el Módulo 3**, sobre `s3/start`.
>
> **Corregida el 2026-09-02, el mismo día.** La primera versión marcaba H-11, H-13 y H-14 como `Cerrado | —`. Lo estaban en `s3/start` y **no en `s4/start`**, donde seguían vivos: el arreglo nunca cruzó de rama. Es H-22, y la columna «Qué pasó después» lo recoge.

| # | Hallazgo | Desde | Estado al cerrar el Módulo 3, en `s3/start` | Qué pasó después, comprobado en `s4/start` |
|---|---|---|---|---|
| H-19 | Las respuestas de error revelan internals | Módulo 3, lo destapó `/verify` | **Arreglado solo en una ruta.** D12 diagnosticó la causa general y aplicó un arreglo local | Reapareció en `s4/start`. Cerrado del todo el 2026-09-02, en dos pasos: ADR-0005 y su revisión |
| H-11 | El email distingue mayúsculas | Módulo 3 | Cerrado en `s3/start` | **Vivo en `s4/start`.** Comprobado por API: `REV@EXAMPLE.COM` creó una segunda cuenta. Portado el 2026-09-02 |
| H-13 | Sesión caducada sin salida | Módulo 3 | Cerrado en `s3/start` | **Vivo en `s4/start`.** Sin punto de suscripción en `lib/api.ts`. Portado el 2026-09-02 |
| H-14 | `updatedAt` distinto según el endpoint | Módulo 3 | Cerrado en `s3/start` | **Vivo en `s4/start`**, y en tres escrituras en vez de dos. Portado el 2026-09-02 |
| — | La condición de carrera de `unique` sigue dando 500 | Módulo 3 | **Declarado, no arreglado** | Sigue dando 500, pero el 500 ya no filtra nada (H-19) |

**La lección de esta tabla es H-19.** Se dio por resuelto un defecto cuyo arreglo era local, teniendo escrito en el propio diseño que la causa era general. Esa es exactamente la forma en que un hallazgo sobrevive a un módulo: no por olvido, sino por darlo por cerrado antes de tiempo.

**Y la segunda lección la dio la propia tabla.** Sus tres filas de `Cerrado | —` repitieron el error que existía para evitar, el mismo día en que se escribió la regla. Comprobar una fila cuesta minutos; darla por buena cuesta cero. Por eso la columna nombra ahora la rama en la que se miró.

---

## 6. Lo que queda fuera, y por qué

| Qué | Motivo |
|---|---|
| Dos altas **simultáneas** con el mismo email siguen dando un 500 | La regla de unicidad consulta y escribe en dos momentos distintos. No lo introduce este trabajo y no lo resuelve. Queda escrito en el diseño en lugar de darse por arreglado |
| Escenarios que solo se observan en pantalla | No hay runner de navegador y este trabajo no añade uno. Verificados a mano, uno a uno |
| El enganche del proveedor de sesión no tiene prueba automática | Exigiría jsdom y una librería de componentes. Cubierto por la verificación en navegador |
| Unificar cuentas ya duplicadas por el defecto del email | Es una decisión con datos detrás. Una migración no puede tomarla, y si aparecen colisiones falla en vez de adivinar |

---

El detalle completo, con las alternativas descartadas de cada decisión, está en `openspec/changes/archive/` y en `docs/hallazgos.md`, donde cada entrada indica cómo se verificó.
