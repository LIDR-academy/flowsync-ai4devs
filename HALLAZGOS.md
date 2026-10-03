# Hallazgos

## 1. La regla que saltó

- Saltó la regla `correo fuera de los dominios permitidos`; el registro dejó: `- 2026-10-03T07:02:41Z BLOQUEADO regla="correo fuera de los dominios permitidos" archivo="docs/capabilities/tasks/README.md"`.

## 2. Lo que el hook no puede cazar

- El hook no puede detectar datos personales existentes en la base de datos local, porque únicamente inspecciona archivos y líneas añadidas que entrarían en un commit.

## 3. Tu duda

- Dudé de si mostrar `BLOQUEADO` garantizaba el bloqueo; lo comprobé verificando el código de salida 2 y que `HEAD` no cambió.
