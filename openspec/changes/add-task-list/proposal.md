## Why

FlowSync promete responder *«¿en qué anda cada uno, y qué hay libre?»* sin interrumpir a nadie. Hoy no puede: solo sabe dar de alta a una persona y dejarla entrar. No existe ninguna noción de tarea, ni de estado, ni de trabajo compartido.

Este cambio construye el sustrato mínimo que hace visible esa promesa: una lista compartida donde el trabajo se anota en segundos y se mantiene al día en un gesto. El backlog lo señala como el primer trabajo del orden priorizado, y la razón es de dependencia, no de gusto: sin lista no hay dónde ver ni tocar nada de la épica de gestión de tareas.

## What Changes

Cinco historias del backlog, en su versión mínima verificable:

| Historia | Traza | Qué entra |
|---|---|---|
| **E3-1** La lista compartida | RF-16, RF-17 | Una sola lista para todo el espacio, con título, responsable y estado a la vista |
| **E2-1** Crear con solo el título | RF-5 | Anotar trabajo escribiendo únicamente el título |
| **E2-2** Título obligatorio | RF-6 | Ninguna fila sin decir de qué trabajo habla |
| **E2-3** Nace mía y pendiente | RF-7, RF-8 | La tarea nueva llega a nombre de quien la crea y en «Pendiente» |
| **E2-4** Cambiar estado desde la lista | RF-9 | Cambiar el estado sin abrir nada ni confirmar |

- Nueva entidad de dominio: la **tarea**, con título, responsable y estado.
- Conjunto **cerrado** de tres estados. Cualquier otro valor se rechaza; no se admite crear, renombrar ni eliminar estados.
- Superficie de API mínima: **listar, crear y actualizar**. Nada más.
- Pantalla de lista, que pasa a ser el destino por defecto tras entrar.

No hay cambios que rompan nada: la capability `auth` no se toca.

## Capabilities

### New Capabilities

- `tasks`: el trabajo del equipo como entidad compartida. Crear una tarea, verla en una lista única e idéntica para todos, y cambiar su estado.

### Modified Capabilities

Ninguna. `auth` conserva todos sus requisitos sin cambios.

## Impact

**Backend.** Una tabla nueva y su migración; el esquema generado se regenera. Un modelo, un validador, un transformer y un controlador con tres acciones, siguiendo el flujo que ya usa `auth`: ruta → controller → validator → model → transformer → `serialize()`.

**Frontend.** Tipos y funciones nuevas en `lib/api.ts`, que sigue siendo el único punto de contacto con el backend. Pantalla de lista construida con los componentes de `ui/` que ya existen. Una ruta protegida más, y el destino por defecto tras entrar deja de ser el perfil.

**Dependencias.** Ninguna nueva, ni en backend ni en frontend.

**Base de datos.** Las cuentas existentes no se tocan. La migración es aditiva.

## Fuera de alcance

Declarado para que nadie lo dé por implícito. Cada línea es una historia del backlog que llega después, no un olvido:

- **Fecha de vencimiento** (FS-118). La lista no muestra fechas ni marcas de vencimiento, y este cambio no deja el hueco preparado.
- **Filtrar por estado** (FS-142). La lista se muestra entera.
- **Que las tareas hechas salgan de la vista por defecto**. Es parte de FS-142, no de esta lista.
- **Reasignar responsable** (E2-7). El responsable se fija al crear y no se cambia todavía.
- **Editar el título** (E2-6) y **borrar** (E2-10).
- **Abrir una tarea** (E2-5). No hay vista de detalle, así que todo ocurre en la lista.
- **La lista fresca sola** (E3-2). Los cambios de otras personas se ven al recargar, no solos. Es la historia que el PRD llama la que distingue a FlowSync de un tablero cualquiera, y necesita una decisión técnica que no toma un ticket.
- **Pruebas automatizadas.** Este cambio no monta base de pruebas ni escribe tests. Va en un cambio propio, porque el bloqueo R-7 del backlog obliga a resolver antes el aislamiento de la base de datos.

## Puntos abiertos

Ninguno se inventa aquí. Cada uno bloquea criterios que quedan sin escribir.

| # | Punto abierto | Efecto en este cambio |
|---|---|---|
| **PA-9** | No hay umbral decidido para «título demasiado largo» | E2-2 CA-3 exige avisar en lugar de recortar, pero no hay número que suspender. Se implementa la conducta observable —avisar, nunca recortar en silencio— y el límite concreto queda como guarda técnica declarada en `design.md`, no como regla de producto |
| **PA-7** | No hay grafo de transiciones entre estados | E2-4 CA-3 dice a qué estados se puede llegar, no desde cuáles. Se permiten todas las transiciones, y queda anotado que esto hace muy barato marcar algo como hecho por error |
| **PA-3** | No hay regla de orden ni agrupación de la lista | E3-1 CA-5 promete poder enumerar el trabajo de cada persona, y sin orden esa promesa no se sostiene al crecer. Este cambio no fija ninguna regla de orden de producto |
| **PA-8** | Sin decisión sobre el choque de ediciones | Dos personas cambiando el estado de la misma tarea a la vez. Con este alcance el riesgo es bajo, pero la decisión sigue sin tomar |
| **H-11** | El email distingue mayúsculas | Una misma persona puede tener dos cuentas, y por tanto figurar como dos responsables distintos en la misma lista. Es un hallazgo de `auth`, no de este cambio, pero se manifiesta aquí por primera vez |

## Una divergencia con el material del directo, resuelta a favor del repositorio

La grabación de la sesión enuncia como restricción que la tarea *«nace en pendiente y no con quien la crea como responsable»*. El backlog dice lo contrario: **E2-3 CA-1**, *«Nace con mi nombre como responsable»*, y el alcance lo justifica porque el momento típico de escritura es «voy a ponerme con esto».

Se sigue el backlog. Es la regla del propio repositorio: si el tablero o el material y los criterios de aceptación se contradicen, manda el repositorio.
