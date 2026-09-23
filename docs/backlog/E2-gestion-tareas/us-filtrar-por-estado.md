# FS-142 — Filtrar las tareas por estado

**Identificador:** FS-142
**Épica:** E2 · Gestión de tareas
**Traza:** RF-20, RF-21 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero filtrar la lista por estado, para centrarme en lo pendiente sin que lo ya terminado me estorbe.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

---

## Criterios de aceptación

### Vista por defecto y camino feliz

**CA-1 — Lo hecho no ocupa sitio por defecto**
DADO que hay tareas en los tres estados
CUANDO abro la lista sin tocar ningún filtro
ENTONCES veo las pendientes y las que están en curso
Y no veo ninguna de las hechas.

**CA-2 — Filtrar por un estado concreto**
DADO que hay tareas en los tres estados
CUANDO filtro por «Pendiente»
ENTONCES veo únicamente las pendientes, y ninguna en curso ni hecha.

**CA-3 — Lo hecho sigue siendo consultable**
DADO que hay tareas hechas, que por defecto no se ven
CUANDO filtro por «Hecho»
ENTONCES aparecen todas ellas.

**CA-4 — Quitar el filtro devuelve a la vista por defecto** · **[PROPUESTO]**
DADO que tengo aplicado un filtro
CUANDO lo quito
ENTONCES vuelvo a ver pendientes y en curso, sin las hechas
Y no existe ninguna vista que mezcle las hechas con el resto.

*Motivo de la propuesta: el PRD no dice qué significa «sin filtro». Se propone que sea la vista por defecto y no un «Todas», porque un «Todas» reintroduciría por la puerta de atrás justo lo que el requisito de origen saca de en medio.*

**CA-5 — Marcar algo como hecho lo saca de la vista, pero no lo pierde**
DADO que estoy en la vista por defecto
CUANDO marco una tarea como «Hecho» desde la lista
ENTONCES desaparece de mi vista
Y vuelvo a encontrarla filtrando por «Hecho».

**CA-6 — El filtro se maneja sin ratón**
DADO que estoy en la lista
CUANDO uso únicamente el teclado
ENTONCES puedo aplicar y quitar el filtro igual que con el ratón.

### Los tres vacíos, que no son el mismo

Una lista sin filas puede significar tres cosas distintas, y quien mira tiene que poder distinguirlas.

**CA-7 — Filtro válido sin resultados**
DADO que ahora mismo no hay ninguna tarea en curso
CUANDO filtro por «En curso»
ENTONCES veo una lista vacía que dice explícitamente que no hay tareas en ese estado
Y no se me presenta como un error, porque no lo es.

**CA-8 — Espacio todavía sin tareas**
DADO que en el espacio no se ha creado ninguna tarea
CUANDO miro la lista
ENTONCES se me explica qué es esto y se me ofrece crear la primera
Y no se me muestra el mensaje de «no hay tareas con este filtro», que daría a entender que hay trabajo escondido detrás de un filtro.

**CA-9 — Se pide un estado que no existe**
DADO que llego a la lista desde un enlace guardado que pide un estado que no es ninguno de los tres
CUANDO se muestra la lista
ENTONCES se me avisa de que ese filtro no es válido
Y **no** se me devuelve una lista vacía en silencio
Y se me ofrece volver a la vista por defecto.

**CA-10 — El aviso distingue el error de la ausencia** · **[PROPUESTO]**
DADO que se me ha avisado de un filtro no válido
CUANDO leo el mensaje
ENTONCES entiendo que el problema es lo que he pedido, no que el equipo no tenga trabajo en ese estado.

*Motivo de la propuesta: impide resolver CA-9 reutilizando el mensaje de CA-7. Confundirlos es el fallo silencioso que hay que evitar: una lista vacía que se lee como «no hay nada pendiente» cuando la verdad es «tu petición no tenía sentido».*

### Con la lista viva

**CA-11 — Una tarea sale del filtro sola** · **[PROPUESTO]**
DADO que estoy viendo la lista filtrada por «Pendiente»
CUANDO otra persona pasa una de esas tareas a «En curso»
ENTONCES esa tarea deja de aparecer en mi vista
Y el resto de lo que estoy mirando no se desplaza ni cambia de sitio.

**CA-12 — Una tarea entra en el filtro sola** · **[PROPUESTO]**
DADO que estoy viendo la lista filtrada por «En curso»
CUANDO otra persona pasa una tarea a ese estado
ENTONCES aparece en mi vista sin que yo haga nada.

*Motivo de la propuesta de CA-11 y CA-12: el PRD define el filtro y la lista viva por separado y nunca dice qué ocurre cuando se cruzan. Sin esto, el comportamiento razonable —que el filtro siga siendo cierto en todo momento— queda sin escribir.*

**CA-13 — Filtrar es una lente mía, no un cambio para todos** · **[PROPUESTO]**
DADO que otra persona tiene la lista abierta
CUANDO yo aplico o quito un filtro
ENTONCES su vista no cambia en absoluto.

*Motivo de la propuesta: el requisito de la lista compartida dice que es «idéntica para todos», y leído al pie de la letra podría entenderse que el filtro también se comparte. Lo compartido es el contenido, no la lente.*

**CA-14 — Un filtro vacío no se convierte en error al vaciarse** · **[PROPUESTO]**
DADO que estoy filtrando por «En curso» y veo una sola tarea
CUANDO otra persona la pasa a «Hecho» y mi vista se queda sin filas
ENTONCES se me muestra el mensaje de que no hay tareas en ese estado, no un error.

### Límites y criterios negativos

**CA-15 — El estado es la única dimensión de filtrado**
DADO que estoy en la lista
CUANDO busco opciones para acotar lo que veo
ENTONCES la única disponible es el estado
Y no existe ninguna forma de filtrar por responsable.

**CA-16 — Un solo estado a la vez** · **[PROPUESTO]**
DADO que estoy filtrando por «Pendiente»
CUANDO filtro por «En curso»
ENTONCES sustituyo el filtro anterior en lugar de sumarlo.

*Motivo de la propuesta: la vista por defecto ya muestra dos estados a la vez, así que sin decir esto queda ambiguo si el filtro admite selección múltiple. Se propone que no: la vista por defecto no es un filtro, es la ausencia de uno.*

**CA-17 — El filtro no se queda pegado** · **[PROPUESTO]**
DADO que he filtrado por «Hecho»
CUANDO recargo o vuelvo a entrar más tarde
ENTONCES aparezco en la vista por defecto, no en el filtro que dejé puesto.

*Motivo de la propuesta: es el riesgo de obsolescencia disfrazado. Quien se deje puesto «Hecho» y vuelva por la mañana verá una foto falsa del equipo y creerá que nadie está haciendo nada. Que el estado de partida sea siempre el mismo protege la promesa del producto.*

**CA-18 — Filtrar no modifica ninguna tarea**
DADO que hay tareas en varios estados
CUANDO aplico y quito filtros varias veces
ENTONCES ninguna tarea cambia de estado, de responsable ni de fecha.

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **El orden dentro de la lista filtrada.** No hay regla de orden definida. Se nota sobre todo al filtrar por «Hecho», que es el único conjunto que crece sin límite: sin orden, esa vista se vuelve inútil en unas semanas. Pendiente de **PA-3**.
- **Recuperar una tarea marcada como hecha por error.** CA-5 señala el filtro como camino de vuelta, pero si esa transición es legal lo decide **PA-7**.

---

## Tickets

Esta historia es **deliberadamente ligera** y sale con **un solo ticket**. No hay ticket de Migración/DB: filtrar no añade nada que almacenar, se apoya en el estado que otra historia persiste. Y no hay ticket de Frontend en este alcance: lo que se entrega es la capacidad de acotar la lista, que se verifica contra la API.

### FS-142.1 — Acotar la lista por estado

**Tipo:** Endpoint/API · **Talla:** M · **Riesgo:** medio
**Entrega:** la lista admite acotarse por estado, distingue la ausencia de filtro de un filtro concreto, y **rechaza un estado que no existe en lugar de responder vacío**.

- [ ] Sigue las convenciones de ruta y de forma de respuesta ya establecidas en el proyecto; nada ad hoc.
- [ ] La respuesta se construye con el transformer correspondiente; no se devuelve el modelo en crudo.
- [ ] El estado solicitado se valida con el mecanismo de validación del proyecto.
- [ ] Un estado no reconocido se rechaza señalando el problema, en el mismo formato de error que ya usa el resto de la API. **No** devuelve una lista vacía en silencio.
- [ ] Un filtro válido sin coincidencias devuelve una lista vacía y **no** un error: son dos caminos distintos y no se comparten.
- [ ] La ausencia de filtro devuelve pendientes y en curso, y deja fuera las hechas.
- [ ] Filtrar es una operación de solo lectura: ninguna tarea cambia de estado, de responsable ni de fecha.
- [ ] Exige sesión iniciada, igual que el resto del espacio.
- [ ] Pruebas de integración de: cada estado válido, ausencia de filtro, filtro válido sin resultados y estado no reconocido.
- [ ] Los tipos generados para el cliente se regeneran y se commitean si cambian.
- [ ] Lint, formato y typecheck del backend en verde.

**Depende de:** los tres estados de la tarea y la lista compartida (ambos fuera de FS-142).
**Nota de riesgo:** es aquí donde se pierde la distinción entre *filtro inválido* y *filtro sin resultados*. Si se juntan en este ticket, ya no se recuperan más arriba: una lista vacía se leerá como «no hay nada pendiente» cuando la verdad es «lo que has pedido no existe».

**⚠️ Decisión de producto pendiente antes de empezar:** CA-9 exige poder llegar con un estado pedido desde fuera de la interfaz, lo que implica un filtro direccionable; CA-17 exige que recargar devuelva a la vista por defecto. **Tal y como están escritas son incompatibles.** Cuesta una conversación y decide qué se construye.
