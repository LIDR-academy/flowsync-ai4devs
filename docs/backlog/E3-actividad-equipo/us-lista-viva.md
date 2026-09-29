# E3-2 — La lista se mantiene fresca sola

**Identificador:** pendiente de asignar (etiqueta provisional `E3-2`)
**Épica:** E3 · Actividad del equipo
**Traza:** RF-18, RF-19 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo con la lista abierta, quiero que los cambios de los demás aparezcan solos, para que lo que estoy mirando sea la verdad de ahora y no la de hace diez minutos.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

> **Por qué esta historia pesa más de lo que ocupa.** El PRD dice de este requisito que *es el que distingue a FlowSync de un tablero compartido cualquiera; si se cae, el producto pierde su razón de ser*. Una lista que hay que refrescar a mano vuelve a poner al usuario a preguntar «¿esto sigue así?», que es exactamente el problema del que el producto nace.

---

## Criterios de aceptación

### El cambio ajeno llega solo

**CA-1 — Un cambio de estado aparece sin hacer nada**
DADO que otra persona y yo tenemos la lista abierta
CUANDO esa persona cambia el estado de una tarea
ENTONCES el nuevo estado aparece en mi lista sin que yo refresque ni haga clic en nada.

**CA-2 — Una tarea nueva aparece sola**
DADO que tengo la lista abierta
CUANDO otra persona crea una tarea
ENTONCES aparece en mi lista sin intervención mía.

**CA-3 — Una tarea borrada desaparece sola**
DADO que tengo la lista abierta
CUANDO otra persona borra una tarea
ENTONCES deja de aparecer en mi lista.

**CA-4 — Un cambio de responsable aparece solo**
DADO que tengo la lista abierta
CUANDO otra persona se asigna una tarea que llevaba alguien más
ENTONCES el nuevo responsable aparece en esa fila.

**CA-5 — Mis propios cambios también son inmediatos**
DADO que estoy en la lista
CUANDO cambio yo el estado de una tarea
ENTONCES lo veo reflejado al momento, sin esperar a ninguna vuelta.

### Actualizar sin interrumpir

**CA-6 — No me roba el foco**
DADO que tengo el cursor puesto en un campo
CUANDO llega un cambio hecho por otra persona
ENTONCES el foco sigue donde estaba.

**CA-7 — No me tira el texto a medio escribir**
DADO que estoy escribiendo el título de una tarea nueva y aún no lo he guardado
CUANDO llega un cambio ajeno
ENTONCES lo que llevo escrito sigue ahí, tal cual.

**CA-8 — No me mueve el sitio donde estoy mirando**
DADO que he bajado por la lista y estoy leyendo por la mitad
CUANDO llega un cambio ajeno en una tarea que no estoy mirando
ENTONCES no salto de sitio.

**CA-9 — No me cierra lo que tengo abierto**
DADO que tengo una tarea abierta
CUANDO llega un cambio ajeno en otra tarea
ENTONCES lo que tengo abierto sigue abierto.

**CA-10 — El cambio se nota sin exigir atención** · **[PROPUESTO]**
DADO que estoy mirando la lista
CUANDO una fila cambia por acción de otra persona
ENTONCES el cambio es perceptible al mirar
Y no aparece ningún aviso que haya que cerrar ni que interrumpa lo que hago.

*Motivo de la propuesta: el PRD exige que la actualización no interrumpa y por separado que el estado sea la señal que el equipo lee, pero no dice cómo se concilian. Sin esto, cumplir «no interrumpir» al pie de la letra permite que el cambio pase inadvertido, que es la otra forma de fallar.*

### Límites y criterios negativos

**CA-11 — Nada de notificaciones fuera de la aplicación**
DADO que hay cambios en las tareas del equipo
CUANDO no tengo la aplicación abierta
ENTONCES no recibo aviso de ningún tipo por ningún otro canal.

**CA-12 — La frescura no se compra con vigilancia**
DADO que la lista se actualiza sola
CUANDO miro lo que aparece
ENTONCES no veo quién está conectado, ni quién ha mirado qué, ni actividad por persona.

**CA-13 — Actualizarse no cambia lo que veo por mi lente** · **[PROPUESTO]**
DADO que tengo un filtro aplicado
CUANDO llegan cambios ajenos
ENTONCES mi filtro sigue puesto tal como lo dejé.

*Motivo de la propuesta: la historia del filtro ya define qué entra y qué sale de la vista cuando el contenido cambia solo; aquí se declara el reverso, que la lente en sí no la toca nadie más que yo.*

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **Qué ve alguien cuando la tarea que tiene abierta y está editando se desvanece o cambia de manos.** Es el choque directo entre esta historia y los roles planos: sin decisión, cada implementación resolverá distinto. Pendiente de **PA-8**.
- **Cuánto puede tardar un cambio en aparecer y seguir contando como automático.** El PRD pide que no haya espera perceptible pero no fija umbral, así que ningún criterio de aquí puede suspender por lento. Pendiente de **PA-9**.
- **Qué ocurre si se pierde la conexión y vuelve.** Nada en el PRD dice si la lista debe avisar de que dejó de estar fresca, ni cómo se pone al día al reconectar. Sin esto, una lista congelada por un corte se lee como una lista tranquila, que es el peor fallo posible para este requisito.

---

## Tickets

**Todavía sin descomponer.** Se descompone cuando entre en la sesión de trabajo que la implemente, no antes: los tickets son planificación de entrega y caducan si se escriben con doce historias de antelación.

**⚠️ Antes de descomponerla hay que decidir cómo viaja el cambio** (conexión persistente, sondeo, o cualquier otra vía). Esa decisión no está en el PRD, no la toma un ticket y condiciona todos los que salgan de aquí.
