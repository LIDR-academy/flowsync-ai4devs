# Recorrido del curso, de S1 a S5

> Qué se hizo en cada módulo, en orden, qué quedó en el repositorio y qué se encontró.
>
> Las fechas y la atribución de cada hallazgo salen del historial de git -del commit que introdujo cada entrada-, no de la memoria. Donde no se pudo verificar, se dice.
>
> **Las cifras de estado también se midieron sobre las referencias de git**, no se recordaron: `upstream/sN/start` para el inicio de cada sesión y nuestra rama para el final. Lo que se cuenta son ficheros y declaraciones -rutas registradas, ficheros de prueba, comprobaciones, ADR, migraciones, requisitos de la spec-, porque son contables sin ejecutar nada. Los recuentos de **pruebas ejecutadas** salen de haberlas corrido, y se dice en cada caso.
>
> **Para rehacerlo, no para leerlo**: los pasos concretos, con los comandos, están en [`guia-de-replicacion.md`](guia-de-replicacion.md). Este documento cuenta qué pasó; esa guía cuenta cómo volver a hacerlo.
>
> Última revisión: 2026-09-06.

## El resumen, antes del detalle

| | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|
| **Tema** | Priming | Spec-Driven Development | OpenSpec | Verificación | Guardarraíles |
| **Objetivo** | Dejar el entorno y el arnés listos, y probarlo con una feature real | Decidir qué construir antes de construirlo | Construir con SDD, y salir sabiendo **cuándo no usarlo** | Comprobar que lo construido hace lo que la spec dice | Contrastar las reglas declaradas contra lo que el repositorio hace |
| **Rama** | `feat/login-frontend` | `docs/alcance-mvp` | `s3/start` | `s4/start` | `feat/portar-cierres-modulo-4` |
| **PR** | [#12](https://github.com/LIDR-academy/flowsync-ai4devs/pull/12) | [#14](https://github.com/LIDR-academy/flowsync-ai4devs/pull/14) | [#15](https://github.com/LIDR-academy/flowsync-ai4devs/pull/15) | [#21](https://github.com/LIDR-academy/flowsync-ai4devs/pull/21) | [#22](https://github.com/LIDR-academy/flowsync-ai4devs/pull/22) |
| **Funcionalidad nueva** | Cuentas en pantalla | **Ninguna** | Tareas, entero | **Ninguna** | **Ninguna** |
| **Hallazgos** | - | **H-01 a H-10** | H-11 a H-14 | **H-15 a H-22** | H-23, y nueve que volvieron |

### Cómo cambió el proyecto, medido

Cada celda es **inicio → fin** de esa sesión. Un guion significa que la sesión no lo tocó.

| | S1 | S2 | S3 | S4 | S5 |
|---|---|---|---|---|---|
| Rutas de la API | 5 → 5 | - | **5 → 8** | 10 → 10 | 10 → 10 |
| Ficheros de prueba, backend | 0 → 0 | - | **0 → 2** | **4 → 15** | **5 → 15** |
| Ficheros de prueba, frontend | 0 → 0 | - | **0 → 1** | 0 → 1 | **0 → 1** |
| Pruebas ejecutándose | 0 → 0 | - | **0 → 37 + 21** | **20 → 76 + 28** | **23 → 75 + 28** |
| Comprobaciones del verificador | - | - | - | **0 → 17** | **0 → 15** |
| Workflows de CI | - | - | - | **0 → 2** | **0 → 2** |
| ADR | - | - | - | **0 → 4** | 2 → **6** |
| Migraciones | 2 → 2 | - | **2 → 5** | 4 → **6** | 4 → **6** |
| Requisitos de spec, `tasks` | - | - | **0 → 16** | 32 → 33 | 32 → 33 |
| Requisitos de spec, `auth` | - | - | **0 → 19** | 19 → 19 | 19 → 19 |
| Documentos en `docs/` | 0 → 0 | **0 → 10** | 15 → 18 | **15 → 28** | **19 → 32** |

**Los saltos de rama explican los números que no cuadran de una sesión a la siguiente.** Cada módulo arranca en `upstream/sN/start`, que es la versión del curso, no donde nosotros lo dejamos. Por eso S4 empieza con 10 rutas cuando S3 terminó con 8 -el curso añadió el detalle y la fecha por otro camino-, y por eso S5 empieza con 5 ficheros de prueba cuando S4 terminó con 15.

**Ese salto es el mecanismo que produjo H-22 y los nueve defectos que volvieron.** No es una anomalía del curso: es la forma que tiene este proyecto de enseñar que un arreglo vive en una rama, no en el producto.

**Diecisiete de los veintitrés hallazgos salieron de los dos módulos que no añadieron funcionalidad.** Mirar encuentra más que construir, y eso es lo que dice este recorrido leído de arriba abajo.

---

## S1 · Priming · 2026-08-19

### Objetivo

Dejar la máquina y el repositorio en condiciones de trabajar con un agente, y **comprobarlo construyendo algo de verdad**.

El entregable visible es la autenticación en pantalla. El entregable real es el arnés: `CLAUDE.md`, las skills de `.claude/skills/`, el subagente `adversarial-reviewer` y el hook de formato. La feature es cómo se comprueba que el arnés funciona, no al revés.

Lo que el módulo pide practicar, y aquí decidió el resultado: **contrastar el ticket contra el sistema en marcha antes de planificar**. El ticket pedía «registro (email+password)» y el validador exigía cuatro campos. Se vio con una petición real, no leyendo el código.

### Estado al empezar

Una API que funciona y **ninguna pantalla que la use**. Cinco rutas registradas -alta, acceso, perfil, cierre de sesión y el saludo de la raíz-, dos migraciones, y un `frontend/` con el andamiaje de Vite recién creado: **cero páginas, cero rutas de navegación, cero ficheros de sesión, cero componentes propios**. Ni una prueba de ninguna clase, `docs/` sin existir, sin CI.

Dicho de otro modo: el producto era un backend que solo se podía usar con `curl`.

**Qué se hizo.** Autenticación en el frontend sobre esa API: registro, acceso, perfil protegido y cierre de sesión, con guards de ruta y el token en `localStorage`.

### Estado al terminar

| | Inicio | Fin |
|---|---:|---:|
| Páginas | 0 | **3** |
| Rutas de navegación y guards | 0 | **3** |
| Ficheros de sesión (`auth/`) | 0 | **3** |
| Componentes propios | 0 | **8** |
| Rutas de la API | 5 | 5, sin tocar |
| Migraciones | 2 | 2, sin tocar |
| **Pruebas** | **0** | **0** |

Dos cosas que no cambiaron, y son las que definen la sesión: **el backend no se tocó**, y **no quedó ni una prueba**. Todo lo construido descansaba sobre revisión humana, y así siguió hasta S3.

**Qué quedó.** Las pantallas de cuentas, `lib/api.ts` como único punto de contacto con el backend, y `auth/` con su proveedor de sesión.

**Hallazgos: ninguno registrado.** El subagente `adversarial-reviewer` sí pasó sobre el PR -hay un commit que dice «hallazgos del adversarial-reviewer sobre LID-3»- pero se arreglaron en el mismo commit y **`docs/hallazgos.md` todavía no existía**. Se perdieron como registro.

Es el primer caso del patrón que este proyecto acabaría persiguiendo: un hallazgo arreglado y no anotado es un hallazgo que nadie puede contrastar después.

---

## S2 · Spec-Driven Development · 2026-08-24

### Objetivo

**Decidir qué construir antes de construirlo, y dejarlo escrito de forma que se pueda contrastar después.** PRD del MVP, alcance, y backlog con criterios de aceptación historia a historia.

La trampa que el módulo enseña a evitar: un documento de producto que no se puede contradecir no sirve para nada. Por eso lo que se escribe no son intenciones sino **requisitos numerados y criterios de aceptación**, que es lo que en S4 permitió decir «el código no cumple RF-15» en vez de «esto no me convence».

Y una parte del objetivo que no estaba en el guion y resultó ser la más útil: **auditar el repositorio antes de tocarlo**. De ahí salieron los diez primeros hallazgos.

### Estado al empezar

El producto exactamente como lo dejó S1, y **`docs/` vacío**: cero documentos, cero requisitos escritos, cero historias. Había código de dos verticales -cuentas, en API y en pantalla; tareas, en ninguna capa- y **ningún documento decía qué debía hacer el producto**. La única fuente de verdad era el propio código.

**Qué se hizo.** El PRD del MVP, el alcance, y el backlog de la épica E2 con sus criterios de aceptación. **Cero código de producto.**

### Estado al terminar

| | Inicio | Fin |
|---|---:|---:|
| Documentos en `docs/` | 0 | **10** |
| Requisitos funcionales escritos | 0 | **RF-1 a RF-15** |
| Historias con criterios de aceptación | 0 | **12 ficheros** |
| Puntos abiertos declarados | 0 | **PA-1 a PA-6** |
| Hallazgos registrados | - | **10** |
| Rutas · pruebas · migraciones | 5 · 0 · 2 | **sin tocar** |

**No cambió absolutamente nada del producto.** Ni una ruta, ni una prueba, ni una migración. Lo que cambió es que a partir de aquí existía algo contra lo que contrastar el código, y el contraste empezó a producir hallazgos de inmediato.

**Qué quedó.** `docs/prd/`, `docs/backlog/` con doce ficheros, `docs/estado-actual.md` -la auditoría del repositorio- y **`docs/hallazgos.md`, que nace aquí** y acabó siendo el documento más consultado del proyecto.

**Hallazgos: diez, de una vez.** H-01 a H-10, todos en el mismo commit del 2026-08-24. Y **ninguno es de código propio**: salieron de mirar el repositorio antes de tocarlo.

| | Qué |
|---|---|
| **H-01** | Los tests comparten base de datos con desarrollo |
| **H-02** | Cero pruebas automatizadas en todo el proyecto |
| **H-03** | `/account/logout` no envuelve la respuesta en `data` |
| **H-04** | `fullName` es `nullable`, no `optional` |
| **H-05** | La traducción de errores depende de los nombres de regla del backend |
| **H-06** | El token vive en `localStorage` |
| **H-07 a H-10** | Herramental: `jq` ausente, un symlink que Windows no materializa, el esquema generado que rompe el lint, los tipos de Jira en dos idiomas |

**Y un hallazgo que no lleva número**: al traducir requisitos a historias apareció que **E2-5 no tiene requisito propio en el PRD**. Dos requisitos la dan por hecha y ninguno crea la pantalla donde abrir la tarea. Quedó como punto abierto PA-6, que además dice algo más incómodo: la estimación cuenta tres superficies como cero.

**Lo que enseña S2.** El módulo que menos código produjo es el que más defectos encontró, y los encontró **leyendo**. La auditoría previa no es burocracia: es la forma más barata de encontrar cosas.

---

## S3 · OpenSpec · 2026-08-25 y 26

### Objetivo

Construir una capability entera con un flujo SDD estructurado: **`propose` → gate humano → `apply` → `archive`**.

Pero el entregable declarado del módulo **no es saber usar OpenSpec, sino el criterio de cuándo usarlo y cuándo no.** El instructor avisa explícitamente contra salir de la sesión usándolo para todo. El priming del módulo lo practica con dos tickets reales, uno por camino:

| Camino | Cuándo | El ticket que se usó |
|---|---|---|
| **Delegación directa** | Un fichero, documentación desechable, sin trazabilidad | Restaurar el formato del esquema generado |
| **OpenSpec** | Perdura, cruza capas, y el equipo debe revisar el contrato **antes** del código | La capability `tasks` entera |

El punto de la sesión no es ninguno de los comandos: **es el gate humano.** Revisar un plan cuesta minutos; revisar un PR con dos días de código dentro cuesta un retrabajo.

### Estado al empezar

Aquí ocurre **el primer salto de rama**, y conviene verlo porque explica todo lo que viene después. `upstream/s3/start` trae el PRD y el backlog **del curso**, que sustituyen a los nuestros. Nuestro Módulo 2 se queda intacto en `docs/alcance-mvp` y en su PR, como ejercicio propio, y esta rama arranca con 15 documentos que no son los que escribimos. `docs/estado-actual.md` y `docs/hallazgos.md` no están en ella.

Del producto: **cinco rutas, cero pruebas, dos migraciones**, y `openspec/` sin existir. La gestión de tareas no estaba en ninguna capa: ni tabla, ni modelo, ni endpoint, ni pantalla.

**Qué se hizo.** La gestión de tareas entera, con el flujo `propose → gate humano → apply`, y después la base de pruebas como segundo change.

### Estado al terminar

| | Inicio | Fin |
|---|---:|---:|
| Rutas de la API | 5 | **8** |
| Migraciones | 2 | **5** |
| Requisitos de spec, `tasks` | 0 | **16** |
| Requisitos de spec, `auth` | 0 | **19** |
| Changes archivados | 0 | **3** |
| Ficheros de prueba, backend | 0 | **2** |
| Ficheros de prueba, frontend | 0 | **1** |
| **Pruebas ejecutándose** | **0** | **37 backend + 21 frontend** |
| Documentos en `docs/` | 15 | 18 |

**El cambio que más pesa no es una cifra de funcionalidad.** El proyecto pasa de **cero pruebas a 58**, y de no tener spec a tener 35 requisitos con sus escenarios. Eso es lo que en el módulo siguiente permitió contrastar el código contra algo que no fuera el criterio de quien mira.

**Qué quedó.** La spec viva en `openspec/specs/` -`auth` por ingeniería inversa, `tasks` por delta-, tres changes archivados, y la lista compartida con crear, cambiar estado, vencimiento y filtro.

**Hallazgos: cuatro, y cada uno salió de una actividad distinta.**

| | Cuándo salió |
|---|---|
| **H-11** · el email distingue mayúsculas | Al escribir la spec viva de `auth`. Documentar lo que el código hace obliga a mirarlo |
| **H-12** · el registro tipado solo modela la respuesta de éxito | Al montar la base de pruebas |
| **H-13** · una sesión caducada deja al usuario sin salida | Revisión adversarial del PR #15 |
| **H-14** · `updatedAt` vale distinto según el endpoint | Revisión adversarial del PR #15 |

**Lo que enseña S3.** Escribir la spec de algo que ya existe es un antipatrón declarado -la propia documentación de OpenSpec lo desaconseja- y aun así encontró H-11. El coste se paga por adelantado; el hallazgo también llega por adelantado.

---

## S4 · Verificación · 2026-08-26 a 2026-09-02

### Objetivo

**Comprobar que lo construido hace lo que la spec dice, y dejar montado lo que lo siga comprobando sin ti.** Tres piezas: trazabilidad requisito a prueba, documentación que se contrasta contra el código, y revisión adversarial sobre el PR.

El prework añade un ejercicio concreto: **cazar un «casi correcto» propio**, un sitio donde el agente produjo algo que parece correcto y no lo es. El que apareció aquí no estaba en el producto sino en el arnés, y se comprobó plantándolo: un fichero de prueba sin el hook de aislamiento dejó **21 pruebas en verde y una fila de test escrita en la base de desarrollo**.

Ese es el modelo mental del módulo entero: **verde no es evidencia**. Lo que da evidencia es haber visto la comprobación fallar.

### Estado al empezar

Segundo salto de rama, y **el más caro de los tres**. `upstream/s4/start` llega a la misma funcionalidad que construimos en S3 **por otro camino**: **diez rutas** en vez de ocho -el curso añadió el detalle de la tarea y la fecha de vencimiento por su cuenta- y **32 requisitos** de `tasks` en vez de nuestros 16.

Lo que eso significaba en concreto, y no se ve en la cuenta de rutas:

- **Cuatro ficheros de prueba con 20 pruebas, todas de `auth`.** La capability `tasks` -lo que la sesión anterior había construido entero- **no tenía ni una prueba**.
- `docs/hallazgos.md` no existía en esta rama, así que H-01 a H-14 no estaban a la vista de nadie que trabajase en ella.
- Los arreglos de H-11, H-13 y H-14 se habían quedado en `s3/start`.
- Cero comprobaciones automáticas de documentación, cero ADR, cero CI.

**Qué se hizo.** Trazabilidad requisito a requisito, documentación que se contrasta en vez de regenerarse, y **siete revisiones adversariales seguidas**.

### Estado al terminar

| | Inicio | Fin |
|---|---:|---:|
| Ficheros de prueba, backend | 4 | **15** |
| **Pruebas ejecutándose** | **20 + 0** | **76 backend + 28 frontend** |
| Comprobaciones del verificador | 0 | **17** |
| Workflows de CI | 0 | **2** |
| ADR | 0 | **4** |
| Migraciones | 4 | **6** |
| Documentos en `docs/` | 15 | **28** |
| Rutas de la API | 10 | 10, sin tocar |
| Hallazgos suyos abiertos al cerrar | - | **0** |

**Cero rutas nuevas y ochenta y cuatro pruebas más.** Es el módulo que mejor resume el curso: no añadió nada que un usuario pueda ver, y cambió el proyecto más que ninguno.

**Qué quedó.** `docs/trazabilidad.md`, `scripts/verificar-docs.mjs` con diecisiete comprobaciones que fallan la build, cuatro ADR, y la integración continua.

**Hallazgos: ocho, y ninguno era funcionalidad nueva.** Todos estaban ya en el código, con la suite en verde.

| | Qué |
|---|---|
| **H-15** | Una tarea hecha con la fecha pasada llegaba marcada como vencida. **El comentario de encima prometía tres condiciones y el código comprobaba dos** |
| **H-16** | Un estado inventado en el filtro devolvía `200` con lista vacía: «no existe» indistinguible de «no hay» |
| **H-17** | La lista filtraba el email del responsable |
| **H-18** | Los changes se archivaron con verificaciones marcadas sin hacer |
| **H-19** | Las respuestas de error devolvían traza, rutas y **el SQL ejecutado** |
| **H-20** | Dos requisitos de la spec viva se contradecían sobre `today` |
| **H-21** | El orden de validación difería entre controladores |
| **H-22** | La tabla que estrenaba la regla de arrastre **la incumplió el mismo día** |

**Lo que enseña S4, y son tres cosas.**

**Una suite en verde no dice nada por sí sola.** H-15, H-16 y H-17 convivieron con 20 pruebas pasando. Lo que los destapó fue contrastar el código contra la spec, no ejecutarlo.

**Un defecto sobrevive por darlo por cerrado, no por difícil.** H-19 cruzó tres módulos y dos cierres. El argumento que lo despriorizó cada vez -«en producción no ocurre»- resultó **falso**, y nadie lo comprobó hasta la quinta revisión: `debug=false` es la configuración de producción, y es con la que se reprodujo la fuga del SQL con el hash de la contraseña dentro.

**Una comprobación cuenta cuando se la ha visto fallar.** Las siete revisiones encontraron el verificador en verde sobre mutaciones reales, siempre por el mismo motivo: la mutación con la que se había probado cada comprobación era la que esa comprobación ya cubría por construcción. De ahí salió la séptima regla de proceso del repositorio.

---

## S5 · Controles y guardarraíles · 2026-09-02 y 03

### Objetivo

**Contrastar las reglas que el repositorio declara contra lo que el repositorio hace**, y decidir cuáles hay que bajar a una capa que las ejecute.

El modelo mental: **una regla escrita en un fichero es una petición, no una garantía.** Se cumple lo bastante como para que dejes de comprobarla, y entonces deja de cumplirse sin que nadie se entere.

De ahí salen dos cosas que conviene no mezclar:

| | Qué es | Dónde vive |
|---|---|---|
| **Modo de fallo** | Una **propiedad** de la regla. Se razona sin mirar nada. Decide en qué capa tiene que vivir | `CLAUDE.md` |
| **Estado** | **Empírico**. Solo sale contrastando la regla contra el repositorio | `auditoria-reglas-de-proceso.md` |

Escribir la primera y dar por hecha la segunda es exactamente cómo un fichero de reglas acaba siendo una lista de buenas intenciones.

Y una tercera categoría, que es la que se olvida: **no se puede comprobar** no es un estado pendiente, es una propiedad de la regla. Ninguna comprobación sabe si un documento sigue siendo útil.

**La sesión no se ha impartido.** Lo que hay es el prework y el trabajo de llegar con el terreno hecho.

### Estado al empezar

Tercer salto de rama. Esta vez ya sabíamos lo que iba a pasar, así que **se midió antes de tocar nada**, fichero a fichero.

`upstream/s5/start` trae **23 pruebas en cinco ficheros** -las cuatro de `auth` más una de responsable-, **dos ADR** que son los del curso, y el documento OpenAPI **generado** desde los decoradores de los controladores y servido en `/api`, que es exactamente el camino contrario al que había decidido nuestro ADR-0004.

Lo que no cruzó: `docs/hallazgos.md`, `docs/trazabilidad.md`, `scripts/`, `.github/`, y el **runner de pruebas del frontend**, que desapareció otra vez.

Y lo que la comparación fichero a fichero encontró antes de portar nada: **seis de los siete defectos que habíamos cerrado volvían rotos**. Al ejecutar las pruebas ya portadas aparecieron **tres más** que ninguna lectura había visto.

**Qué se hizo.** El prework entero, la auditoría de las catorce reglas de proceso del repositorio, la calibración del revisor, y **portar los cierres del Módulo 4**.

### Estado al terminar

| | Inicio | Fin |
|---|---:|---:|
| Ficheros de prueba, backend | 5 | **15** |
| **Pruebas ejecutándose** | **23 + 0** | **75 backend + 28 frontend** |
| Comprobaciones del verificador | 0 | **15** |
| Workflows de CI | 0 | **2** |
| ADR | 2 | **6** |
| Migraciones | 4 | **6** |
| Documentos en `docs/` | 19 | **32** |
| Defectos ya cerrados que seguían vivos | **9** | **0** |

**Quince comprobaciones y no las diecisiete de S4**, y la diferencia es una decisión, no una pérdida: dos contrastaban un contrato escrito a mano y esta rama lo genera, así que aquí habrían sido comprobaciones vacías. Otras dos se reapuntaron a los decoradores, que es donde sí queda algo que contrastar, y encontraron dos defectos del contrato generado.

**Qué quedó.** `docs/auditoria-reglas-de-proceso.md` con la columna de estado deliberadamente sin rellenar, `.github/calibracion-revision.md`, los dos workflows, y la rama del port.

**Hallazgos: uno nuevo, y nueve que volvieron.**

**H-23** · cuatro rutas de `auth` están fuera del contrato generado. Un generador escribe fielmente lo que hay decorado y **no dice nada de lo que no lo está**: el documento sale bien formado, completo de su parte, y en silencio sobre el resto.

Y lo que más enseña de este módulo: **nueve defectos cerrados volvieron rotos** en la rama del curso, porque llega a la misma funcionalidad por otro camino y nunca tuvo nuestros arreglos.

**Tres de esos nueve no se detectaron leyendo la rama.** Se detectaron al ejecutar las pruebas portadas:

- **H-01** lo encontró `aislamiento.spec.ts` al fallar. La suite habría escrito sobre la base de desarrollo.
- **El runner de frontend** no había cruzado, y nadie lo notó porque **lo que faltaba era la herramienta que lo mediría**.
- **El `.gitignore`** tampoco cruzó, así que lo que no debía subirse quedó sin proteger.

**Lo que enseña S5.** Leer una rama no sustituye a ejecutar sus pruebas en ella. El plan escrito antes de portar contaba seis defectos y eran nueve, y la diferencia son exactamente los que ninguna lectura podía ver.

---

## Lo que queda abierto hoy

| | Qué | Por qué |
|---|---|---|
| **H-23** | Cuatro rutas fuera del contrato generado | Decorarlas exige esquemas que esta rama no tiene. Vigilado con lista cerrada |
| - | Los requisitos que solo se observan en pantalla | No hay runner de navegador. Vitest cubre `lib/api.ts`; falta el que ve la pantalla |
| - | El revisor adversarial en CI | Escrito y sin credencial. Hasta que se le vea encontrar algo, **no cuenta** |
| - | **Dos aproximaciones al contrato conviven** | La generada de `s5/start` y ADR-0004, que la descarta. Es material de la sesión |

Ninguno es deuda olvidada: los cuatro están declarados, y la diferencia entre un hueco conocido y una omisión es todo lo que este recorrido ha tratado de aprender.

---

## Si quieres rehacerlo

Los pasos, con los comandos y en orden, están en [`guia-de-replicacion.md`](guia-de-replicacion.md). Lleva además tres cosas que este documento no tiene:

- **La lista de comprobación del salto de rama**, que es lo que aquí costó nueve defectos.
- **Los cinco errores que más caros salieron**, cada uno con lo que lo destapó.
- **Un glosario** de los términos que este recorrido usa sin explicar: spec viva, delta, gate humano, mutación, arrastre de hallazgos, modo de fallo.
