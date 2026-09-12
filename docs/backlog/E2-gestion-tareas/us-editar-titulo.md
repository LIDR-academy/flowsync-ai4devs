# E2-6 — Editar el título de una tarea

**Identificador:** pendiente de asignar (etiqueta provisional `E2-6`)
**Épica:** E2 · Gestión de tareas
**Traza:** RF-11 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero corregir el título de cualquier tarea, para que la lista siga diciendo la verdad cuando el trabajo resulta ser otro del que parecía.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

> **Por qué importa más de lo que parece.** El PRD reconoce que el producto solo evita la colisión que lo motiva *si los títulos resultan reconocibles para un compañero*. Poder corregir un título es lo único que permite arreglar esa apuesta cuando sale mal.

---

## Criterios de aceptación

### Camino feliz

**CA-1 — Cambiar el título**
DADO que estoy sobre una tarea existente
CUANDO cambio su título y guardo
ENTONCES la tarea pasa a llamarse así.

**CA-2 — El cambio es para todo el equipo**
DADO que he cambiado el título de una tarea
CUANDO otra persona mira la lista
ENTONCES ve el título nuevo, no el anterior.

**CA-3 — Se puede editar una tarea ajena**
DADO que la tarea la creó otra persona y la lleva otra persona
CUANDO cambio su título
ENTONCES el cambio se aplica, sin permiso especial ni advertencia.

**CA-4 — Se edita sin ratón**
DADO que quiero corregir un título
CUANDO uso únicamente el teclado
ENTONCES puedo hacerlo igual que con el ratón.

### Las mismas reglas que al crear

**CA-5 — No se puede dejar sin título**
DADO que estoy editando el título de una tarea
CUANDO lo borro entero, o lo dejo solo con espacios, e intento guardar
ENTONCES se rechaza con un mensaje comprensible junto al campo
Y la tarea conserva el título que tenía.

**CA-6 — Cabe una frase descriptiva completa**
DADO que estoy editando un título
CUANDO escribo una frase que describe el trabajo con holgura
ENTONCES se acepta sin protestar.

**CA-7 — Un título desmedido avisa, no se recorta**
DADO que estoy editando un título
CUANDO escribo uno desmedido e intento guardar
ENTONCES se me avisa
Y no se guarda una versión recortada en silencio.

### Límites y criterios negativos

**CA-8 — Editar el título no toca nada más**
DADO que cambio el título de una tarea
CUANDO miro la tarea después
ENTONCES su estado, su responsable y su fecha son los mismos que antes.

**CA-9 — El título es lo único editable aquí**
DADO que estoy editando una tarea
CUANDO busco qué más puedo cambiar en este flujo
ENTONCES no hay ningún otro campo de texto, ni etiquetas, ni descripción, ni notas.

**CA-10 — Se puede abandonar sin guardar** · **[PROPUESTO]**
DADO que he escrito un título nuevo pero no he guardado
CUANDO me echo atrás
ENTONCES la tarea conserva el título original.

*Motivo de la propuesta: ningún requisito dice si la edición se confirma o se guarda sola al escribir. Se propone que haya un punto explícito de guardado, porque con roles planos cualquiera edita tareas ajenas y un guardado automático convierte un clic accidental en un cambio para todo el equipo.*

**CA-11 — Editar exige haber entrado**
DADO que no he iniciado sesión
CUANDO intento cambiar un título
ENTONCES no se aplica ningún cambio.

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **Qué cuenta exactamente como «con holgura» y como «desmedido».** El propio PRD reconoce que RF-6 no se puede verificar tal como está redactado, así que CA-6 y CA-7 no pueden suspender a nadie hasta que haya un umbral. Pendiente de **PA-9**.
- **Qué ve alguien que tiene la tarea abierta y editando cuando otro le cambia el título a la vez.** Pendiente de **PA-8**.
- **Si queda rastro del título anterior.** El PRD excluye el histórico del alcance, de modo que un título corregido borra al anterior sin dejar huella. Es consecuencia aceptada, no hueco.

---

## Tickets

**Todavía sin descomponer.** Se descompone cuando entre en la sesión de trabajo que la implemente, no antes.

**Nota para quien la descomponga:** las reglas de validación del título son **las mismas** que las de la creación. Si acaban escritas dos veces, acabarán divergiendo.
