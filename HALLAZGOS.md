# Hallazgos

## 1. La regla que saltó

Saltó la regla `correo-real`. Línea del registro: `2026-09-30T01:18:01Z BLOQUEADO REGLA: correo-real | ARCHIVO: docs/capabilities/tasks/README.md`. El correo no aparece en el registro.

## 2. Lo que el hook no puede cazar

El `full_name` de la tabla `users`. Si alguien pone en un fichero el nombre completo de un usuario sacado de la base de datos, el hook no lo detecta: solo busca patrones con forma reconocible (prefijos de clave, arroba de correo, nombre `.env`). Un nombre propio no tiene forma de patrón, así que pasa sin decir nada.

## 3. Mi duda

El hook se detectaba a sí mismo: los patrones escritos como texto en el propio script y en CLAUDE.md activaban la regla de claves al commitear. Tuve que excluir el archivo del hook del diff y reescribir la documentación sin los patrones literales. No pude comprobar si eso crea un punto ciego real (alguien podría meter un secreto dentro del propio archivo del hook y el hook no lo vería).
