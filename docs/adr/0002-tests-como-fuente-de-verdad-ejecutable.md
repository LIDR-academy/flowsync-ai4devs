# 2. Los tests de integración son la única fuente de verdad ejecutable

> **Escenario proyectado.** Este documento se redactó el 2026-08-20 para dejar registrado, por
> anticipado, cómo quedaría esta decisión si se toma. Las fechas de 2027 son las del escenario, no las
> de un hecho ocurrido. Los datos del contexto marcados como medidos sí se midieron sobre el
> repositorio el 2026-08-20.

## Contexto

El [ADR 0001](./0001-openspec-como-fuente-de-verdad.md) puso la spec viva de `openspec/specs/` como
fuente de verdad de qué hace FlowSync, y en sus consecuencias anotó lo que esa decisión costaba. Un
año después, lo que ha decidido revisarla no es ninguna sorpresa: son exactamente los costes que aquel
ADR ya había escrito, sin corregir.

Lo que se medía sobre el repositorio el 2026-08-20, cuando se aceptó el ADR 0001:

- **124 scenarios en la capability `tasks`, 3 cubiertos por tests.** La spec afirmaba comportamiento
  que nada comprobaba.
- **Ese hueco ya se había cobrado un fallo real.** El requisito *Lo que cada tarea muestra de su
  responsable* prohíbe exponer el email del responsable, y `GET /api/v1/tasks` lo estuvo publicando
  hasta que se escribió el test que lo miraba. La spec decía la verdad, el sistema decía otra cosa, y
  el proceso no se enteró: una afirmación que nadie ejecuta no detiene nada.
- **Nada hacía cumplir el invariante.** El repositorio no tenía `.github/`, ningún script de
  `package.json` mencionaba OpenSpec, y ningún test comparaba la spec viva con sus deltas.
- **La reconstrucción desde los deltas ya fallaba en una capability de dos.** En `auth`, 15 de sus 19
  requisitos no tienen ningún change que los haya puesto ahí.
- **`MODIFIED` reescribe el requisito entero y nadie fusiona por ti.** *Una sola vista de tareas, sin
  señales de presencia* llevaba tres reescrituras completas, cada una arrastrada a mano.
- **56 de los 124 scenarios son de interfaz** y el frontend no tenía runner de tests, así que ni
  siquiera eran comprobables a máquina.

A lo largo del año, la distancia entre la prosa y el comportamiento siguió creciendo por donde ya
estaba abierta, y el coste de mantenerla se pagó entero: cada change duplicando texto —el delta de
`add-task-status-filter` son 272 líneas, y una parte grande es la reescritura literal de cuatro
requisitos que ya estaban escritos en otro sitio— para sostener un documento que ningún proceso
verificaba.

Mientras tanto, la suite de integración creció y pasó a cubrir el comportamiento que importa,
ejecutándose en cada cambio. Hoy hay dos descripciones del sistema, y solo una se ejecuta.

## Decisión

**La suite de tests de integración es la única fuente de verdad ejecutable de qué hace FlowSync.**
Cuando la prosa y un test verde digan cosas distintas, manda el test.

En concreto:

1. **Ningún cambio de comportamiento entra sin un test que falle antes y pase después.** El test es el
   cambio; el código es cómo se consigue.
2. **Los tests se titulan en el lenguaje del producto**, heredando el estilo `WHEN` / `THEN` de los
   scenarios, de modo que la salida de un fallo se lea como el requisito incumplido y no como el
   nombre de un método.
3. **`openspec/` se congela.** La spec viva y los changes archivados se quedan en el repositorio como
   historia, en solo lectura: no se escriben más deltas, no se sincroniza nada más, y dejan de
   consultarse como verdad presente. Ese congelamiento se anota **en los propios ficheros**, no solo
   aquí.
4. **La prosa que siga haciendo falta se muda a donde es barata**: las decisiones a ADRs como este, el
   porqué de una regla al comentario junto al código que la implementa. La intención de producto
   sigue en [`docs/backlog/`](../backlog/) y en Jira, que nunca fueron la verdad ejecutable.
5. **Esta decisión no es cierta hasta que se cumplan dos condiciones**, y hasta entonces el ADR 0001
   sigue mandando: que la suite cubra el comportamiento que la spec afirmaba, y que se ejecute en
   integración continua en cada cambio. Sin las dos, esto cambia una verdad que nadie ejecuta por una
   verdad que nadie ha escrito.
6. **El comportamiento de interfaz solo entra en la verdad ejecutable cuando haya runner que lo
   ejecute.** Mientras no lo haya, se dice que esa mitad no tiene fuente de verdad ejecutable, en
   lugar de dejar creer que la tiene.

## Estado

Aceptada — 2027-08-20. Reemplaza al [ADR 0001](./0001-openspec-como-fuente-de-verdad.md), cuyo
contexto y decisión se conservan tal como se escribieron: describen lo que se creía entonces, y
entenderlos es lo que explica esta decisión.

## Consecuencias

### Lo que ganamos

- **Una verdad que se ejecuta.** Una afirmación falsa rompe la build en vez de quedarse en un párrafo.
  El caso del email del responsable —código y spec diciendo cosas distintas durante semanas— deja de
  ser posible por construcción.
- **Desaparece el trabajo de sincronización.** No hay delta que escribir, ni `MODIFIED` que arrastrar
  entero, ni invariante de reconstrucción que sostener a mano.
- **Un solo artefacto.** La deriva entre prosa y código se acaba porque no queda prosa de la que
  derivar.
- **El fallo señala el sitio.** Un test roto da fichero, línea y valor esperado; un requisito
  incumplido no daba nada.

### Lo que nos cuesta

- **Un test dice qué, y dice muy mal por qué.** Los requisitos del ADR 0001 llevaban dentro el
  razonamiento: por qué el `<` de `isOverdueOn` es estricto, por qué la vista por defecto se escribe
  explícita y no como `TASK_STATUSES` menos `'done'`, por qué un `422` vale más que una lista vacía.
  Un test asserta el `<`; no explica por qué un `<=` sería un fallo silencioso. Ese razonamiento hay
  que mudarlo a comentarios y ADRs, y lo que no se mude se pierde.
- **Los requisitos negativos se quedan casi sin guardián.** «El catálogo de estados no se toca», «No
  hay lista personal», «El estado es la única dimensión», «Sin señales de presencia»: la spec afirmaba
  una ausencia en una línea, y un test solo puede aproximarla. Se pierde justamente lo que impedía que
  el producto creciera por donde no debía.
- **Media spec se queda sin verdad ejecutable.** 56 de los 124 scenarios de `tasks` son de interfaz.
  Si no se instala un runner en el frontend, esta decisión no los traslada: los suelta.
- **Un test es peor artefacto de discusión que un delta.** Un delta se revisaba antes de implementar
  nada. Un test se escribe con la implementación y casi siempre por la misma persona, lo que lo
  debilita como declaración independiente de intención.
- **Un test se puede aflojar para que pase.** La spec era incómoda de doblar; un test en rojo invita a
  editar el assert. La disciplina se muda de «mantén la spec al día» a «no debilites el test», y
  ninguna de las dos la impone una máquina.
- **La spec congelada se pudre a la vista.** Se queda en el repositorio, dejará de describir el
  sistema poco a poco, y alguien la leerá creyéndola vigente. Por eso el congelamiento va anotado en
  los ficheros y no solo en este ADR — y aun así, es una trampa que queda puesta.
- **Incorporarse al proyecto se vuelve más caro antes que más barato.** Leer 124 scenarios enseñaba el
  producto en una tarde; leer la suite enseña la API. El `## Purpose` de la capability —«Da al equipo
  su lista de trabajo…»— no tiene sitio en ningún test.
- **La integración continua pasa a ser dependencia dura.** Con prosa no hacía falta infraestructura
  ninguna. Una verdad ejecutable solo es verdad si se ejecuta, y montar y mantener eso es trabajo que
  antes no existía.
