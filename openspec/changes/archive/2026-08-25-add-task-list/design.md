## Context

Ver `proposal.md` para la motivación. Lo que condiciona el diseño es el estado del repositorio, no el problema de producto.

FlowSync tiene un solo vertical construido, `auth`, y sus convenciones son restricciones, no sugerencias:

- El esquema de datos se **genera** desde las migraciones. Los modelos no declaran columnas: extienden la clase generada.
- Toda respuesta pasa por `ctx.serialize()`, que envuelve el payload bajo `data`. La única excepción conocida es el cierre de sesión.
- La validación entra por VineJS antes de tocar el modelo, y sus errores salen con el campo responsable identificado.
- Nunca se devuelve un modelo al cliente: siempre a través de un transformer.
- En frontend, `lib/api.ts` es el único punto de contacto con el backend. Los componentes no llaman a la red.
- Los componentes de `ui/` los genera shadcn y no se editan a mano.

Este cambio construye el primer dominio de negocio del proyecto. Lo que decida aquí marca el patrón para todo lo que venga después, así que las decisiones pesan más de lo que su tamaño sugiere.

Restricción de proceso heredada del backlog: **no hay base de pruebas** (R-7). Este cambio no la monta y no escribe tests.

## Goals / Non-Goals

**Goals**

- Que el dominio de tareas siga exactamente el mismo flujo por capas que `auth`, sin inventar un patrón nuevo.
- Que el conjunto cerrado de estados se declare **una sola vez por lado** y todo lo demás derive de ahí.
- Que la superficie de API quede cerrada en tres operaciones y no deje puertas entreabiertas.

**Non-Goals**

- Ninguna abstracción para lo que aún no existe. Sin capa de servicios, sin repositorio, sin eventos: el dominio tiene una entidad y tres operaciones.
- Sin optimizar consultas ni paginar. El alcance habla de decenas de tareas.
- Sin componentes nuevos en `ui/`.

## Decisions

### D1 · El estado es una columna de texto con el conjunto cerrado en código

**Alternativas descartadas:**

- *Tipo enumerado de la base de datos.* SQLite no lo tiene de verdad, y allí donde existe convierte añadir un estado en una migración. El conjunto es cerrado por decisión de producto, no por limitación técnica, y esa decisión puede cambiar.
- *Tabla de estados.* Modela como dato algo que el producto declara fijo y no configurable. Introduce una relación y una consulta más para nada, e invita justo a lo que el alcance excluye.

El conjunto se declara una vez en el backend y se usa desde el validador. Que sea texto no lo hace abierto: quien decide qué es válido es la validación, no la columna.

### D2 · Los estados viajan con identificador estable y se rotulan en la presentación

Los valores que cruzan la API son estables e independientes del idioma. El rótulo en castellano que ve la persona vive **solo** en la capa de presentación del frontend.

**Alternativa descartada:** usar los rótulos en castellano como valores. Ata el contrato de la API al idioma de la interfaz, y cualquier traducción futura se convierte en una migración de datos.

### D3 · El responsable se resuelve en el servidor, no se acepta del cliente

La tarea nace a nombre de quien la crea, y ese dato lo pone el servidor a partir de la sesión. La operación de creación **no acepta** un responsable en la petición.

**Alternativa descartada:** aceptarlo y que el frontend envíe el usuario actual. Convierte en dato de entrada algo que es una regla, permite falsificarlo, y el requisito dice que la persona no elige responsable en ningún momento.

Consecuencia: cuando llegue E2-7, reasignar, será una capacidad nueva y explícita, no un efecto colateral de que el campo ya se aceptara.

### D4 · Actualizar admite solo el estado, y con el estado como único campo

La operación de actualización acepta exclusivamente el estado. Ni título, ni responsable, ni fecha.

**Alternativa descartada:** una actualización genérica que acepte cualquier campo. Dejaría implementadas de tapadillo las historias de editar título y reasignar, que están fuera de alcance y todavía tienen criterios sin escribir. Una API que hace más de lo que su spec dice es deuda que nadie ha decidido contraer.

### D5 · El título se normaliza recortando extremos antes de validar

Un título de solo espacios debe rechazarse igual que uno vacío. Recortar los extremos antes de validar hace que ambos casos caigan en la misma regla, en lugar de necesitar dos.

Recortar espacios de los extremos **no** es «recortar el título en silencio» en el sentido que prohíbe la spec: eso se refiere a truncar contenido por exceso de longitud.

### D6 · El límite de longitud es una guarda técnica, no la regla de producto

PA-9 deja sin decidir cuánto es «demasiado largo». Se aplica un límite técnico generoso, suficiente para cualquier frase descriptiva razonable, con dos condiciones:

1. Al superarlo se **avisa**, nunca se guarda una versión recortada. Eso sí es requisito.
2. El número queda declarado aquí como guarda provisional, no como decisión de producto. Cuando PA-9 se resuelva, el cambio es de un valor.

**Alternativa descartada:** no poner límite ninguno. Deja la persistencia sin cota superior y hace que la spec no se pueda suspender en ninguna prueba.

### D7 · Transformer propio para la tarea, sin reutilizar el de la cuenta

La tarea expone su responsable, y de esa persona solo interesa lo mínimo para pintar una fila. Se define qué campos del responsable salen, en lugar de anidar la representación completa de una cuenta.

**Alternativa descartada:** reutilizar el transformer de cuenta anidado. Arrastra a la lista de tareas campos que no pinta nadie, y ata dos contratos que no tienen por qué cambiar juntos.

### D8 · Actualización optimista en la lista, con reversión al fallar

Al cambiar un estado, la vista se actualiza antes de que el servidor confirme, y revierte si la operación falla. Es lo que sostiene el requisito de que el cambio se refleje de inmediato.

**Alternativa descartada:** esperar la respuesta y luego pintar. Con tres estados y un clic, la latencia se nota y el gesto deja de sentirse como «un gesto», que es justo la promesa del producto.

El riesgo asociado está en la sección siguiente.

### D9 · Tres botones en vez de un desplegable

Cambiar el estado son tres destinos posibles. Tres botones lo resuelven en **un** clic; un desplegable necesita dos, abrir y elegir.

El requisito de origen exige que mantener al día en qué andas cueste un gesto, así que la diferencia entre uno y dos clics no es estética.

**Alternativa descartada:** traer un componente de selección nuevo a `ui/`. Añade superficie para empeorar el gesto.

### D10 · Sin regla de orden declarada

PA-3 deja sin decidir el orden de la lista. Este cambio **no fija ninguna regla de orden de producto**: la lista devuelve las tareas y el frontend no las reordena.

El orden resultante será el que decida la persistencia, y eso **no es una decisión de producto ni debe leerse como tal**. Cuando PA-3 se resuelva habrá que escribirlo explícitamente.

**Alternativa descartada:** elegir un orden razonable, por ejemplo por fecha de creación descendente. Sería inventar una decisión de producto que nadie tomó, y quedaría consagrada sin que nadie la revisara.

### D11 · Borrar una cuenta arrastra sus tareas

La referencia al responsable se declara con borrado en cascada. Si algún día se elimina una cuenta, sus tareas desaparecen con ella.

**Alternativa descartada:** dejar la tarea huérfana con responsable nulo. El dominio exige que toda tarea tenga responsable —E3-1 promete que cada fila dice quién la lleva— así que una tarea sin dueño rompería el contrato de la lista.

Hoy es inalcanzable: `auth` no ofrece borrar cuentas. Queda declarado para que, cuando esa capacidad exista, la decisión se revise en lugar de descubrirse.

### D12 · Un identificador que no corresponde a ninguna tarea se responde, no se lanza

Actualizar resuelve un identificador que llega del cliente. Es la primera ruta del proyecto que lo hace.

Usar `findOrFail` habría lanzado un error del ORM que el manejador de excepciones renderiza, fuera de producción, con traza completa, rutas absolutas del servidor y fragmentos de `node_modules`. Se responde en su lugar con la misma forma que el resto de errores del sistema.

**Alternativa descartada:** una clase de excepción propia. Se probó, y el manejador la renderizaba igualmente con traza: el problema no era el tipo del error, sino que se lanzara.

Esta decisión y su requisito en la spec **salieron de la verificación posterior a la implementación**, no del diseño inicial. El contrato tenía un hueco: ningún requisito cubría qué pasa si la tarea no existe.

## Risks / Trade-offs

**La actualización optimista puede mostrar un estado falso durante un instante (D8)** → La reversión al fallar es requisito de la spec, no una mejora opcional, y el fallo se explica en pantalla.

**Todas las transiciones son legales, así que marcar «Hecho» por error es muy barato (PA-7)** → No hay mitigación en este alcance: sin vista de detalle ni deshacer, la única vuelta atrás es volver a pulsar el estado anterior. Queda anotado como consecuencia conocida de una decisión sin tomar.

**Sin orden declarado, la lista puede reordenarse sola entre consultas (D10)** → Con decenas de tareas es tolerable. Deja de serlo en cuanto la lista crezca, y ese es justo el momento en que PA-3 debe estar resuelto.

**El choque de ediciones no está resuelto (PA-8)** → Dos personas cambiando el estado de la misma tarea a la vez: gana la última. Con este alcance el riesgo es bajo porque el único campo mutable es el estado.

**Una misma persona puede figurar como dos responsables distintos (H-11)** → Consecuencia del hallazgo de `auth`, no de este cambio, pero es aquí donde se ve por primera vez. Sin mitigación en este alcance.

**El cambio no tiene ninguna prueba automatizada** → Se verifica a mano contra los escenarios de la spec. Es la consecuencia directa del bloqueo R-7, y la razón de que la base de pruebas tenga su propio cambio.

## Migration Plan

La migración es **aditiva**: crea una tabla nueva y no toca `users` ni `auth_access_tokens`. Las cuentas existentes siguen funcionando igual.

Reversión: deshacer la migración elimina la tabla y devuelve el esquema a su estado anterior. No hay datos previos que preservar, porque el dominio no existía.

Tras ejecutarla hay que regenerar el esquema y versionar el resultado, como cualquier cambio de datos en este repositorio.

## Open Questions

Ninguna que se pueda diferir sin cambiar la spec o el reparto de tareas. Los puntos abiertos que quedan (PA-3, PA-7, PA-8, PA-9) son decisiones de producto, están enumerados en `proposal.md`, y su efecto en este cambio ya está resuelto arriba: en cada caso se implementa la conducta observable que sí está decidida y se declara lo que queda pendiente.
