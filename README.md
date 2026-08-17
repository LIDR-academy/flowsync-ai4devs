# FlowSync

Proyecto de práctica del curso: gestión de tareas en equipo. API en AdonisJS 7 (`backend/`) + frontend en React 19 + Vite (`frontend/`).

## Empezar

```bash
git clone https://github.com/LIDR-academy/flowsync-ai4devs.git
cd flowsync-ai4devs
git checkout s1/start
```

> Si el `clone` falla, avisa a tu TA.

## Backend (`backend/`)

```bash
cd backend
npm install
cp .env.example .env
node ace generate:key
node ace migration:run
npm run dev
```

Arranca en `http://localhost:3333`.

## Frontend (`frontend/`)

Abre otra terminal en la raíz del repo (el backend se queda corriendo en la primera):

```bash
cd frontend
npm install
npm run dev
```

Arranca en `http://localhost:5173`.

Las instrucciones completas de prework (checklist + priming) están en el Módulo 1 del asíncrono del curso.
