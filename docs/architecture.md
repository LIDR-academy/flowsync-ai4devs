# Arquitectura

Diagrama de contenedores (nivel C4) de FlowSync, construido leyendo el código real: las
rutas de `backend/start/routes.ts`, los controladores registrados en
`backend/.adonisjs/server/controllers.ts`, la conexión SQLite de `backend/config/database.ts`,
y el punto de contacto con la API en `frontend/src/lib/api.ts`. Muestra los tres contenedores
que existen hoy — la SPA de React, la API de AdonisJS y la base de datos SQLite — y cómo se
llaman entre sí. No incluye contenedores ni integraciones que no estén implementados (no hay
cola de mensajes, caché, servicio de email ni backend distinto de este monolito).

```mermaid
C4Container
    title Contenedores de FlowSync

    Person(usuario, "Miembro del equipo", "Abre la lista compartida de tareas desde el navegador")

    System_Boundary(flowsync, "FlowSync") {
        Container(frontend, "Frontend SPA", "React 19, Vite 8, react-router", "Login, registro, perfil, lista de tareas (/tasks) y ficha de una tarea (/tasks/:id). Sirve en localhost:5173")
        Container(backend, "Backend API", "AdonisJS 7, VineJS, Lucid ORM", "Expone /api/v1: auth/signup, auth/login, account/profile, account/logout y tasks (listar, crear, ver, cambiar estado, fijar fecha de vencimiento). Escucha en localhost:3333")
        ContainerDb(db, "Base de datos", "SQLite (tmp/db.sqlite3)", "Cuentas de usuario y tareas, vía los modelos Lucid User y Task")
    }

    Rel(usuario, frontend, "Usa", "navegador")
    Rel(frontend, backend, "Llama a /api/v1/*", "fetch JSON, Authorization: Bearer <token>")
    Rel(backend, db, "Lee y escribe", "Lucid ORM")
```
