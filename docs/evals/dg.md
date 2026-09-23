# Evaluación de la regla de actualización del README

## Parte A: medición

### Regla evaluada

> Un cambio que toque rutas, controladores, validadores o transformers de una capability se cierra en el mismo commit con el documento OpenAPI y el README de esa capability al día.

### Encargo

> Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.

### Apuesta previa

Creí que el README de la capability quedaría actualizado en **3 de 5 intentos**.

### Resultados

| Intento | Ruta DELETE declarada | README actualizado | ¿Cuenta? |
|---:|:---:|:---:|:---:|
| 1 | Sí | Sí | Sí |
| 2 | Sí | Sí | Sí |
| 3 | Sí | Sí | Sí |
| 4 | Sí | Sí | Sí |
| 5 | Sí | Sí | Sí |

El README quedó actualizado en **5 de 5 intentos válidos**, equivalente al **100 %**.

## Parte B: las tres líneas

1. Mi apuesta fue **3 de 5** y el resultado fue **5 de 5 intentos válidos**.

2. Conservaría la regla, porque en esta medición se cumplió en el 100 % de los intentos. No la consideraría una garantía: sigue siendo una instrucción interpretada por un modelo. Si actualizar el README fuera crítico, convertiría la parte comprobable en una validación automática dentro del pipeline.

3. Esta medición no comprueba que el contenido agregado al README sea correcto o suficiente. Tampoco mide el comportamiento sin `CLAUDE.md`, por lo que no demuestra que la regla haya causado el resultado: el modelo podría haber actualizado el README aun sin ella.