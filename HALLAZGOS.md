# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

### Respuesta: Al solicitarle la petición de la sección C con el correo de `ana.perez@example.com` el hook `datos-que-no-salen.sh` bloqueo la petición y dejo el registro en `docs/seguridad/registro-de-bloqueos.md`, la información se puede visualizar en la sección de Prompts # 6


## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

### Respuesta: Las peticiones que se llegan a realizar directamente mediante un prompt, como una consulta a la tabla de Users, solicitar que lea el archivo `backend/.env`, incluso si se llegan a leer los arhcivos `backend/.env.example` y `.env.test`

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

### Respuestas:
### 1.- De la configuración del Hook, que realmente estuviera funcionando.
### 2.- Qué el hook tuviera un buen alcance para detectar fugaz de información de datos personales.
### 3.- No tenía ni idea de que los datos personales pudieran estar expuestos por utilizar IA en nuestro proyectos, la sección 3 del bloque A `Qué leo para un cambio en el backend y si sale de tu máquina` realmente me dejo sorprendido.
