# Evaluación de la regla de documentación

## Parte A - la medición

### Regla a medir

"Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día."

### Encargo

Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.

### Apuesta inicial

Esperaba que el README se actualizara en 4 de 5 ejecuciones.

### Resultados

| Ejecución | Agrega endpoint | tasks/README.md 
|---|---|---|
| 1 | si | si |
| 2 | si | si |
| 3 | si | si |
| 4 | si | si| 
| 5 | si | si |

Resultado: 5 ejecuciones actualizaron el README.



## Parte B - las tres líneas

1. Apuesta y resultado: aposté 4 y obtuve 5.

2. Decisión: 
- No realicé medición de linea base, por lo tanto no pude comprobar si el modelo cumple la regla por sí mismo o si realmente la cumple por estar escrita en el claude.md. Por esta razón descarto borrarla.

- El readme no es tan importante, de hecho pierde frente a la spec. A priori no parece una regla crítica. Por lo que se podría dejar como instrucción en el claude.md.

- La regla también habla de modificar el openapi. Este archivo no es utilizado por el frontend. No tenemos información si es usado fuera de este proyecto. Si el openapi tuviera mayor importancia, tal vez se podría reecribir la regla dejando soalmente la parte del readme y validar la modificación del openapi en CI.

3. Lo que no mide este experimento: Si la regla se cumple por que el agente lee la configuración o si ya lo hace por sí mismo. Para saber esto habría que medir la línea base.
