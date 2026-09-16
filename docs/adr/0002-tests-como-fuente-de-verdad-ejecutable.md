# 2. Dejar de mantener las delta-specs de OpenSpec y usar los tests de integración como única fuente de verdad ejecutable

## Context

[ADR 0001](0001-openspec-como-fuente-de-verdad.md) adoptó `openspec/specs/` como la descripción normativa de FlowSync, construida solo a través de changes archivados en `openspec/changes/`. Un año después, lo que ese ADR ya anotaba en su sección «En contra» dejó de ser un riesgo teórico y pasó a ser lo que de verdad ocurrió:

- **La doble contabilidad siguió fallando.** El propio ADR 0001 documentaba un caso ya ocurrido —FS-142 se implementó y desplegó antes de que existiera el change que lo reflejaba en la spec viva— como advertencia. No fue un incidente aislado: nada obligaba a abrir un change cada vez que cambiaba el comportamiento, y con el tiempo la spec volvió a quedarse atrás de lo que el código hacía de verdad, otra vez, sin que nada lo señalara hasta que alguien lo notaba por accidente.
- **Nunca se añadió nada que lo hiciera cumplir.** ADR 0001 señalaba que ningún hook, paso de CI ni regla de `CLAUDE.md` comprobaba que un PR que tocaba `backend/app` o `frontend/src` también tocara `openspec/`. Esa comprobación no se llegó a construir, y la disciplina siguió siendo enteramente manual.
- **La spec y los tests siguieron siendo afirmaciones desconectadas.** Los tres changes archivados hasta el ADR 0001 habían renunciado ya a tests automatizados. Esa costumbre no se revirtió: seguían escribiéndose requirements y scenarios sin una prueba que los respaldara, así que «la spec dice X» y «algo comprueba X» siguieron siendo dos frases distintas.
- **Los tests, mientras tanto, sí demostraron hacer el trabajo por sí solos.** En este mismo proyecto, traducir los scenarios de `openspec/specs/tasks/spec.md` en tests de Japa (`backend/tests/functional/tasks/assignee.spec.ts`) destapó un bug real — el `assignee` de la lista filtraba el email — y ese test, no la spec, fue lo que impidió que el arreglo de `task_transformer.ts` se diera por bueno sin comprobarlo. La spec había descrito la regla correctamente desde el principio; fue el test, no la prosa, quien la hizo exigible.
- **`CLAUDE.md` nunca llegó a mencionar `openspec/`.** El ADR 0001 ya señalaba que la jerarquía de autoridad vivía solo en ese documento, no en el archivo que lee cada sesión de trabajo. `npm test`, en cambio, sí está documentado en `CLAUDE.md` desde el principio: es un comando que cualquiera ejecuta sin tener que saber que `openspec/` existe.

El resultado, un año después, es que se mantenían dos descripciones paralelas del comportamiento del sistema —una ejecutable (`backend/tests/`) y otra que dependía de que alguien se acordara de leerla y de que no hubiera derivado (`openspec/specs/`)— y solo la primera decía la verdad de forma fiable.

## Decision

Se deja de abrir changes nuevos en `openspec/changes/` y se deja de mantener `openspec/specs/` como descripción normativa del comportamiento de FlowSync.

`backend/tests/functional/**/*.spec.ts` (y cualquier suite `unit` que llegue a existir) pasan a ser la única fuente de verdad ejecutable: un comportamiento es cierto del sistema si y solo si hay un test que lo afirma y pasa. `npm test`, ya documentado en `CLAUDE.md`, es la comprobación.

`openspec/` no se borra: `specs/` y `changes/archive/` se quedan en el repositorio como registro histórico de por qué se construyó cada cosa, pero dejan de actualizarse y dejan de tener autoridad sobre el código o los tests cuando entren en conflicto con ellos. Trabajo de comportamiento nuevo se escribe directamente como test de integración junto al código, sin el artefacto separado de proposal/design/tasks/delta-spec que exigía el flujo de OpenSpec.

## Status

Aceptado. Reemplaza a [ADR 0001](0001-openspec-como-fuente-de-verdad.md).

## Consequences

**A favor:**

- Una sola fuente de verdad que no puede derivar en silencio como lo hacía la prosa: si `backend/tests/` afirma un comportamiento, `npm test` lo confirma o falla de forma ruidosa; ya no existe el estado intermedio de «la spec lo dice pero nada lo comprueba».
- Desaparece el impuesto de la doble contabilidad: un solo artefacto (el test) en vez de dos (change archivado + eventual test).
- La cobertura se puede enumerar y consultar directamente (`node ace test --files=...`) en vez de depender de que alguien lea a mano un fichero de cientos de líneas por capability.

**En contra — lo que cuesta:**

- **Se pierde el porqué.** Un test afirma qué hace el sistema, no por qué: no hay equivalente al `Why`, a los `Riesgos` ni al `Fuera de alcance, y a propósito` de un `proposal.md`. Decisiones como «FS-118 no trae ninguna librería de calendario» o las preguntas abiertas marcadas como `PA-n` en `docs/backlog/` no tienen ya un sitio natural donde quedar escritas; si vuelven a hacer falta, hay que inventarse otro documento para ellas —o perderlas.
- **Solo existe lo que está cubierto.** Un comportamiento sin test ya no tiene ninguna afirmación escrita sobre él, ni siquiera una sin verificar: con OpenSpec, un requirement sin test todavía decía «esto se supone que pasa»; sin OpenSpec, «no documentado» y «no existe» se vuelven indistinguibles.
- **Las preguntas de producto, más caras de responder.** Saber qué garantiza la capability de tareas sobre el vencimiento era leer una sección de `tasks/spec.md`; ahora es leer bloques de test dispersos por varios ficheros e inferir la intención a partir de aserciones — justo el tipo de contraste que este mismo proyecto usó `openspec/specs/tasks/spec.md` para hacer barato, cruzándolo scenario a scenario contra `backend/tests/`.
- **Los requirements de interfaz se quedan sin ningún sitio.** Los requirements de `tasks/spec.md` que describían pantallas y comportamiento del frontend —el control de filtro, los vacíos de la lista, volver de la ficha de una tarea— no tenían un endpoint propio y por tanto tampoco lo tienen en los tests de backend; y `frontend/` seguía sin runner de tests instalado. Esa superficie queda sin ninguna fuente de verdad, ejecutable o no.
- **Se reescribe la memoria institucional.** Entender por qué existe una regla como «vencer hoy todavía no es estar vencida» deja de ser leer el `#### Scenario:` escrito justo para eso, y pasa a ser rastrear PRs e historial de git.
- **Puerta de un solo sentido.** `openspec/` queda congelado, no borrado, pero prosa congelada que nadie actualiza envejece peor que prosa que nadie lee: con el tiempo puede confundir a quien no sepa que es histórica y no vigente, si nada la marca como tal.
