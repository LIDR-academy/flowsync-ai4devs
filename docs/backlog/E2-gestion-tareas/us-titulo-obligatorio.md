# E2-2 — Título obligatorio

**Identificador:** `E2-2` · etiqueta provisional, **pendiente de ID** (ver [backlog](../README.md))
**Épica:** E2 · Gestión de tareas
**Traza:** RF-6 del [PRD](../../prd/flowsync-mvp.md)

## Historia

> Como miembro del equipo, quiero que ninguna tarea pueda existir sin título, para que la lista siga siendo legible y nadie se encuentre con una fila que no dice de qué trabajo habla.

> **Nota de estado.** Los criterios marcados **[PROPUESTO]** siguen pendientes de validación: no derivan del PRD, sino que cubren huecos detectados al redactarlos. El resto sale directamente de los requisitos.

---

## Criterios de aceptación

### Sin título no hay tarea

**CA-1 — Crear sin título se rechaza**
DADO que voy a crear una tarea
CUANDO intento crearla sin haber escrito ningún título
ENTONCES no se crea ninguna tarea
Y se me explica el problema junto al propio campo, en lenguaje corriente.

**CA-2 — Un título en blanco no cuenta como título**
DADO que voy a crear una tarea
CUANDO escribo únicamente espacios y trato de crearla
ENTONCES se rechaza igual que si el campo estuviera vacío
Y no aparece en la lista ninguna fila sin texto.

### El título largo

**CA-3 — Un título que se pasa de largo se avisa, no se recorta en silencio** · **[PROPUESTO]**
DADO que escribo un título más largo de lo que el sistema admite
CUANDO intento crear la tarea
ENTONCES se me avisa de que se pasa de largo
Y en ningún caso se guarda una versión recortada sin habérmelo dicho.

*Motivo de la propuesta: el requisito de origen habla de admitir «con holgura» una frase descriptiva y de avisar ante uno «desmedido», sin fijar dónde está la frontera, y el propio PRD lo señala como no verificable tal y como está escrito (PA-9). Este criterio fija solo la conducta observable, avisar en lugar de recortar. **El umbral sigue sin decidir y aquí no se inventa ninguno.***

---

## Criterios que todavía no se pueden escribir

Dependen de decisiones abiertas en el PRD; se dejan anotados para que nadie dé por completa la lista.

- **«Que un compañero reconozca de qué trabajo se habla».** Es la mitad del requisito de origen y no hay forma de suspenderla: depende de las convenciones de cada equipo, no del sistema. Pendiente de **PA-9**, y ligado a la limitación que el propio alcance reconoce.
- **Cuánto es «demasiado largo».** El límite que hace falta para poder probar CA-3 es una decisión de producto sin tomar. Pendiente de **PA-9**.
