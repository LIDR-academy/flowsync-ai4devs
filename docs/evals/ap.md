# Ejercicio FlowSync: mide una regla que creías cumplida

## Parte A: la medición

**Regla medida** (`CLAUDE.md`, reglas de proceso):

> Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.

**Prompt**, lanzado tal cual en cinco sesiones nuevas desde `s8/start` limpio.

> Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.   

**¿Cuántas veces de cinco crees que el README de la capability va a quedar al día?, anotada antes de medir:** 4/5.


| Intento | Agrega endpoint | Actualiza capabilities/tasks/README.md 
|---|---|---|
| 1 | ✅ | ✅ |
| 2 | ✅ | ✅ |
| 3 | ✅ | ✅ |
| 4 | ✅ | ✅ | 
| 5 | ✅ | ✅ |

**Resultado: 5/5.** Los cinco intentos agregaron el endpoint y actualizaron la documentación correspondiente.

## Parte B: las tres líneas

1. **Tu apuesta y el resultado:** Puse que el REAMDE quedaba al día 4 de las 5 veces. Al ejecutar el proceso 5 veces, encontré que el README quedó actualizado 5 de las 5 veces (100%).
2. **Qué harías con ese número:** Dado que se logró comprobar un 100% de efectividad, optaría por convertirlo en un hook, de manera que no consuma tokens al arrancar el proyecto en CLAUDE.md.
3. **Una cosa que tu medición no está midiendo:** Comprobar si la regla se cumple por comportamiento propio del agente o porque consta dentro de CLAUDE.md. Es decir, quitar esa instrucción del archivo de configuración y correr nuevamente las pruebas y ver qué sucede.
