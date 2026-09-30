# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

- La regla 2 bloqueó un correo fuera de los dominios permitidos; el registro dejó: `- 2026-09-30T05:16:28Z BLOQUEADO regla 2 (correo fuera de los dominios permitidos) docs/capabilities/tasks/README.md`.

## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

- El hook no puede detectar una contraseña arbitraria, porque la regla 1 solo busca patrones reconocibles de claves o secretos y líneas APP_KEY= con valor.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- No pude comprobar de forma independiente desde la terminal el código de salida 2 de la primera prueba real; el bloqueo fue observado por Claude Code y quedó registrado en registro-de-bloqueos.md.
