## Why

La revisión adversarial del PR #15 y la spec viva de `auth` dejaron tres defectos reales documentados en `docs/hallazgos.md` y sin arreglar, porque los tres cambian comportamiento observable y no cabían en un cambio cuyo objeto era montar el arnés de pruebas.

**H-11**, severidad alta. El email distingue mayúsculas de minúsculas, así que `Ada@flowsync.test` y `ada@flowsync.test` son dos cuentas distintas. La misma persona puede registrarse dos veces sin enterarse, y luego no poder entrar porque escribe su correo como lo escribe siempre. La spec de `auth` calla sobre esto a propósito: describir la conducta actual habría convertido el defecto en contrato. Este cambio la decide.

**H-13**, severidad media. Si la credencial deja de valer con la lista de tareas abierta, la pantalla dice «Vuelve a iniciar sesión» y a la vez impide hacerlo: el aviso no ofrece navegación, la sesión local sigue marcada como válida y el guard rebota `/login` de vuelta a `/tasks`. Solo recargar lo desatasca. El producto da una instrucción que él mismo bloquea.

**H-14**, severidad baja. La respuesta de escritura de una tarea devuelve el objeto en memoria, con milisegundos, y la lectura siguiente devuelve lo persistido, truncado al segundo. El mismo campo vale distinto según el endpoint.

Cerrarlos ahora tiene un motivo de calendario además del técnico: la spec viva es la fuente de verdad con la que se trabaja a partir de aquí, y arrastrar tres defectos conocidos dentro de ella los convierte en contrato por omisión.

## What Changes

- El email pasa a identificar a la persona con independencia de cómo lo escriba, tanto al darse de alta como al entrar.
- Las cuentas que ya existan se normalizan, para que el cambio no parta el acceso de nadie.
- Una credencial rechazada en cualquier momento, no solo al arrancar, cierra la sesión y lleva a la pantalla de acceso explicando por qué.
- Las marcas de tiempo de una tarea valen lo mismo tanto si se acaba de escribir como si se acaba de leer.

## Impact

- Specs afectadas: `auth` (dos requisitos modificados, uno añadido), `tasks` (un requisito modificado).
- Se toca código de producto en las dos capas. Es el objeto del cambio, no un efecto colateral.
- Sin dependencias nuevas.
- Hay migración de datos: los emails ya guardados se normalizan. Ver `design.md`.
