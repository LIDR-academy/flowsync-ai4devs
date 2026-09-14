# Frontend de FlowSync

SPA en **React 19 + Vite 8**, con react-router, Tailwind v4 y componentes de shadcn/ui. Escucha en `http://localhost:5173` y habla con la API de [`backend/`](../backend/README.md).

## Responsabilidades

- **Acceso**: registro, inicio y cierre de sesión, perfil, y recuperar la sesión guardada al volver. Reglas en [`openspec/specs/auth/spec.md`](../openspec/specs/auth/spec.md) y resumen en [`docs/capabilities/auth/README.md`](../docs/capabilities/auth/README.md).
- **Tareas**: la lista compartida, crear desde la lista, cambiar el estado desde la fila, filtrar por estado, y la tarea suelta con su fecha de vencimiento. Reglas en [`openspec/specs/tasks/spec.md`](../openspec/specs/tasks/spec.md) y resumen en [`docs/capabilities/tasks/README.md`](../docs/capabilities/tasks/README.md).
- **Traducir los errores de la API** a mensajes en castellano, por campo cuando el error es de un campo.

Lo que **no** hace: decidir reglas de negocio. Quién es responsable, cuándo vence una tarea o qué estados existen lo decide la API; la SPA pinta lo que recibe.

## Estructura

| Carpeta              | Qué hay                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/api.ts`     | **El único punto de contacto con el backend.** Envuelve `fetch`, desenvuelve `{ data }`, adjunta `Authorization: Bearer` y traduce los errores a `ApiError`. Toda llamada nueva va aquí, no en un componente |
| `src/lib/lista.ts`   | Dónde entra en pantalla una tarea recién creada, sin volver a pedir la lista                                                                                                                                 |
| `src/auth/`          | La sesión: contexto, proveedor (token en `localStorage` bajo `flowsync.token`, revalidado contra el perfil al arrancar) y hooks                                                                              |
| `src/routes/`        | Rutas y los guards `ProtectedRoute` y `PublicOnlyRoute`                                                                                                                                                      |
| `src/pages/`         | `/login`, `/register`, `/profile`, `/tasks` y `/tasks/:id`. Cualquier otra dirección lleva a `/tasks`                                                                                                        |
| `src/components/`    | Componentes propios                                                                                                                                                                                          |
| `src/components/ui/` | Generados por shadcn (`npx shadcn@latest add <componente>`). **No se editan a mano**                                                                                                                         |
| `src/index.css`      | Los tokens de Tailwind v4. No hay `tailwind.config.js`                                                                                                                                                       |
| `e2e/`               | Pruebas de navegador con Playwright                                                                                                                                                                          |

El alias `@/*` apunta a `src/*`, declarado a la vez en `tsconfig.app.json` y en `vite.config.ts`.

## Cómo se usa

```bash
npm install                 # también activa el hook de git (script prepare)
cp .env.example .env        # solo la primera vez
npm run dev                 # http://localhost:5173
```

El backend tiene que estar arrancado. La URL de la API sale de `VITE_API_URL` en `.env`; sin ella, `http://localhost:3333`.

```bash
npm run build               # tsc -b && vite build: aquí vive el typecheck
npm run preview             # sirve la build
npm run lint                # oxlint, no eslint
npm run format              # prettier
```

## Cómo se prueba

```bash
npm test                    # Vitest, sobre src/lib/
npm run test:e2e            # Playwright
```

- **Vitest** cubre `lib/api.ts` -la traducción de errores, el desenvuelto de `{ data }`, el aviso de sesión caducada- y `lib/lista.ts`. Ninguna prueba de Vitest monta componentes.
- **Playwright** levanta su propio backend con `NODE_ENV=test` en el puerto 3334 y su propio frontend en el 5174, prepara el estado por la API, comprueba en pantalla y al terminar deshace las tablas de la base de pruebas. La primera vez hace falta el navegador: `npx playwright install chromium`. **No se lanza a la vez que `npm test` del backend**: chocan en el puerto y en la base.
- Playwright cubre a propósito pocos casos: los que ninguna otra prueba veía. Cuáles, y qué requisitos de pantalla siguen sin prueba, en [`docs/trazabilidad.md`](../docs/trazabilidad.md). Cuántas pruebas de Vitest hay lo dice [`AGENTS.md`](../AGENTS.md), y CI lo contrasta.

Si una prueba de navegador falla en CI, las trazas quedan como artefacto `trazas-playwright` de la ejecución durante siete días.
