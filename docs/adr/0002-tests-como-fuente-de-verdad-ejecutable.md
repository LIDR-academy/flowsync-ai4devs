# 2. Los tests de integración como única fuente de verdad ejecutable

> **Nota:** este ADR describe un escenario hipotético, planteado como ejercicio — "supongamos que dentro de un año dejamos de mantener las specs de OpenSpec". No es una decisión tomada hoy. **`openspec/specs/` sigue siendo la fuente de verdad real de este repositorio ahora mismo**, tal como establece el [ADR 0001](0001-openspec-como-fuente-de-verdad.md); su "Reemplazada por" apunta a este documento dentro de ese mismo ejercicio, no a un reemplazo que haya ocurrido de verdad.

## Contexto

El [ADR 0001](0001-openspec-como-fuente-de-verdad.md) adoptó las delta-specs de OpenSpec (`openspec/specs/*/spec.md`) como fuente de verdad sobre el comportamiento del sistema. La decisión traía ya, escrito en sus propias consecuencias, el riesgo que ha acabado pesando más que sus ventajas:

- **Nada la hacía cumplir.** `openspec validate --all --strict` comprobaba que un delta tuviera la forma correcta — bloques `ADDED`/`MODIFIED`/`REMOVED` bien formados —, nunca que el código y la spec siguieran contando la misma historia. Esa comprobación no existe en ningún paso obligatorio del flujo de trabajo.
- **La única detección era humana.** El propio ADR 0001 documenta el caso FS-142: la spec viva de `tasks` afirmó durante un tiempo que `GET /api/v1/tasks` devolvía todas las tareas del espacio, cuando el código ya filtraba las hechas por defecto. Se corrigió porque alguien lo notó al leerla, no porque nada lo hubiera bloqueado antes.
- **El mantenimiento era doble y manual.** Cada comportamiento vivía descrito en el código y, aparte, en prosa — y mantener las dos versiones sincronizadas dependía enteramente de la disciplina de quien tocaba el código, sin ninguna suite que repitiera esa comprobación en cada cambio futuro. Los tres changes archivados hasta el ADR 0001 se documentan a sí mismos como no probados: la verificación de lo que afirmaban fue manual.

Un año después, ese patrón no ha cambiado por sí solo: seguía sin haber nada entre "el código cambió" y "la spec sigue mintiendo" salvo que alguien lo mirase. La suite de tests de integración (Japa, `tests/functional/**`), en cambio, es la única pieza del proyecto que se ejecuta contra el sistema real y falla de forma ruidosa e inmediata cuando el comportamiento que describe deja de cumplirse — sin depender de que nadie la relea.

## Decisión

Dejamos de mantener las delta-specs de OpenSpec como gobierno del comportamiento del sistema. La fuente de verdad ejecutable pasa a ser la suite de tests de integración.

En consecuencia:

- `openspec/specs/` y `openspec/changes/archive/` quedan congelados: no se abren changes nuevos ni se escriben deltas nuevos. El directorio se conserva como archivo histórico de decisiones — sigue siendo legible para entender por qué se construyó algo así en su momento —, pero no se actualiza más y no se consulta para resolver ningún conflicto sobre el comportamiento actual del sistema.
- Todo comportamiento observable nuevo o modificado se acompaña, dentro de la misma unidad de trabajo, de un test de integración que lo ejerza contra el sistema real (petición HTTP real, ruta real, respuesta real) — exactamente el lugar donde antes exigíamos un delta-spec.
- Cuando código y suite de tests discrepen, se corrige el que esté equivocado verificando contra el sistema en marcha, igual que el ADR 0001 ya establecía para código y spec — solo que ahora quien avisa de la discrepancia es la propia ejecución de la suite, no una lectura manual.
- El "por qué" de una decisión de diseño —lo que antes vivía en `design.md` de cada change— pasa a registrarse en el mensaje de commit, en la descripción del PR, o en un ADR propio cuando la decisión sea de arquitectura. Ningún artefacto lo exige ya de forma estructurada; queda a la disciplina de quien decide, igual que ya dependía de disciplina mantener las specs al día.

## Estado

Aceptada. Reemplaza al [ADR 0001](0001-openspec-como-fuente-de-verdad.md), cuyo estado queda actualizado en consecuencia sin reescribir su contexto ni su decisión.

## Consecuencias

**A favor:**

- **Es ejecutable de verdad.** Un test roto es una señal inmediata en CI o en `node ace test`, no algo que alguien tiene que notar por casualidad como pasó con FS-142. La clase de deriva que motivó la mitad de las consecuencias negativas del ADR 0001 deja de ser posible sin que algo la señale.
- **Una sola cosa que mantener por comportamiento.** Ya no hay código y prosa describiendo lo mismo por separado: cambiar el comportamiento y romper su test es la misma acción, no dos que hay que recordar hacer juntas.
- **No depende de un formato ni de un CLI propios.** Los tests corren con las herramientas estándar del proyecto (Japa, `node ace test`) que cualquiera que toque el backend ya usa, sin aprender la sintaxis de OpenSpec ni instalar nada aparte.

**En contra — lo que cuesta:**

- **Se pierde la prosa legible por negocio.** Un `Requirement` en `SHALL`/`WHEN`/`THEN` se podía enseñar a alguien no técnico para confirmar que describía el comportamiento que el equipo de producto quería. Un test de Japa no cumple esa función: hay que leer TypeScript y entender aserciones para saber qué comportamiento certifica.
- **Se pierde el "por qué" como artefacto obligatorio.** Un test verifica *qué* hace el sistema, nunca por qué se decidió que lo hiciera así ni qué alternativas se descartaron — eso vivía en el `design.md` de cada change. Ahora ese razonamiento solo sobrevive si alguien decide, caso a caso, ponerlo en un commit o en un ADR; nada lo exige de forma estructurada como exigía OpenSpec.
- **No hay más "un solo documento por capability".** `specs/tasks/spec.md` respondía de un vistazo a «¿qué hace `tasks` hoy?». Esa pregunta pasa a responderse leyendo los tests dispersos en `tests/functional/tasks/`, archivo por archivo — ningún test individual da la vista completa que daba la spec viva.
- **El archivo histórico deja de crecer.** Cualquier decisión de diseño tomada desde este ADR en adelante no tiene ya un lugar natural y estructurado donde quedar registrada como quedaban los `design.md` de cada change archivado, salvo que se sustituya explícitamente por otro hábito — ADRs, por ejemplo — y se siga con la misma disciplina que antes le faltó a OpenSpec.
- **La migración no es gratis.** A juzgar por lo que documenta el ADR 0001, la mayoría del comportamiento que hoy describen las specs vivas no tiene ningún test de integración que lo verifique — los tres changes archivados se declaran a sí mismos sin tests. Adoptar esta decisión implica escribir esa cobertura antes de poder apagar de verdad `openspec/` como referencia de consulta, no solo dejar de escribir specs nuevas.
