# Prompts

Los prompts que se lanzaron para hacer este ejercicio, en orden, con el modelo y la herramienta de cada uno.

---

## Prompt 1 · el encargo medido, lanzado 5 veces idéntico

**Modelo:** Sonnet 5 (`claude-sonnet-5`), con Haiku 4.5 (`claude-haiku-4-5`) en subtareas
**Herramienta:** Claude Code CLI 2.1.272 en WSL, sin interfaz (`claude -p`, con los permisos concedidos de antemano), sesión nueva lanzada desde la raíz del repositorio

```
Añade a la capability `tasks` el endpoint `DELETE /api/v1/tasks/:id`, que borra una tarea y devuelve `204` sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de `tasks`.
```

**Qué salió:** las cinco veces declaró la ruta y actualizó `docs/capabilities/tasks/README.md`. Sesiones `0f9fe766`, `507e0543`, `785ecb22`, `6c379632` y `b3b43f7d`. Entre intento e intento, `git checkout -f s8/start`, `git reset --hard upstream/s8/start` y `git clean -fd`, comprobando cada vez que el árbol volvía a la rama de partida sin nada dentro.

---

## Prompt 2 · la instrucción al agente que orquestó la medición

**Modelo:** Opus 5 (`claude-opus-5`)
**Herramienta:** Claude Code Desktop en Windows, sesión abierta en otro repositorio y operando sobre WSL

```
Ok Vamos a hacer el Prework del "Módulo 8. Evals for Agentic Harness":
Ejercicio FlowSync: mide una regla que creías cumplida 🔴 — 9 min
[... aquí iba pegado el texto completo de la lección, elidido por longitud ...]
```

**Qué salió:** montó el proyecto (`make setup`, y 23 tests en verde antes de medir nada), preguntó la apuesta antes de lanzar el primer intento, ejecutó los cinco con la comprobación previa de base limpia y el reset duro posterior, recogió la evidencia de cada uno y escribió `docs/evals/RLL.md`.

---

## Lo que no fue un prompt

La apuesta (2 de 5), las dos comprobaciones y el protocolo de reset se decidieron fuera del agente. Las dos comprobaciones son `grep` sobre `backend/start/routes.ts` y sobre `docs/capabilities/tasks/README.md`, no el juicio de un modelo.
