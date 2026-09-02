# Calibración de la revisión adversarial

> Qué se considera grave, cuántas sugerencias menores caben, y por qué esta revisión **no bloquea**.
>
> Un guardarraíl no muere fallando. Muere acertando sobre cosas que a nadie le importaban, hasta que nadie lo lee. Este fichero existe para retrasar ese momento.

## Por qué no bloquea

Las comprobaciones deterministas de `verificacion.yml` -tipos, lint, 71 pruebas, los trece contrastes del verificador- **sí bloquean**, porque su respuesta no depende del día: o el contrato coincide con el código o no.

Esta no. Es un modelo leyendo un diff, y se equivoca. Un revisor no determinista que tumba la build se desactiva la primera vez que se equivoca con prisa, y entonces no queda ni revisor ni build.

Así que el reparto es: **lo determinista bloquea, el revisor informa.** Lo que decide si el revisor sirve no es su veredicto, es cuántos de sus hallazgos acaban en un cambio de código.

## Qué se considera grave

Solo estas cinco categorías. Un hallazgo que no encaje en ninguna es menor, por convincente que suene.

| Categoría | Qué cuenta |
|---|---|
| **Fuga de información** | Una respuesta, un log accesible o una URL que revele traza, SQL, rutas del disco, credenciales o datos de otra cuenta |
| **Autorización** | Una ruta que responda sin la sesión que exige, o que devuelva algo de una cuenta que no es la de quien pregunta |
| **Pérdida o corrupción de datos** | Una escritura que pise datos ajenos, una migración sin vuelta atrás que no lo declare, un borrado sin dueño claro |
| **Contrato roto en silencio** | La API devuelve algo que el contrato no documenta, o deja de devolver algo que sí. Con `200`, que es lo que lo hace silencioso |
| **Comprobación que no comprueba** | Una prueba o un contraste que pasa con el defecto puesto. Es R-14, y es la que más caro sale porque produce confianza falsa |

Fuera de esas cinco, **nada es grave**. En particular no lo son: estilo, nombres, comentarios, preferencias de estructura, «esto podría extraerse a una función», ni rendimiento sin un número que lo respalde.

## Cuántas sugerencias menores caben

**Tres por revisión, como máximo.** Las tres mejores, no las tres primeras.

Si hay más de tres, el revisor elige y dice cuántas descartó. Un informe de quince puntos menores no es más exhaustivo: es un informe que nadie va a leer entero, y el efecto real de publicarlo es que la próxima revisión tampoco se lea.

Sin hallazgos graves y sin nada menor que llegue al umbral, el informe correcto es **una línea diciendo que no hay nada**. Un revisor que nunca dice «no encontré nada» está inventando trabajo.

## Formato del informe

```markdown
### Graves
(o «Ninguno»)

**[Categoría]** · fichero:línea
Qué falla, y el caso concreto que lo provoca: entrada o estado -> resultado.

### Menores (máximo 3)
(o «Ninguno», y si se descartaron algunos, cuántos)

- fichero:línea · una frase
```

Sin preámbulo, sin resumen final, sin felicitaciones por el cambio.

## Qué se pide de cada hallazgo

**Un caso que lo provoque.** No «esto podría fallar si el usuario manda algo raro», sino qué hay que mandar y qué devuelve. Un hallazgo sin caso concreto es una sospecha, y las sospechas van en menores o no van.

**Contraste contra la spec, no contra el gusto.** El adversario no decide qué es un bug: lo decide `openspec/specs/`, `docs/api/openapi.yaml` y `CLAUDE.md`. Un comportamiento que ningún documento exige y ninguno prohíbe es un hueco de la spec, y eso se dice como tal.

## Presupuesto

Una ejecución por cambio propuesto, no por commit. `concurrency` cancela la revisión anterior cuando llega un push nuevo, y en `push` el job sale antes de gastar nada si la rama no tiene PR abierto.

`--max-turns 40` es el tope duro. Si una revisión lo agota, el problema es el tamaño del diff, no el tope.

## Cómo se mide si esto sirve

Una sola métrica: **cuántos hallazgos acaban en un cambio de código.**

No cuántos produce. Un revisor que devuelve veinte cosas ciertas y ninguna accionable ha fallado, aunque las veinte sean verdad.

De referencia, las cinco revisiones manuales del Módulo 4: las cinco encontraron algo real y las cinco terminaron en código. Ese es el listón que la versión automática tiene que sostener, y si baja, lo que hay que revisar es esta calibración, no el modelo.

## Estado: parcialmente verificado

**Esta comprobación todavía no cuenta** (R-14). El revisor no se ha ejecutado ni una vez.

### Lo que sí se ha visto funcionar

Primera ejecución, `2026-09-02`, [run 33669154850](https://github.com/rene2bcore/flowsync-ai4devs/actions/runs/33669154850), disparada por el push del propio commit que añade el workflow:

- El disparador `push` **dispara**, y el job arranca.
- La puerta detecta la ausencia de clave -`TIENE_CLAVE: false`- y **omite la revisión sin fallar**: verde en 7 segundos, con su línea en el resumen.

Eso verifica la decisión que más me preocupaba del diseño: que un secreto ausente no deje el job en rojo. Un rojo por falta de configuración enseña a ignorar el rojo.

### Lo que no se ha visto

Todo lo demás, y es la mayor parte:

| Qué | Por qué no |
|---|---|
| La detección del PR abierto en el repositorio del curso | La puerta sale antes, por falta de clave |
| La invocación de `claude -p` con sus flags | Nunca se ha ejecutado. Los flags están escritos con cuidado y el YAML valida, pero la primera ejecución real puede pedir ajustes |
| La extracción del prompt desde `.claude/agents/` | Probada en local, no en el runner |
| La publicación del informe, y su caída al resumen cuando el PR vive en otro repositorio | Nunca se ha llegado ahí |
| **Que el revisor encuentre algo** | Lo importante, y lo que falta entero |

### Qué falta, en orden

1. **El secreto `ANTHROPIC_API_KEY`** en Settings → Secrets and variables → Actions. Sin eso no hay nada más que verificar.
2. **Verla morder.** Una rama con un defecto plantado de una de las cinco categorías graves -por ejemplo, quitar la tercera condición de `isOverdueOn`, que es H-15- y comprobar que el informe lo nombra. Si no lo nombra, el problema está en el prompt o en esta calibración, y hay que arreglarlo **antes** de fiarse de un verde.

Hasta entonces, `R-03` sigue siendo una petición con un job al lado.
