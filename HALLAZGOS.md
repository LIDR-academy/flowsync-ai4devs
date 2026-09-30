# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

- Saltó la regla 2 (correo fuera de example.com/org/net y github.com), dos veces seguidas; la primera línea que dejó: `2026-09-30T22:41:28Z BLOQUEADO regla 2 docs/capabilities/tasks/README.md`. No lleva el correo.

## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

- La contraseña de la cuenta de pruebas de Ana entró en `bf3ab60` sin que nada la frenara: el hook reconoce secretos por su forma (prefijos de AWS o GitHub, `APP_KEY=`), y una contraseña elegida por una persona no tiene forma; lo mismo el nombre de Ana, que quedó en el README y en el mensaje del commit.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- El curso pide los prompts literales en `prompts.md`, y ahí van el correo de la parte C y los prefijos de clave: el hook los bloquearía, así que ese fichero entró desde mi terminal, donde no corre ningún hook. No sé si eso es saltárselo, y muestra que el hook solo cuida lo que hace el agente.
