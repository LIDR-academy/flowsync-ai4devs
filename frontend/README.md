# FlowSync frontend

React + TypeScript + Vite client for FlowSync authentication.

## Development

Copy `.env.example` to `.env` and set `VITE_API_URL` to the Spring API URL. The backend must also include the frontend origin in `flowsync.cors.allowed-origins` (for local development: `http://localhost:5173`).

```bash
npm install
npm run dev
```

The client calls `/api/v1/auth/signup`, `/api/v1/auth/login`, and the protected `/api/v1/account/profile`. The JWT is kept only in runtime memory and is not persisted in browser storage.

## Verification

```bash
npm run build
npm run lint
```
