# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Saltó la regla 2 (correo con dominio real) y el registro dejó esta línea: 2026-09-29T11:35:04Z BLOQUEADO regla=2:correo-dominio-real archivo=docs/capabilities/tasks/README.md

-

## 2. Lo que el hook no puede cazar

El correo y la contraseña de la tabla users, y el hash de auth_access_tokens, viven en backend/tmp/db.sqlite3: el hook solo mira líneas añadidas de un git commit y esa base no entra en el diff.

-

## 3. Tu duda

No comprobé que el hook ignore el mensaje del commit (el asunto de 9684896 se llevó el correo de la prueba porque solo mira el diff, no el texto de -m).
En el primer intento de la parte C el hook no actuó porque el agente, al leer la regla de CLAUDE.md, cambió el correo a un dominio de ejemplo antes de commitear: el diff ya iba limpio y el script salió en silencio con código 0. Me generó la duda de porque cambió el correo antes del commit y recien al pedir el reintento actuó y bloqueó.

-
