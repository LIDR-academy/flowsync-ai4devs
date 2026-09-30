# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

- La regla 2 saltó en la prueba del archivo temporal; el registro dejó: `2026-09-30T21:58:55Z BLOQUEADO regla=2 archivo=tmp-email-proof.txt`.

## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

- No puede cazar el correo del autor o los secretos del entorno local como `~/.git/config` o `backend/tmp/db.sqlite3`, porque solo inspecciona texto que entra en el commit y no revisa el sistema ni la base de datos local.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- Dudé en cómo tratar un mismo comando que hace `git add` y `git commit`, porque el hook debe mirar también los cambios sin preparar y los archivos nuevos, pero sin bloquear casos falsos positivos ni el propio script.
