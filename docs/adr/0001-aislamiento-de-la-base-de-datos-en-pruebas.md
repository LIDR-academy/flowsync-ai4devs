# ADR-0001 · Aislamiento de la base de datos en las pruebas

## Estado

Aceptada · 2026-08-26. Vigente.

El párrafo «Segundo límite» de las consecuencias se añadió el 2026-08-26 al descubrirlo aplicando la decisión. No cambia la decisión: registra una consecuencia. Un ADR no se edita cuando **la decisión** cambia; entonces se crea uno nuevo que lo reemplaza.

## Contexto

`backend/config/database.ts` declaraba una única conexión SQLite apuntando a `app.tmpPath('db.sqlite3')`, sin ningún override por entorno, y `backend/.env.test` solo cambiaba el driver de sesión. La suite functional escribía, por tanto, sobre el mismo fichero que el servidor de desarrollo.

El proyecto ya conocía el problema y lo sorteaba: cada fichero de prueba declara

```ts
group.each.setup(() => testUtils.db().withGlobalTransaction())
```

y el comentario de cabecera de `tests/functional/auth/signup.spec.ts` lo dice con todas las letras: la transacción se eligió «a propósito» en lugar de un truncado, porque vaciar la base se llevaría por delante los datos de desarrollo.

Funciona mientras todos los ficheros lo declaren. El aislamiento no está en la configuración: está en que nadie se olvide.

Se comprobó si el riesgo era teórico. Se añadió un fichero de prueba que **no** declaraba el hook, escribía una fila y afirmaba `true`:

```
$ node ace test
 PASSED
Tests  21 passed (21)

$ select id, email from users   -- base de DESARROLLO
{ id: 6, email: 'fuga@sonda.test' }     <- la fila del test
{ id: 2, email: 'nuevo@flowsync.local' }
{ id: 1, email: 'test@flowsync.local' }
```

Veintiuna pruebas en verde y una fila de test escrita en la base con la que se estaba trabajando. No es un riesgo teórico: es reproducible en un minuto, y el modo en que falla es el peor, porque no falla. Nada en la salida de la suite dice que acaba de tocar datos de desarrollo.

## Decisión

La conexión elige el fichero según el entorno:

```ts
const databaseFile = app.inTest ? 'db-test.sqlite3' : 'db.sqlite3'
```

Y el runner migra desde cero al arrancar y deshace al terminar, de modo que la base de pruebas no arrastra estado entre ejecuciones.

Los hooks de transacción por fichero **se mantienen**, sin tocarlos. Ya no son la única línea de defensa: son la que aísla un caso de otro dentro de la misma ejecución, que es para lo que sirven bien.

Se descartó **añadir un truncado global en `configureSuite`** como red de seguridad adicional. Cubría el caso del fichero olvidadizo, pero es redundante con las transacciones que todos los ficheros ya declaran, y añade una línea de ruido por cada caso ejecutado. Una vez separado el fichero, lo que un descuido puede ensuciar es una base desechable que se recrea en la ejecución siguiente.

Se descartó también **dejarlo como estaba y documentar la obligación del hook**. Es lo que ya había, con el comentario escrito en el fichero de pruebas, y aun así el descuido es de una línea.

## Consecuencias

Apuntar la suite a la base de desarrollo deja de ser posible. `bin/test.ts` fuerza `NODE_ENV=test` de forma incondicional, así que ni exportando otro valor en la shell se puede. Verificado repitiendo el experimento anterior: la fila del fichero sin hook ya no aparece en desarrollo.

Se paga con un fichero de configuración del repositorio del curso modificado, lo que aleja esta rama del original. Es un cambio de cuatro líneas y queda registrado aquí.

Queda un límite conocido, y conviene decirlo en vez de darlo por resuelto: **el aislamiento entre casos de una misma ejecución sigue dependiendo de que cada fichero declare su hook**. Lo que cambia es el radio del daño. Antes, olvidarlo tocaba los datos de la persona que estaba trabajando; ahora ensucia una base de usar y tirar que la ejecución siguiente recrea desde cero.

`tmp/db-test.sqlite3` queda cubierto por las reglas de ignorado que ya existían (`tmp/*`), así que no hace falta ninguna regla nueva y el fichero no puede colarse en el repositorio.

Segundo límite, encontrado al aplicar esta decisión: la migración de arranque no vacía, comprueba. Si una ejecución se interrumpe antes de su teardown, el fichero de test conserva las filas y la ejecución siguiente falla con `UNIQUE constraint failed`. Ocurrió una vez durante este trabajo. Se acepta y no se añade maquinaria para evitarlo: el modo de fallo es ruidoso, señala la causa, y se resuelve repitiendo la ejecución. Un fallo ruidoso que se arregla solo al reintentar no justifica más piezas móviles.
