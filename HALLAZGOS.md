# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: una parte del hook a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras, y **sin el dato dentro**: si tu línea
repite el correo o el secreto, eso es otra copia del dato (y también es un hallazgo, de los buenos).

## 1. La regla que saltó

Qué regla saltó en tu prueba, y la línea literal que dejó el registro.

- Saltó la regla 2 (correo de una persona, dominio fuera de la lista permitida) al commitear el ejemplo de `curl` del README de `tasks`; línea literal del registro: ``- 2026-09-30T17:30:18Z BLOQUEADO regla 2 (correo de una persona) archivo `docs/capabilities/tasks/README.md` `` (no incluye el correo).

## 2. Lo que el hook no puede cazar

Un dato personal o un secreto de este proyecto que el hook NO puede cazar, y por qué.

- Nombres y apellidos reales ("Ana Pérez" en el README de `tasks`, la columna `users.full_name`) y claves genéricas sin prefijo conocido (p. ej. `BEARER_TOKEN=mi_clave_secreta_123`, o la contraseña `secreto123`, que sí entró en el commit): el hook solo ve patrones rígidos (regex), y ni un nombre propio ni una clave inventada tienen una forma que lo distinga de texto normal.

## 3. Tu duda

De qué dudaste, o qué no pudiste comprobar.

- No probé a propósito un commit combinado con `git add .` en el mismo comando, pero sí vi su efecto: el hook actúa con cualquier comando cuyo texto contenga «git commit» (aunque no sea un commit), y si además lleva «git add» revisa todos los cambios sin preparar, aunque no vayan a entrar; así bloqueó dos comandos míos que no commiteaban nada y dejó líneas de más en el registro.
