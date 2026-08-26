## Context

Ver `proposal.md` para la motivación. Lo que condiciona el diseño es qué hay montado y qué falta.

**Lo que ya está**: `backend/tests/bootstrap.ts` trae enganchados `assert`, `apiClient` con el registro tipado de Tuyau, `dbAssertions`, `authApiClient` y `sessionApiClient`. Y `adonisrc.ts` declara dos suites, `unit` con 2 s de tiempo límite y `functional` con 30 s. El arnés está hecho; faltan los casos.

**Lo que falta y duele**: la conexión de base de datos tiene la ruta escrita a fuego y ningún override por entorno. `.env.test` solo cambia el driver de sesión.

**Lo que no hay en el frontend**: nada. Ni runner, ni script `test`, ni una sola prueba.

**La fuente de los casos** son las dos specs vivas: `openspec/specs/auth/spec.md` con 18 requisitos y 33 escenarios, y `openspec/specs/tasks/spec.md` con 16 y 29. En total 62 escenarios. Los casos se derivan de ahí; no se inventan.

## Goals / Non-Goals

**Goals**

- Que ejecutar la suite **nunca** toque el fichero de desarrollo, y que eso sea imposible por construcción, no por disciplina.
- Que cada caso escrito diga a qué escenario de qué spec corresponde, para que la trazabilidad sobreviva a quien lo escribió.
- Que el primer trabajo que necesite pruebas pague el coste completo, y ninguno posterior vuelva a pagarlo.

**Non-Goals**

- Cubrir los 62 escenarios. Ver D3.
- Perseguir un porcentaje de cobertura. La métrica es qué escenarios de la spec están cubiertos, no qué líneas se ejecutan.
- Probar componentes de interfaz. Ver D4.

## Decisions

### D1 · Fichero de base de datos separado por entorno

Se resuelve el punto abierto: **fichero separado**, no hooks de truncado.

La conexión pasa a elegir el fichero según el entorno, de modo que en `test` apunta a uno propio.

**Alternativa descartada:** hooks de `testUtils.db().truncate()` o `withGlobalTransaction()` sin tocar la configuración. Es lo que sugiere el `CLAUDE.md` del proyecto y funciona, pero deja el aislamiento **dependiendo de que cada fichero de prueba recuerde ponerlo**. Un test nuevo que olvide el hook borra los datos de desarrollo, y el fallo aparece en el peor momento.

El coste de la alternativa elegida es tocar `config/database.ts`, que es fichero del repo del curso. Se asume: convertir una disciplina en una imposibilidad vale ese precio.

**Los hooks se usan igualmente**, pero para lo que sirven bien: dejar limpio entre casos dentro de la misma ejecución. Lo que cambia es que ya no son la única línea de defensa.

### D2 · El fichero de test se crea y se destruye en cada ejecución

La suite migra desde cero al arrancar y no conserva estado entre ejecuciones.

**Alternativa descartada:** reutilizar el fichero de test entre ejecuciones por velocidad. Con este tamaño la diferencia es de milisegundos, y a cambio se gana que un test nunca dependa de lo que dejó el anterior.

### D3 · Se cubren los escenarios que protegen una regla, no los 62

Cubrir todo de golpe hace un cambio enorme y de revisión imposible. Se priorizan por lo que se rompe en silencio si nadie los mira:

| Prioridad | Qué | Por qué |
|---|---|---|
| Alta | Las reglas de dominio de `tasks` | Es el código recién escrito y sin ninguna prueba |
| Alta | Los bordes de validación de ambas capabilities | Un cambio de dependencia los rompe sin avisar, que es exactamente **H-05** |
| Alta | Que un fallo de acceso no revele si la cuenta existe | Propiedad de seguridad que se pierde con un refactor descuidado |
| Media | El ciclo de vida de la sesión | Ya verificado a mano, y estable |
| Fuera | Lo que solo se observa en pantalla | No hay runner de navegador |

Lo que quede sin cubrir **se declara en `tasks.md`**, no se omite en silencio.

### D4 · En el frontend solo se prueba `lib/api.ts`

Es donde vive la lógica: desenvolver la respuesta, traducir errores y desglosarlos por campo. Todo lo demás son componentes, y probarlos exige montar el árbol de React y una librería más.

Además ataca **H-05** directamente: la traducción compara cadenas exactas contra los mensajes de las dependencias, y hoy nada detecta que una actualización las cambie.

**Alternativa descartada:** añadir Testing Library y probar componentes. Es una segunda dependencia y un cambio mucho mayor, para cubrir lo que la verificación manual ya cubre razonablemente hoy.

### D5 · Vitest como runner del frontend

Se resuelve el punto abierto. Comparte configuración y transformación con Vite, que el proyecto ya usa, así que no introduce una segunda cadena de compilación.

**Alternativa descartada:** Jest. Exigiría su propia transformación de TypeScript y su propia resolución del alias `@/*`, duplicando lo que Vite ya resuelve.

**Es la única dependencia nueva del cambio, y requiere aprobación humana explícita antes del apply.** El cambio anterior prohibió añadir dependencias; aquí la excepción es el objeto mismo del trabajo, y por eso se declara en vez de colarse.

### D6 · Cada caso nombra el escenario que verifica

El nombre de cada prueba referencia el requisito de la spec del que sale.

Sin eso, dentro de seis meses nadie sabrá si un test que falla protege una regla de negocio o una decisión de implementación, y la respuesta a esa pregunta decide si se arregla el código o se cambia la prueba.

## Risks / Trade-offs

**Tocar `config/database.ts` aleja el repo del original del curso (D1)** → El cambio es pequeño y está declarado aquí. La alternativa dejaba el aislamiento a merced de que nadie olvidara un hook.

**Cubrir solo una parte puede dar falsa sensación de seguridad (D3)** → Por eso lo no cubierto se declara explícitamente en `tasks.md`. Una lista de huecos conocidos es más honesta que un porcentaje.

**Las pruebas de traducción de errores dependen de los mensajes literales de las dependencias (D4, H-05)** → Es justo el punto: hoy ese acoplamiento existe y **nada lo vigila**. Con la prueba, una actualización que cambie la redacción rompe la suite en vez de dejar al usuario viendo inglés. La prueba no arregla el diseño frágil, pero convierte un fallo silencioso en uno ruidoso.

**Este cambio no corrige ningún defecto que las pruebas destapen** → Si aparece uno, se anota en `docs/hallazgos.md` y se arregla en su propio cambio. Mezclar el montaje del arnés con arreglos de producto haría imposible revisar ninguna de las dos cosas.

## Migration Plan

No hay migración de datos. El fichero de base de datos de test se crea al ejecutar la suite y no existe fuera de ella; conviene que quede ignorado por git como el de desarrollo.

Reversión: quitar la dependencia, los ficheros de prueba y el cambio de configuración devuelve el repositorio a su estado actual. Nada de producto depende de esto.

## Open Questions

Ninguna. Los tres puntos abiertos del proposal quedan resueltos en D1, D5 y D3.
