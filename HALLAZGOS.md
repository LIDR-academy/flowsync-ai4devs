# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

- la regla de correo con dominio no permitido al intentar commitear prueba-seguridad.txt, y el registro dejo:

``
Contiene un correo @gmail.com, dominio no permitido — debería activar la REGLA 2 (CORREOS). Ejecuto el commit para comprobarlo.
                                                                                   Ran 1 shell command

El hook funcionó: bloqueó el commit por la regla CORREOS, señalando el fichero 
prueba-seguridad.txt, sin revelar el correo detectado. Verifico que el commit no se
realizó y que el log se creó correctamente.                                    

  Ran 1 shell command                                                            

Resultado de la prueba

El commit no se realizó (git log sigue igual, prueba-seguridad.txt sigue staged sin commitear).

El hook bloqueó correctamente:
- Regla activada: CORREOS (email con dominio gmail.com, no permitido).
- Fichero señalado: prueba-seguridad.txt.
- Valor del correo: nunca se imprimió, ni en stderr ni en el log.
- Log creado en docs/seguridad/registro-de-bloqueos.md con la línea de encabezado + una única línea de bloqueo con timestamp UTC ISO 8601, BLOQUEADO, la regla y el fichero.

``


## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

- una contraseña de base de datos del backend guardada en .env.* o escrita a mano en un fichero de configuracion: el archivo no se llama exactamente .env y la contraseña no tiene un formato reconocible, así que ninguna de las tres reglas la detecta.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- primero hice el commit fuera de mi session, directamente en la terminal del id y este no funciono, pero si lo hago dentro de la session de claude code este si funciono
