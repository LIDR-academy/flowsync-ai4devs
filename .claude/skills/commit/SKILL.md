---
name: commit
description: Genera un commit convencional a partir de los cambios staged. Usar al cerrar una tarea.
---
# Commit convencional
1. Ejecuta `git diff --staged` y resume el cambio.
2. Redacta un mensaje `tipo(scope): descripción` (feat/fix/refactor/docs/test/chore).
3. Muestra el mensaje y pide confirmación antes de `git commit`.