# Focus — Execution Engine

Focus no es una lista de tareas. Es un gestor de compromisos de fricción cero: un
"segundo cerebro" diario donde capturas cualquier cosa en lenguaje natural y el
sistema decide dónde vive — hoy, próximamente, algún día, o un contexto/proyecto
específico.

## Filosofía

- **Fricción cero**: un único input de captura rápida, sin formularios largos.
- **Claridad sobre densidad**: espacio en blanco, tipografía cuidada, cero ruido visual.
- **El sistema clasifica, tú decides**: el parser de lenguaje natural interpreta
  fecha, prioridad y contexto; tú solo confirmas o ajustas.
- **Un lugar para cada compromiso**: Inbox para capturar, Hoy para ejecutar,
  Contextos para agrupar por proyecto/entidad.
- **Presente aunque la app esté cerrada**: instalable como PWA (Android/iOS/
  desktop) y las alarmas llegan por Web Push, no dependen de tener la pestaña
  abierta.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Framer Motion |
| Backend | Node.js, Express, TypeScript, `pg` (driver nativo, sin ORM), JWT, `web-push` |
| Base de datos | PostgreSQL (Neon) |
| Deploy | Vercel (frontend) + Render (backend) + Neon (DB) |

## Estructura del repositorio

```
focus/
├── backend/     # API REST (Express + pg puro)
├── frontend/    # SPA (React 19 + Vite)
├── README.md
├── ROADMAP.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
└── DEPLOY.md
```

## Instalación local

### Requisitos
- Node.js 20+
- Una base de datos PostgreSQL (Neon recomendado para desarrollo también)

### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tu DATABASE_URL y JWT_SECRET
npm install
npm run migrate
npm run dev
```

El API queda disponible en `http://localhost:4000/api`.

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Scripts principales

| Ubicación | Comando | Descripción |
|---|---|---|
| backend | `npm run migrate` | Aplica migraciones SQL pendientes |
| backend | `npm run dev` | Servidor con recarga en caliente |
| backend | `npm run build` / `npm start` | Compilación y arranque en producción |
| frontend | `npm run dev` | Servidor de desarrollo Vite |
| frontend | `npm run build` | Build de producción (`tsc -b && vite build`) |
| backend | `npm run import-fichas -- "<ruta.txt>" [email]` | Importa "fichas" (texto estructurado `FICHA N` / `Título` / `Descripción` / `Prioridad`) a Inbox. Idempotente: correrlo de nuevo sobre el mismo archivo no duplica lo ya importado, solo agrega fichas nuevas. Ver `backend/src/scripts/import-fichas.ts`. |

## Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) — capas y flujo de datos
- [DATABASE.md](./DATABASE.md) — DDL completo e índices
- [API.md](./API.md) — especificación de endpoints
- [DEPLOY.md](./DEPLOY.md) — despliegue en Vercel / Render / Neon
- [ROADMAP.md](./ROADMAP.md) — evolución planeada
