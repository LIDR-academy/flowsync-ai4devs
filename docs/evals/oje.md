# Medición de una regla de proceso

**Autoría:** Odalys Jordan Enriquez · **Fecha:** 20 de septiembre de 2026
**Proyecto medido:** FlowSync (este repositorio) · **Rama de partida de cada intento:** `s8/start`

## Qué se mide y por qué

Se mide, sobre el proyecto del curso, si una regla que lleva meses escrita en el archivo de
instrucciones del agente **se cumple de verdad**.

> **La pregunta:** ¿en qué proporción de los intentos se cumple la parte del README, pidiéndole al
> agente el mismo encargo varias veces?

**Intentos completados: 4** de los 5 previstos.

---

## Parte A · La medición

### La regla medida

Está en `CLAUDE.md`, en su sección de reglas de proceso, y dice literalmente esto:

> *«Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra
> en el mismo commit con el documento OpenAPI y el README de esa capability al día.»*

De la regla se mide **solo la parte del README**. El documento OpenAPI queda fuera de esta medición.

### El encargo

El mismo texto en cada intento, en una sesión nueva y **sin recordarle la regla** al agente:

> **«Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y
> devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a
> las demás de `tasks`.»**

### Las dos casillas de cada intento

| | Pregunta | Qué significa |
|---|---|---|
| **P1 · control** | ¿Quedó declarada la ruta `DELETE`? | Si no, el agente no hizo el trabajo y el intento no cuenta: P2 no significaría nada. |
| **P2 · resultado** | ¿Menciona `docs/capabilities/tasks/README.md` el endpoint nuevo? | Es la regla que se está midiendo. |

### Resultados

| Intento | P1 · ¿ruta `DELETE` declarada? | P2 · ¿README de la capability al día? | ¿Cuenta el intento? |
|:---:|:---:|:---:|:---:|
| 1 | ✅ Sí | ✅ Sí | Sí |
| 2 | ✅ Sí | ✅ Sí | Sí |
| 3 | ✅ Sí | ✅ Sí | Sí |
| 4 | ✅ Sí | ✅ Sí | Sí |
| **Total** | **4/4 · 100 %** | **4/4 · 100 %** | **4 intentos válidos** |

Los cuatro intentos pasaron el control, así que los cuatro cuentan: **la regla se cumplió en el
100 % de los intentos medidos (4 de 4)**.

### Cómo se comprobó

A mano, sobre la rama que dejó cada intento — el agente crea una rama `feat/…` propia cada vez, así
que el nombre cambia de un intento a otro:

```bash
git show feat/tasks-delete -- backend/start/routes.ts            | grep delete
git show feat/tasks-delete -- docs/capabilities/tasks/README.md  | grep DELETE
```

Entre intento e intento el proyecto se devolvió a su estado de partida, para que los cuatro midieran
lo mismo:

```bash
git checkout -f s8/start            # vuelve a la rama de partida, descartando cambios
git reset --hard upstream/s8/start  # deshace lo que el agente haya commiteado
git clean -fd                       # borra los archivos nuevos que dejó
```

---

## Parte B · Las tres líneas

### 1. La apuesta y el resultado

| | |
|---|---|
| **Mi apuesta** | 80 % |
| **Resultado** | **100 %** |
| **Ejecuciones completadas** | 4 (de 5 previstas) |

La regla se cumplió más de lo que esperaba: acerté la dirección, no la magnitud.

### 2. Qué haría con ese número

**Convertirla en algo que se ejecute solo.**

Esta regla en particular debería ser algo que se ejecute solo porque es, en esencia, lo que garantiza
que la documentación del backend se actualice de acuerdo con los cambios que se van implementando, y
que todo viaje junto en el mismo commit como una sola unidad de trabajo completada.

### 3. Una cosa que esta medición no está midiendo

**Si la implementación está completa.** Las dos casillas comprueban que la ruta existe y que el
README la menciona, y nada más. No se comprueba si se crearon los tests, ni si se actualizó la spec
viva, en este caso `openspec/specs/tasks/spec.md`, que es la fuente de verdad del proyecto y **no tiene ningún requisito de borrado**.

En otras palabras: un intento puede marcar las dos casillas en verde y aun así dejar el endpoint sin una sola prueba y la spec contando una historia que ya no es del todo cierta.
