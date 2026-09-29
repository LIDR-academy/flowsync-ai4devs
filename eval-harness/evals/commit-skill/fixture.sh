#!/usr/bin/env bash
# Repo mínimo con un cambio ya preparado en el área de staging.
# Autocontenido a propósito: no depende del árbol de FlowSync.
set -eu
git init -q .
git config user.email alumno@example.com
git config user.name Alumno
mkdir -p backend/app/controllers
echo "export default class TasksController {}" > backend/app/controllers/tasks_controller.ts
git add -A
git commit -qm "chore: estado inicial"
printf 'export default class TasksController {\n  async index() { return [] }\n}\n' > backend/app/controllers/tasks_controller.ts
git add -A
