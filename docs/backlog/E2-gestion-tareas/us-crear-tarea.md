# E2-1 — Crear tarea con solo el título

**Identificador:** `E2-1` · etiqueta provisional, **pendiente de ID** (ver [backlog](../README.md))
**Épica:** E2 · Gestión de tareas
**Traza:** RF-5 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero crear una tarea escribiendo únicamente su título, para que anotar en qué ando cueste segundos y no me frene un formulario.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

---

## Criterios de aceptación

### Camino feliz

**CA-1 — Un título basta para que la tarea exista**
DADO que estoy en la lista del espacio
CUANDO escribo un título y creo la tarea
ENTONCES la tarea queda creada y aparece en la lista
Y no he tenido que rellenar ningún otro dato.

**CA-2 — El flujo de creación no pide ni sugiere nada más**
DADO que voy a crear una tarea
CUANDO recorro el flujo de creación entero
ENTONCES el título es lo único que se me pide
Y no se me ofrece ni se me sugiere indicar responsable, estado, fecha ni ningún otro dato.

### Lo que ocurre justo después

**CA-3 — La tarea recién creada se ve sin volver a pedirla** · **[PROPUESTO]**
DADO que acabo de crear una tarea
CUANDO termino de crearla
ENTONCES la veo ya en la lista, sin recargar ni navegar a ninguna otra parte.

*Motivo de la propuesta: el PRD solo dice que aparezcan solos los cambios hechos por **otras** personas. Sobre lo que uno mismo acaba de crear no dice nada, y sin escribirlo cabe una lectura en la que crear te obliga a ir a buscar el resultado, que es justo la fricción que el requisito de origen quita.*
