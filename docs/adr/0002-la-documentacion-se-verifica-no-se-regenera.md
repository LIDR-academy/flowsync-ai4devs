# ADR-0002 · La documentación se verifica contra el código, no se regenera desde él

## Estado

Aceptada · 2026-08-26

No reemplaza a ninguna decisión anterior. [ADR-0001](0001-aislamiento-de-la-base-de-datos-en-pruebas.md) sigue vigente y trata de otra cosa.

## Contexto

La sesión del módulo entrega cuatro artefactos de documentación viva y resuelve el problema de que se desincronicen **regenerándolos**: instala un generador de OpenAPI, decora los controladores, sirve el documento en `/api`, y añade una regla a `CLAUDE.md` para que ante un cambio en rutas, controladores o validadores se regeneren el documento y el README.

Aquí se hizo distinto sin registrarlo, y esa omisión es el motivo de este ADR. La documentación de este repositorio está **escrita a mano** (`docs/arquitectura.md`, `docs/api/openapi.yaml`, `docs/trazabilidad.md`) y lo que impide que mienta es `scripts/verificar-docs.mjs`, que la contrasta contra el código y falla si dejan de corresponder.

Las dos aproximaciones resuelven el mismo problema y no son intercambiables, así que la elección merecía quedar escrita.

Lo que empujó hacia esta: durante este trabajo, **la primera versión del verificador dio luz verde mientras tres documentos afirmaban comportamientos que la API no tenía**. Comprobaba lo fácil. Ese incidente enseñó que el valor no está en el documento sino en lo que lo contrasta, y que un contraste flojo es peor que ninguno porque da una garantía que no existe.

## Decisión

La documentación se escribe a mano y **se comprueba automáticamente**.

`scripts/verificar-docs.mjs` corre en CI y falla la build cuando el documento y el código dejan de decir lo mismo. Hoy comprueba trece cosas, y dos de ellas -que la regla de vencimiento tenga sus tres condiciones y que el filtro esté acotado al conjunto de estados- corresponden a defectos reales que estuvieron en el repositorio.

Toda comprobación que se añada tiene que **demostrarse mutando el código** y viendo que falla. Una comprobación que no se ha visto fallar no cuenta.

## Alternativas consideradas

**Generar y servir la documentación, como hace la sesión.** Es la alternativa fuerte y tiene una ventaja que esta decisión no da: el documento no puede quedarse atrás porque nace del código en cada build, y además queda navegable en una URL.

Se descarta por tres motivos, y ninguno es que sea peor en abstracto:

1. Añade una dependencia y un provider al backend, y el módulo anterior cerró con la regla de no añadir dependencias sin aprobación explícita.
2. Un generador documenta **lo que el código hace**, no lo que debería hacer. Ninguno de los tres defectos de este módulo se habría notado en un OpenAPI generado: habría documentado fielmente que el filtro acepta cualquier cadena. El contraste, en cambio, compara el código contra la spec.
3. La regla que la sesión pone en `CLAUDE.md` depende de que el asistente la respete en cada cambio. La comprobación en CI no depende de nadie.

**No documentar la API y confiar en la spec viva.** La spec describe comportamiento observable en lenguaje de producto; el contrato describe cuerpos, códigos y esquemas. Son capas distintas y quien integra necesita la segunda.

## Consecuencias

El documento hay que actualizarlo a mano cuando cambia el código, y el verificador solo avisa de lo que sabe comprobar. Es trabajo humano recurrente, no automatizado, y ese es el precio.

A cambio, el contraste puede afirmar cosas que un generador no puede: que la regla de negocio tenga sus tres condiciones, que la comparación sea estricta, o que el responsable no exponga la cuenta. Son propiedades del **diseño**, no de la forma de las rutas.

Queda un hueco conocido: el proyecto no sirve documentación navegable en ninguna URL. Si eso se vuelve un requisito, la decisión hay que revisarla, y entonces sí correspondería un ADR nuevo que reemplace a este.

`CLAUDE.md` recoge la regla de proceso que se deriva de aquí: al tocar rutas, controladores o validadores, actualizar el contrato y ejecutar el verificador antes de cerrar.

## Corolario · la forma del error también es contrato

Escribir un contrato obliga a decidir cosas que la spec deja abiertas, y conviene registrarlas donde se decidieron.

La spec exige `404` ante un recurso que no existe, y **no dice nada del cuerpo**. Al documentarlo se eligió que salga como `{ errors: [{ message }] }`, igual que todos los errores que el proyecto controla, en lugar del volcado de depuración que devolvía el framework. Se normaliza en el manejador de excepciones y no en cada controlador, porque son tres rutas hoy y cualquiera que se añada mañana heredaría el mismo agujero.

Ese 404 no lleva `field` ni `rule`: no viene de validar un campo, y ponerlos sería inventar una causa.

Queda atado por una comprobación del verificador y por `tests/functional/tasks/inexistente.spec.ts`, que mira el cuerpo y no solo el código de estado. Sin las dos cosas, el contrato volvería a mentir en silencio, que es exactamente lo que ya pasó una vez.

**Alcance de este corolario**: decide la **forma** del cuerpo del 404, no si las respuestas revelan internals. Eso último lo decidió después [ADR-0003](0003-el-volcado-de-depuracion-va-apagado.md), apagando el volcado de depuración en todos los entornos y cerrando H-19.

Las dos piezas son complementarias y ninguna sobra: sin ADR-0003 el cuerpo llevaría la traza; sin esta normalización el 404 saldría limpio pero con la forma escueta del framework en vez de la que documenta el contrato.
