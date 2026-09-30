# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

-  Saltó la regla 2 (correo) al commitear el curl de la parte C; el registro dejó: `2026-09-30T16:46:18Z BLOQUEADO regla 2 (correo) docs/capabilities/tasks/README.md`, sin el correo dentro.

## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

- La contraseña de la cuenta de pruebas del curl entró commiteada en el README: el hook solo reconoce claves con forma (prefijos como AKIA o sk-ant-), y una contraseña corta y sin prefijo es texto normal.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- No pude comprobar qué datos leyó el agente en el inventario: pedí «no mostrar» y no «no leer», y solo sé que se le escapó algo del README porque él mismo lo admitió.

