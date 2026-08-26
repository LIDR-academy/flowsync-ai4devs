# FlowSync

Proyecto de práctica del curso: gestión de tareas en equipo. API en Spring Boot 4.1 / Java 21 (`backend-spring/`) + frontend en React 19 + Vite (`frontend/`).

## Empezar

```bash
git clone https://github.com/LIDR-academy/flowsync-ai4devs.git
cd flowsync-ai4devs
git checkout s1/start
```

> Si el `clone` falla, avisa a tu TA.

## Backend (`backend-spring/`)

Requiere JDK 21 instalado (`java -version`); no hace falta Maven global, el
proyecto trae su propio wrapper.

```bash
cd backend-spring
./mvnw spring-boot:run
```

Arranca en `http://localhost:8080`. El esquema lo crea Flyway automáticamente
al arrancar sobre una base H2 embebida (persistida en `./data`, ignorada por
git); no requiere ningún paso de setup adicional.

## Frontend (`frontend/`)

Abre otra terminal en la raíz del repo (el backend se queda corriendo en la primera):

```bash
cd frontend
npm install
npm run dev
```

Arranca en `http://localhost:5173`.

Las instrucciones completas de prework (checklist + priming) están en el Módulo 1 del asíncrono del curso.
