# FlowSync

Gestión de tareas para un equipo pequeño y remoto: una lista compartida donde se ve quién está en qué, sin preguntar a nadie y sin esperar a la daily.

Proyecto de práctica del curso AI4Devs. API en AdonisJS 7 (`backend/`) y frontend en React 19 + Vite (`frontend/`).

## Empezar

```bash
git clone https://github.com/LIDR-academy/flowsync-ai4devs.git
cd flowsync-ai4devs
git checkout s4/start   # o la rama del módulo que estés cursando
```

El repo trae un `Makefile` con los atajos de desarrollo:

```bash
make setup   # solo la primera vez: instala deps, crea los .env y migra
make start   # levanta backend (:3333) y frontend (:5173) a la vez
```

`make help` lista todos los targets. Sin `make`, cada proyecto se arranca con `npm install` y `npm run dev` desde su carpeta; el backend necesita además `cp .env.example .env`, `node ace generate:key` y `node ace migration:run`.

- Backend en `http://localhost:3333`
- Frontend en `http://localhost:5173`, que apunta al backend por defecto. Para cambiarlo, `VITE_API_URL` en `frontend/.env`

**No hay `package.json` en la raíz.** Todos los comandos de `npm` se lanzan desde `backend/` o desde `frontend/`.

## Comprobar que está sano

```bash
cd backend && npm test && npm run lint && npm run typecheck
cd ../frontend && npm run lint && npm run build
node scripts/verificar-docs.mjs
```

`verificar-docs.mjs` contrasta la documentación contra el código y falla si dejan de coincidir: rutas documentadas que no existen, estados que no cuadran con el dominio, el email del responsable colándose en la lista, o el aislamiento de la base de pruebas deshecho.

El frontend corre **Vitest** (`npm test`), 28 pruebas sobre `src/lib/api.test.ts`. No hay runner de **navegador**, así que los 15 requisitos que solo se observan en pantalla siguen sin cubrir.

## Dónde está cada cosa

| Documento | Qué responde |
|---|---|
| [`openspec/specs/`](openspec/specs/) | **La fuente de verdad.** Cómo debe comportarse el sistema, por capability, con sus escenarios |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Qué piezas hay, cómo se hablan, y dónde vive la regla de negocio |
| [`docs/api/openapi.yaml`](docs/api/openapi.yaml) | El contrato de la API, ruta por ruta |
| [`docs/trazabilidad.md`](docs/trazabilidad.md) | Qué criterio de aceptación tiene prueba y cuál no |
| [`docs/adr/`](docs/adr/) | Las decisiones técnicas que costó tomar, con sus alternativas descartadas |
| [`docs/hallazgos.md`](docs/hallazgos.md) | Los problemas encontrados trabajando, con cómo se verificó cada uno |
| [`docs/auditoria-reglas-de-proceso.md`](docs/auditoria-reglas-de-proceso.md) | Qué reglas declara el repo, cuáles se cumplen y cuáles no se pueden comprobar |
| [`docs/reporte-modulo-4.md`](docs/reporte-modulo-4.md) | Qué destapó la verificación, y qué se hizo con ello |
| [`docs/artefactos/`](docs/artefactos/) | Los reportes de cada módulo en versión navegable |
| [`docs/backlog/`](docs/backlog/) | Historias de usuario y criterios de aceptación |
| [`docs/prd/`](docs/prd/) | Alcance del MVP y requisitos |
| [`docs/estado-actual.md`](docs/estado-actual.md) | Auditoría del repo en el Módulo 2. Histórico, no estado de hoy |

El ancla es la spec viva de `openspec/specs/`. Todo lo demás cuelga de ella: mientras esté al día, lo que cuelga también.

## Estado real del proyecto

Escrito aquí porque un README que promete lo que no hay es peor que no tener README.

**Implementado y funcionando:** alta de cuenta y acceso, la lista compartida del espacio, crear tarea, cambiar de estado, fecha de vencimiento con su regla de vencida, filtro por estado y pantalla de una tarea.

**Escrito en el backlog y no implementado:** borrar tarea, editar el título, reasignar responsable y lista viva sin recargar.

**Cobertura:** 71 pruebas de backend y 28 de frontend. Cubren `auth` entero por API, y de `tasks` la regla de vencimiento, el filtro por estado, lo que se expone del responsable y que la lista es del espacio y no de quien la mira. Los 17 requisitos de sistema de `tasks` tienen prueba; los 15 que solo se ven en pantalla no, porque no hay runner de navegador. El detalle en [`docs/trazabilidad.md`](docs/trazabilidad.md).

## Cómo se trabaja aquí

El flujo es spec-driven con OpenSpec: se propone el cambio, un humano revisa el contrato **antes** de que exista una línea de código, y solo entonces se implementa.

```bash
openspec list                      # cambios en curso
openspec status --change <nombre>  # en qué punto está uno
```

Los cambios ya aplicados quedan en `openspec/changes/archive/`, con su proposal, su diseño y las alternativas que se descartaron. Es donde mirar cuando algo del código parece raro y hay que saber por qué se hizo así.

Las convenciones del stack, que van por delante de la documentación pública de varias de sus dependencias, están en [`CLAUDE.md`](CLAUDE.md).
