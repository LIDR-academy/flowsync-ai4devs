## Context

Los tres defectos vienen de sitios distintos y se agrupan por una sola razón: los tres son comportamiento observable que la spec viva no decide, y dejarlos abiertos los consagra por omisión.

Lo que condiciona el diseño:

- La validación es VineJS 4, y sus reglas **mutan el valor** en el orden en que se declaran. Eso permite normalizar antes de comprobar unicidad, que es justo lo que H-11 necesita.
- `frontend/src/lib/api.ts` es el único punto de contacto con el backend. Cualquier respuesta del servidor pasa por ahí, incluida la que rechaza la credencial.
- La base es SQLite y guarda las marcas de tiempo con precisión de segundo. El objeto en memoria tiene milisegundos.

## Goals / Non-Goals

**Goals**

- Que el email identifique a la persona, no a cómo la escribió ese día.
- Que el producto nunca dé una instrucción que él mismo bloquea.
- Que un mismo dato no valga dos cosas según por dónde se lea.

**Non-Goals**

- Unificar cuentas ya duplicadas por este defecto. Ver Migration Plan.
- Tocar la caducidad de las credenciales ni su duración.
- Añadir refresco automático de la lista. Sigue fuera de alcance, como en `add-task-list`.

## Decisions

### D1 · El email se normaliza al entrar al sistema, no al guardarlo

La normalización se declara en el validador, antes de la regla de unicidad.

**Alternativa descartada:** un hook `beforeSave` en el modelo. Es tentador porque centraliza, pero rompe: la regla de unicidad consultaría el valor sin normalizar, daría por libre un email que en realidad ya existe, y el índice único de la base reventaría después con un error de servidor. El usuario vería un 500 en lugar de «ese email ya está registrado».

**Alternativa descartada:** normalizar en cada controlador. Funciona hoy con dos controladores y falla el día que aparezca el tercero y alguien lo olvide.

> **Corrección posterior (revisión adversarial).** Este apartado invocaba «mejor imposible que disciplinado», y el validador por sí solo **no** hace imposible el duplicado: cualquier escritura que no pase por él (un seeder, un comando de ace) lo reabre, porque el índice de la tabla compara byte a byte. Se añadió un índice único sobre `lower(email)` como segunda línea de defensa, verificado insertando un duplicado directamente en la base. Con el alfabeto latino acentuado ese índice no llega, porque `lower()` de SQLite es ASCII; ahí sigue protegiendo solo el validador. La garantía es fuerte, no absoluta, y conviene decirlo así.

> **Corrección posterior.** El texto daba a entender que el 500 contra el índice dejaba de ser posible. Deja de serlo en secuencia. Dos altas **simultáneas** con el mismo email siguen produciendo un 500, porque la regla `unique` consulta y escribe en dos momentos distintos. No lo introduce este cambio y no lo resuelve.

### D2 · Solo se baja a minúsculas, sin trucos por proveedor

`normalizeEmail` de VineJS arrastra transformaciones específicas de Gmail y otros: quitar puntos, quitar la parte tras el `+`, convertir dominios. Se apagan todas explícitamente.

Quitar el `+etiqueta` cambiaría la identidad de la cuenta, y hay gente que lo usa a propósito para separar correo. Un cambio pensado para arreglar un defecto de identidad no puede introducir otro.

Lo que queda activo es lo único que resuelve H-11: pasar la dirección entera a minúsculas.

### D3 · Los datos existentes se normalizan con una migración

Sin ella, quien se registró como `Ada@…` deja de poder entrar en cuanto el login normalice, porque su fila sigue en mayúsculas.

**Alternativa descartada:** hacer la búsqueda insensible a mayúsculas y dejar los datos como están. Deja el problema vivo en la base, hace que cada consulta futura tenga que acordarse, y no impide seguir creando duplicados desde otra vía.

La migración no crea, borra ni altera ninguna columna: actualiza filas. Su `down()` no hace nada, y no puede hacer nada: las mayúsculas originales no se guardan en ningún sitio. Es aceptable, porque ningún comportamiento dependía de ellas.

> **Corrección posterior (revisión adversarial).** La primera versión normalizaba con `lower()` de SQL, que solo baja el ASCII. Una cuenta como `JOSÉ@…` quedaba como `josÉ@…`, un valor que la aplicación no genera nunca y con el que esa cuenta no podía volver a entrar. La migración normaliza ahora en JavaScript con **la misma función exportada que usa el validador**, para que ambas no puedan discrepar.

### D4 · Un 401 en cualquier momento cierra la sesión

`lib/api.ts` expone un punto de suscripción, y el proveedor de sesión se engancha ahí. Cuando el servidor rechaza una credencial, el proveedor limpia el estado local y deja escrito el motivo, que la pantalla de acceso ya sabe pintar.

**Alternativa descartada:** que cada pantalla capture su propio 401 y decida. Es lo que hay hoy, y produce exactamente el callejón sin salida: la pantalla de tareas capturó el error y lo pintó, pero nadie tocó el estado de sesión.

**Alternativa descartada:** que el aviso de la lista ofrezca un botón de salir. Arregla la pantalla que ya conocemos y deja el defecto en las que vengan.

El arranque ya trataba el 401, y se mantiene: es el único caso donde un fallo de red no debe cerrar la sesión, porque el token puede seguir siendo bueno.

### D5 · La respuesta de escritura devuelve lo persistido

Tras guardar, el modelo se relee antes de serializar.

**Alternativa descartada:** truncar la marca de tiempo al serializar. Esconde el desajuste en la capa de presentación en vez de quitarlo, y deja el objeto en memoria diciendo una cosa y la base otra.

El coste es una consulta por escritura, que sustituye a la carga del responsable en lugar de sumarse a ella: se relee y se precarga en la misma. A cambio, la respuesta de escritura y la de lectura son el mismo dato.

> **Corrección posterior (revisión adversarial).** La primera versión usaba `refresh()` seguido de `load('assignee')`, que son dos consultas y no una como decía este apartado. Se sustituyó por una única consulta con `preload`.

## Risks / Trade-offs

**La migración puede fallar si ya existen dos cuentas que solo se diferencian en mayúsculas** → Falla ruidosamente contra el índice único, que es lo correcto: son dos personas o una persona duplicada, y unificarlas es una decisión con datos detrás que no puede tomar una migración. Si ocurre, se resuelve a mano antes de volver a lanzarla. En la base actual no ocurre, y se comprueba antes.

**Cerrar la sesión ante cualquier 401 puede expulsar a alguien por un fallo puntual del servidor** → Solo se actúa sobre el 401, que significa credencial rechazada. Un servidor caído responde 500 o no responde, y esos casos no tocan la sesión.

**Se toca código de producto en las dos capas** → Es el objeto del cambio. Lo que sí se mantiene es la separación: este cambio no añade pruebas de arnés ni refactoriza nada de paso.

## Migration Plan

Una migración normaliza los emails existentes. Antes de aplicarla se comprueba que no haya colisiones; si las hubiera, se paran y se resuelven a mano.

Reversión: la migración tiene vuelta atrás en cuanto a estructura, pero no restaura las mayúsculas originales. No hace falta, porque ningún comportamiento depende de ellas.

## Open Questions

Ninguna. La única decisión de producto que había, cómo tratar las mayúsculas del email, se resuelve en D1 y D2 en el sentido estándar: el email identifica a la persona con independencia de cómo se escriba.
