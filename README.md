# FlowSync

Proyecto base del Bloque Fundacional de AI4Devs (Módulos 1–5). API en AdonisJS 7 (`backend/`) + frontend en React 19 + Vite (`frontend/`).

## Empezar

```bash
git clone https://github.com/LIDR-academy/flowsync-ai4devs.git
cd flowsync-ai4devs
git checkout s1/start
```

> Repo privado: si el `clone` falla por permisos, avisa a tu TA para que te añada como colaborador de GitHub.

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

```bash
cd frontend
npm install
npm run dev
```

Las instrucciones completas de prework (checklist + priming) están en el Módulo 1 del asíncrono del curso.
