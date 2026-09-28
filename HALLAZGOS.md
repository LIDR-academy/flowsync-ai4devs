# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Saltó la línea de registro que indica que se bloqueó un correo en `docs/capabilities/tasks/README.md`.

```text
# Registro de bloqueos del hook datos-que-no-salen
- 2026-09-28T00:04:13Z BLOQUEADO correo docs/capabilities/tasks/README.md
-
```

## 2. Lo que el hook no puede cazar

Solo ha saltado el correo, la contraseña secreto123 habría entrado sin problema. Aparentemente ninguna de las tres reglas busca contraseñas: no tienen una forma reconocible, y el mismo agente nos alerta de que el valor prohibido ya aparece en los tests y en el ejemplo con Ada. 
-

## 3. Tu duda

Si es posible que se pueda reintentar con datos hasheados o enmascarados para que el commit pase.
-
