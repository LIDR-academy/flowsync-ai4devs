# FlowSync

Proyecto de práctica del curso: gestión de tareas en equipo. API en AdonisJS 7 (`backend/`) + frontend en React 19 + Vite (`frontend/`).

## Qué hace

Qué puede hacer una persona con FlowSync hoy, historia a historia y con lo que quedó fuera del MVP: [`docs/alcance-funcional.md`](docs/alcance-funcional.md).

## Empezar

```bash
git clone https://github.com/LIDR-academy/flowsync-ai4devs.git
cd flowsync-ai4devs
git checkout s2/start   # o la rama del módulo que estés cursando (te la indica el prework)
```

> Si el `clone` falla, avisa a tu TA.

## Arrancar la app

El repo trae un `Makefile` con los atajos de desarrollo (nace en el Módulo 1). Con dos comandos tienes todo en marcha:

```bash
make setup   # solo la primera vez: instala deps, crea los .env y migra
make start   # levanta backend (:3333) y frontend (:5173) a la vez
```

`make start` arranca los dos servidores juntos; `Ctrl-C` los para. `make help` lista todos los targets.

- Backend en `http://localhost:3333`.
- Frontend en `http://localhost:5173`. Apunta al backend por defecto; para cambiarlo, ajusta `VITE_API_URL` en `frontend/.env`.

> ¿Prefieres arrancar a mano, sin `make`? Los pasos por servidor (`npm install`, `.env`, migraciones, `npm run dev`) están en el Módulo 1 del asíncrono del curso.

Las instrucciones completas de prework (checklist + priming) están en el asíncrono del curso.
