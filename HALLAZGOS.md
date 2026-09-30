# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

Se saltó la regla 2 (correo de una persona) al intentar el commit del ejemplo de la Parte C, y el registro dejó esta línea: 
- 2026-09-29T02:19:27Z BLOQUEADO — regla 2 (correo de una persona) — docs/capabilities/tasks/README.md
-

## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.
-

 El hook no juzga si la contraseña de ejemplo es aceptable. secreto123 pasó sin que ninguna regla la mirara porque una contraseña no tiene forma reconocible.

El nombre de la persona entró igual: el ejemplo y el mensaje del commit dicen «Ana Pérez», y el hook no lo ve porque un nombre no tiene forma de texto reconocible, como es el caso de emails, claves y .env.


## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.
-
 No sé si hacer el git add y el git commit en dos llamadas para evitar el falso positivo con prompts.md cuenta como «rodear el hook», porque el hook no llegó a ver lo mismo que habría visto en una sola llamada.

- No pude comprobar qué pasará cuando commitee prompts.md. Contiene los prompts pegados tal cual, con el correo y un prefijo de clave, así que el hook lo bloqueará aunque el ejercicio pida no retocarlos.
