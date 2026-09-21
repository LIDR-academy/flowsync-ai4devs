# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Opus 5 (1M context) with high effort
**Herramienta:** Claude Code v2.1.278

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

**Qué salió:** Funcionó como se esperaba a la primera. DELETE /api/v1/tasks/:id implementado y commiteado en feat/tasks-delete. Comprobé que los ficheros de rutas y Readme se actualizaron como corresponde de acuerdo a los cambios realizados. Noté que no se implementaron pruebas para el nuevo endpoint.

## Prompt 2

**Modelo:** Opus 5 (1M context) with high effort
**Herramienta:** Claude Code v2.1.278

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks. 
```

**Qué salió:** Funcionó nuevamente como se esperaba. DELETE /api/v1/tasks/:id implementado y commiteado en feat/tasks-delete-endpoint. Los ficheros de rutas y Readme se actualizaron correctamente de acuerdo a los cambios realizados. Esta vez implementó el test funcional con 3 escenarios, dejó el fichero en el repo y lo incluyó en el commit.


## Prompt 3

**Modelo:** Opus 5 (1M context) with high effort
**Herramienta:** Claude Code v2.1.278

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks. 
```

**Qué salió:** Funcionó como se esperaba otra vez. DELETE /api/v1/tasks/:id implementado y commiteado en la rama feat/delete-task. Los ficheros de rutas y Readme fueron actualizados correctamente de acuerdo a los cambios realizados. El agente indicó que creo un test funcional temporal para verificar lo implementado que fue borrado y no quedó en el repo.

## Prompt 4

**Modelo:** Opus 5 (1M context) with high effort
**Herramienta:** Claude Code v2.1.278

```
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks. 
```

**Qué salió:** Funcionó como se esperaba. DELETE /api/v1/tasks/:id listo en la rama feat/borrar-tarea. Los ficheros de rutas y Readme fueron actualizados de acuerdo a los cambios realizados. En este intento el agente sí dejó tests, con 4 escenarios, dentro del commit.


## Promt 5

**Modelo:** Opus 5 (1M context) with high effort
**Herramienta:** Claude Code v2.1.278

```
-------- Entrega de la tarea
  Crea el archivo docs/evals/oje.md y agrega la información que se especifica a continuación. Estos son los resultados de la tarea “medición de una regla de proceso”.
  Formatea el documento adecuadamente para que pueda ser revisado con claridad.
  Tarea: medición de una regla de proceso
  Goal: Se va a medir, sobre el proyecto del curso, si una regla que lleva meses escrita en el archivo de instrucciones del agente se cumple de verdad.
  La pregunta a responder: en qué proporción de los intentos se cumple la parte del README, pidiéndole al agente el mismo encargo varias veces.
  Número de intentos completados: 4

  Parte A · la medición. La regla que vas a medir está en el archivo CLAUDE.md del proyecto, en su sección de reglas de proceso, y dice literalmente esto:
  "Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día."
  Encargo
  "Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks."

  Resultados
  Intento # 1
  P1 - control: ¿quedó declarada la ruta DELETE?   Sí
  P2 - resultado: ¿menciona docs/capabilities/tasks/README.md el endpoint nuevo? Sí
  Intento # 2
  P1 - control: ¿quedó declarada la ruta DELETE?   Sí
  P2 - resultado: ¿menciona docs/capabilities/tasks/README.md el endpoint nuevo? Sí
  Intento # 3
  P1 - control: ¿quedó declarada la ruta DELETE?   Sí
  P2 - resultado: ¿menciona docs/capabilities/tasks/README.md el endpoint nuevo? Sí
  Intento # 4
  P1 - control: ¿quedó declarada la ruta DELETE?   Sí
  P2 - resultado: ¿menciona docs/capabilities/tasks/README.md el endpoint nuevo? Sí

  Comprobado con:
  git show feat/tasks-delete -- backend/start/routes.ts | grep delete
  git show feat/tasks-delete -- docs/capabilities/tasks/README.md | grep DELETE

  Parte B · las tres líneas.
  Tu apuesta y el resultado. Si no llegaste a las cinco ejecuciones, di cuántas hiciste.
  Mi apuesta: 80%
  Resultado: 100%
  Número de ejecuciones completadas: 4
  Qué harías con ese número: borrar la regla, reescribirla, o convertirla en algo que se ejecute solo. Y por qué.
  Esta regla en particular debería ser algo que se ejecute solo porque es en esencia lo que garantiza que la documentación del backend se actualice de acuerdo a los cambios que se van implementando, y que todo viaje junto en el mismo commit como una sola unidad de trabajo completada.
  Una cosa que tu medición no está midiendo. Siempre hay una, y detectarla vale más que el propio número.
  No se está comprobando si la implementación está completa: si se crearon los tests, si se actualizó la spec viva, en este caso en openspec/specs/tasks/spec.md, que es la fuente de verdad del proyecto y no tiene ningún requisito de borrado.
  ```


## Promt 6

**Modelo:** Opus 5 (1M context) with high effort
**Herramienta:** Claude Code v2.1.278

```
Crea un commit y prepara un PR desde este fork, con solo dos ficheros:
- El archivo docs/evals/oje.md
- El archivo prompts.md en la raíz del proyecto.

Incluye una breve descripción de los cambios en el cuerpo del PR.
```