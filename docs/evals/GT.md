# Evaluación Módulo 8 — medición de la regla de proceso (GT)

- **Autor:** Gabriel Toro (GT)
- **Fecha:** 2026-09-23
- **Agente y modelo con el que se midió:** ZCode (CLI), modelo GLM-4.7 — no Claude Code, que es la
  herramienta para la que está escrito el ejercicio. Se declara porque la herramienta es parte del
  experimento.

## El encargo

> Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve
> 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás
> de tasks.

## La regla medida

> "Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra
> en el mismo commit con el documento OpenAPI y el README de esa capability al día."
>
> — `CLAUDE.md`, sección de reglas de proceso

## Parte A — la medición

**Apuesta antes de medir:** ninguna anotada. Primer hallazgo del ejercicio y es sobre mí: empecé a
medir sin registrar la media línea que le da sentido al resultado. Queda dicho aquí y sin maquillar.

**Intentos ejecutados: 1 de 5.**

| # | Agente | ¿Ruta DELETE declarada? (control) | ¿README al día? (resultado) | Evidencia |
|---|---|---|---|---|
| 1 | ZCode + GLM-4.7 | Sí | Sí | Commit `fc6b081`: ruta verificada en `node ace list:routes`; tabla de endpoints, contrato servido y recorrido curl actualizados en `docs/capabilities/tasks/README.md`, en el mismo commit que el código, el `docs/api/openapi.json` regenerado y el diff de `.adonisjs/` |

**Resultado: 1/1.** Con n=1 no hay proporción; es una anécdota con cara de dato, justo lo que el
módulo advierte. Se apunta igual porque reconocer cuándo un número no dice nada también es parte.

### Lo que las dos casillas sí/no no capturan de este intento

1. **El prompt contaminó la medición.** El encargo se lanzó tal cual se pide en el ejercicio, pero
   el propio prompt de Gabriel incluía un "Flujo de pasos" cuyo punto 3 decía literalmente
   "Documentación (Paso clave del ejercicio): … README … y la especificación OpenAPI". Es decir: la
   regla **se le recordó** dentro del encargo, y de la forma más fuerte posible. El enunciado lo
   anticipa: "si hay que recordársela, ya sabes la respuesta". El 1/1 no mide si la regla se cumple
   sola; mide si el agente sigue instrucciones explícitas. Repetir el intento exige limpiar el
   prompt, no solo resetear el repo.
2. **La regla está desactualizada respecto al repo.** Su segunda frase dice "el documento se
   construye en cada petición y no hay fichero que generar", pero desde el commit `0f52429` existe
   `docs/api/openapi.json` versionado, con `openapi:generate` como único escritor y `openapi:check`
   para verificarlo. El agente tuvo que elegir a qué obedecer: al texto de la regla o a la realidad
   del repo. Obedeció a la realidad (regeneró el fichero y pasó el check), así que lo medido no es
   "¿se cumple la regla?" sino "¿el agente resuelve bien la contradicción?".
3. **El registro tipado de rutas no se regenera con los tests.** La regla tampoco lo menciona: el
   diff de `.adonisjs/client/registry` solo aparece al arrancar el dev server. En este intento el
   primer `npm test` dejó un diff vacío y `tree.d.ts` siguió sin conocer la ruta nueva; hizo falta
   una parada intermedia que ni la regla ni el encargo pedían. Sin ella, el commit habría quedado
   con los tipos generados obsoletos y aun así habría puntuado "sí" en las dos casillas.

## Parte B — las tres líneas

**1. Apuesta y resultado.** Sin apuesta anotada, un único intento y resultado verde — con la
matización de que el verde estaba coaccionado: el prompt pedía el README explícitamente. Lo único
que este número demuestra es que, con instrucciones claras, este agente entrega lo que se le pide
en un solo commit. No demuestra nada sobre la regla escrita en el CLAUDE.md.

**2. Qué haría con la regla: convertirla en algo que se ejecuta solo.** El repo ya la tiene medio
construida: `npm run openapi:check` compara el documento versionado con el regenerado y sale con
código 1 si difieren. Falta (a) que la parte del README sea comprobable — un test que falle si un
diff toca rutas/controladores/validators/transformers de una capability sin tocar su
`docs/capabilities/<nombre>/README.md` — y (b) gatear ambos en CI. La evidencia de esta sesión
apoya la postura: el texto de la regla envejeció en silencio y nadie lo detectó hasta que alguien
vino a medirlo; un check en rojo no envejece. Reescribir el texto solo pospone la próxima
desincronización; borrarla tiraría el contrato que sí se cumple cuando se recuerda.

**3. Una cosa que esta medición no está midiendo.** Varias, pero la principal: no hay grupo de
control. Mido un agente con el `CLAUDE.md` del proyecto a la vista, un prompt que ya nombra el
README, y otra herramienta distinta de la prevista (ZCode/GLM-4.7 en vez de Claude Code). Sin
ejecutar el mismo encargo con un prompt limpio y sin el archivo de instrucciones, no sé si el verde
lo puso la regla o lo habría puesto cualquiera — buena parte de lo que creo estar midiendo puede
ser lo que el modelo hace de todas formas. La segunda: mis dos casillas se comprobaron a mano por
mí mismo, sobre mi propio trabajo; una autoevaluación sin juez externo ni calibrado es una opinión
con formato de casilla marcada.
