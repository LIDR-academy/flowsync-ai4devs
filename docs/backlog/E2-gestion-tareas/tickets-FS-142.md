# FS-142: tickets

Historia: [FS-142 Filtrar las tareas por estado](us-filtrar-por-estado.md). Las convenciones, la Definition of Done por tipo y las dependencias externas (EXT-n) están en el [README del backlog](../README.md).

- **No hay ticket de Migración/DB.** Filtrar no añade nada a lo que se guarda: los estados ya los trae EXT-1. Si hace falta un índice, se decide al implementar.
- **No hay ticket de Bug**, porque todavía no hay nada construido.

## Resumen

| ID | Título | Tipo | Bloqueado por |
|---|---|---|---|
| **FS-142.1** | Regla de dominio: qué tareas entran en cada filtro | Modelo/Dominio | EXT-1, EXT-2 |
| **FS-142.2** | La lista de tareas acepta un filtro por estado y rechaza los que no existen | Endpoint/API | FS-142.1, EXT-3 |
| **FS-142.3** | Cliente de API y tipos para el filtro | Frontend | FS-142.2 |
| **FS-142.4** | Selector de filtro en la lista | Frontend | FS-142.3, EXT-3 |
| **FS-142.5** | Aviso de estado inexistente y mensaje de filtro sin tareas | Frontend | FS-142.4 |
| **FS-142.6** | La vista filtrada se mantiene coherente tras los cambios propios | Frontend | FS-142.4, EXT-4 |
| **FS-142.7** | Verificación de aceptación de FS-142 | Test | FS-142.5, FS-142.6 |

FS-142.5 y FS-142.6 se pueden hacer en paralelo. **FS-118.8 depende de FS-142.4** (ver [tickets de FS-118](tickets-FS-118.md)).

## Fichas

### FS-142.1: Regla de dominio: qué tareas entran en cada filtro
- **Tipo:** Modelo/Dominio
- **Capa:** dominio
- **Hereda:** CA-1, CA-2, CA-3, CA-4, CA-5, CA-7 (reconocer que un estado no es válido) y CA-16 (el conjunto de filtros es cerrado)
- **Bloqueado por:** EXT-1, EXT-2
- **DoD propia:**
  - [ ] Hay un test por cada filtro, con datos de partida que incluyen una tarea de cada estado.
  - [ ] Hay un test con un filtro que no existe.
- ⚠️ Si PA-6 reduce el número de filtros, este ticket se ajusta **antes** de empezarlo.

### FS-142.2: La lista de tareas acepta un filtro por estado y rechaza los que no existen
- **Tipo:** Endpoint/API
- **Capa:** validador y controlador de la lista
- **Hereda:** CA-1, CA-2, CA-3, CA-4, CA-5, CA-7, CA-13, CA-15 y CA-16
- **Bloqueado por:** FS-142.1, EXT-3
- **DoD propia:**
  - [ ] Hay un test de que sin filtro se aplica el filtro por defecto.
  - [ ] Hay un test por cada filtro válido.
  - [ ] Hay un test de que un estado que no existe da un error de validación, **no** una lista vacía.
  - [ ] Hay un test de que el orden no cambia al filtrar.

### FS-142.3: Cliente de API y tipos para el filtro
- **Tipo:** Frontend
- **Capa:** `src/lib/api.ts` y `src/lib/types.ts`
- **Hereda:** CA-7, en la parte de convertir el error del backend en un aviso en castellano
- **Bloqueado por:** FS-142.2
- **DoD propia:**
  - [ ] `lib/api.ts` traduce el error de estado inexistente a un mensaje en castellano.

### FS-142.4: Selector de filtro en la lista
- **Tipo:** Frontend
- **Capa:** la interfaz de la lista
- **Hereda:** CA-1, CA-2, CA-3, CA-4, CA-5, CA-6, CA-12, CA-14, CA-16, CA-17 y CA-18
- **Bloqueado por:** FS-142.3, EXT-3
- **DoD propia:**
  - [ ] Se ha probado cambiar de filtro usando solo el teclado.
  - [ ] Se ha comprobado que el filtro activo se ve sin depender del color.
- ⚠️ CA-12 (el filtro se mantiene al recargar) está **[PROPUESTO]**. Si se rechaza, deja de ser un criterio que este ticket hereda.

### FS-142.5: Aviso de estado inexistente y mensaje de filtro sin tareas
- **Tipo:** Frontend
- **Capa:** la interfaz de la lista
- **Hereda:** CA-7, CA-8 y CA-9
- **Bloqueado por:** FS-142.4
- **DoD propia:**
  - [ ] Se ha comprobado a mano que el aviso de estado inexistente y el de «no hay tareas» se distinguen con claridad.
- ⚠️ **Hay que decidir antes de empezar:**
  - CA-8: tras el aviso, ¿se muestra la lista de estados válidos o se vuelve a *Pendientes*?
  - La nota de CA-7: ¿por qué vía puede llegar a la pantalla un estado que no existe? Si no hay ninguna, CA-7 solo se puede verificar contra la API (FS-142.2).

### FS-142.6: La vista filtrada se mantiene coherente tras los cambios propios
- **Tipo:** Frontend
- **Capa:** la interfaz de la lista
- **Hereda:** CA-10 y CA-11
- **Bloqueado por:** FS-142.4, EXT-4
- **DoD propia:**
  - [ ] Se ha comprobado a mano, con el filtro *Libre*, que al tomar una tarea sale de la vista y aparece confirmación.
  - [ ] Se ha comprobado a mano, con el filtro *En curso*, que al crear una tarea aparece confirmación y un aviso de que el filtro la oculta.

### FS-142.7: Verificación de aceptación de FS-142
- **Tipo:** Test
- **Capa:** toda la historia, de principio a fin
- **Hereda:** CA-1 a CA-18
- **Bloqueado por:** FS-142.5, FS-142.6
- **DoD propia:**
  - [ ] CA-13 y CA-14 se han probado con dos sesiones a la vez.
  - [ ] CA-7 se ha probado por la vía de entrada que se decida, o contra la API si no hay vía desde la interfaz.

## Qué bloquea antes de construir

1. **Hay criterios [PROPUESTO] sin revisar:** CA-6, CA-8, CA-9, CA-10, CA-11, CA-12, CA-14, CA-15 y CA-18. Si se rechazan CA-10 y CA-11, **FS-142.6 desaparece entero**.
2. **PA-6** puede reducir los filtros. Afecta a FS-142.1, FS-142.2 y FS-142.4.
3. **CA-7 no tiene decidido por dónde llega a la interfaz.** El requisito queda cubierto en el backend (FS-142.2), pero en la pantalla no se puede verificar hasta que se decida la vía de entrada.
4. **Filtrar en el servidor es una decisión tomada al descomponer la historia.** Que la API acepte y valide el filtro es la forma más directa de cumplir CA-7 («avisar del error, no devolver una lista vacía en silencio»). Si al implementar se decide filtrar solo en el cliente, FS-142.2 se reduce a validar la vía de entrada, y la regla de FS-142.1 pasa al frontend, que no tiene runner de tests.
