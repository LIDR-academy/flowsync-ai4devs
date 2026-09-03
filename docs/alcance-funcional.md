# Alcance funcional

> Qué puede hacer una persona con FlowSync hoy, historia a historia, y qué módulo lo construyó.
>
> Esto no sustituye al backlog ni a la spec viva: el backlog dice **qué se pidió**, `openspec/specs/` dice **qué comportamiento es contrato**, y esto dice **qué de lo pedido existe**. Las tres cosas se contradicen con facilidad, y por eso están separadas.
>
> Última revisión: 2026-09-03.

## Los módulos, y cuál añadió funcionalidad

| Módulo | Qué hizo | Funcionalidad que añadió |
|---|---|---|
| **1** · Priming | Autenticación en el frontend sobre la API que ya traía el repositorio | Registro, acceso, perfil, cierre de sesión |
| **2** · Spec-Driven Development | PRD, alcance del MVP y backlog de la épica E2 | **Ninguna.** Es el módulo que decide qué construir |
| **3** · OpenSpec | La gestión de tareas entera, más la base de pruebas | Lista, crear, cambiar estado, vencimiento, filtro |
| **4** · Verificación | Trazabilidad, documentación que se contrasta, revisión adversarial | **Ninguna.** Lo que salió fueron nueve defectos de lo ya construido |
| **5** · Controles y guardarraíles | Solo el prework, y portar los cierres del Módulo 4 | **Ninguna.** La sesión no ha ocurrido |

**Dos de los cinco módulos no añadieron funcionalidad, y son los que más cambiaron el proyecto.** Uno decidió qué construir y el otro descubrió que lo construido tenía nueve defectos con la suite en verde.

## Épica E2 · Gestión de tareas

| # | Como miembro del equipo, quiero… | Estado | Cómo funciona hoy |
|---|---|---|---|
| **E2-1** | …crear una tarea escribiendo únicamente su título, para que anotar cueste segundos y no me frene un formulario | **Hecho** · M3 | Un campo y un botón en la lista. No se pide nada más |
| **E2-2** | …que ninguna tarea pueda existir sin título, para que nadie se encuentre una fila que no dice de qué trabajo habla | **Hecho** · M3 | Obligatorio y máximo 200 caracteres. El aviso sale junto al propio campo |
| **E2-3** | …que una tarea nazca ya a mi nombre y en «Pendiente», para no elegir responsable ni estado cada vez | **Hecho** · M3 | Los pone el servidor. Mandarlos en la petición **no sirve**: se ignoran |
| **E2-4** | …cambiar el estado desde la propia lista, para que mantener al día cueste un gesto y no deje de hacerse | **Hecho** · M3 | Tres botones en la fila. Cualquiera cambia el de cualquier tarea, **en cualquier dirección** |
| **E2-5** | …abrir una tarea, para ver y tocar lo que la lista deliberadamente no muestra | **Hecho** · M3 | Pantalla propia. Es la única que informa del vencimiento |
| **E2-6** | …corregir el título de cualquier tarea, para que la lista siga diciendo la verdad | **Fuera de alcance** | — |
| **E2-7** | …cambiar quién lleva una tarea, para cogerla yo sin pedir permiso ni interrumpir a nadie | **Fuera de alcance** | — |
| **E2-10** | …borrar una tarea que ya no tiene sentido, para que la lista no se llene de ruido | **Fuera de alcance** | — |
| **FS-118** | …poner o quitar una fecha de vencimiento al abrir una tarea y ver si se ha pasado de plazo | **Hecho** · M3 | Se guarda sola, sin confirmar. **Vencida se decide al mirar**, no se almacena |
| **FS-142** | …filtrar la lista por estado, para centrarme en lo pendiente sin que lo terminado me estorbe | **Hecho** · M3 | Cuatro vistas. Un estado inventado en la URL **explica que no existe** |

## Épica E3 · Actividad del equipo

| # | Como miembro del equipo, quiero… | Estado | Cómo funciona hoy |
|---|---|---|---|
| **E3-1** | …ver una sola lista con todas las tareas del espacio, con su responsable y estado a la vista, para saber en qué anda cada uno sin preguntar | **Hecho** · M3 | Una lista, la misma para todos. **No filtra por quién mira** |
| **E3-2** | …que los cambios de los demás aparezcan solos, para que lo que miro sea la verdad de ahora y no la de hace diez minutos | **Fuera de alcance** | Sin refresco automático ni polling. Hay que recargar |

**Siete de las doce historias están implementadas.** Las cinco que no lo están son decisiones de alcance del MVP, no deuda: están en el backlog con sus criterios y ninguna capa del código las insinúa.

## Tres reglas del sistema que no son historias y se notan

**El vencimiento se decide al mirar, no se almacena.** El cliente manda su día en cada consulta y el servidor responde si la tarea está vencida **contra ese día**. Consecuencias que parecen defectos y no lo son: dos personas en husos distintos ven cosas distintas y las dos son correctas, y una tarea pasa a vencida sola al cambiar el día sin que nadie la haya tocado.

Y una tercera condición que costó encontrarse: **una tarea hecha nunca sale vencida**, aunque su fecha haya pasado. Era H-15.

**El espacio es plano.** No hay permisos ni roles: quien tiene sesión ve todo y toca todo, incluidas las tareas de otras personas. Que una tarea sea «tuya» es información, no una barrera. Está así a propósito, y el requisito «una sola vista de tareas, sin señales de presencia» existe para que nadie lo confunda con un descuido.

**La lista no enseña el vencimiento.** Solo la tarea abierta. No es una omisión de la interfaz: son **dos objetos distintos** en el código -`TaskTransformer` y `TaskDetailTransformer`-, para que no se pueda colar por olvido. Un solo objeto con campos opcionales habría dejado el requisito en manos de que alguien se acuerde.

## Y una historia que fue un hallazgo

**E2-5 no tiene requisito propio en el PRD, y eso salió al escribirla.**

Dos requisitos la dan por hecha. RF-13 lo dice en su criterio de aceptación -«la fecha se consulta y se establece **únicamente al abrir la tarea**»-, y RF-15 en su enunciado: el vencimiento «debe ser visible al abrir la tarea, y no en la vista principal de la lista». **Ninguno de los dos crea la pantalla donde abrirla.** Sin esa superficie, los dos son incumplibles.

Lo recoge el punto abierto **PA-6**, y su lectura es más incómoda que «falta una pantalla»: dice que los nueve puntos del alcance **describen una lista**, mientras los requisitos exigen además abrir una tarea, elegir a una persona entre las registradas y advertir de que los datos pueden no estar frescos. Son tres superficies con estados propios que **la estimación cuenta como cero**. Lo que PA-6 pide corregir no es el alcance: es la estimación.

Es el tipo de hueco que solo aparece al traducir requisitos a historias, y es una de las razones por las que el Módulo 2 no produjo código.

## Lo que este documento no dice

**Cuántos criterios de aceptación están cubiertos por pruebas.** Eso está en [`docs/trazabilidad.md`](trazabilidad.md), requisito a requisito, con los huecos declarados: de los requisitos de sistema de `tasks` los tiene todos, y los que solo se observan en pantalla no, porque no hay runner de navegador.

**Cuáles de los criterios están validados.** **27 de los 118** siguen marcados `[PROPUESTO]`: no derivan del PRD, cubren huecos detectados al redactarlos, y están pendientes de validación. Escribir una prueba contra un criterio propuesto fija como contrato algo que nadie ha aprobado, así que el orden es validarlo primero. El recuento está en [`docs/trazabilidad.md`](trazabilidad.md).

**Una nota sobre la numeración**, que es irregular y conviene no dar por buena: las historias de E2 van `E2-1` a `E2-7` y `E2-10`, con hueco en medio, y dos llevan identificadores de otro esquema -`FS-118` y `FS-142`- porque entraron por otra vía. El backlog es el registro de lo que se decidió, no una lista renumerada a posteriori.

Y **tres de sus doce ficheros no son historias** sino criterios de aceptación de otra, así que la cuenta de «doce historias» infla el recuento real. Está anotado en [`docs/reporte-modulo-4.md`](reporte-modulo-4.md), y por eso esta tabla habla de doce ficheros y no de doce historias verificadas.
