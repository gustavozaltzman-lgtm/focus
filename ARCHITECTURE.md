# ARCHITECTURE.md

## Principios

- **Cero ORM**: toda persistencia pasa por SQL parametrizado con `pg`. Las
  repositories son la única capa que conoce SQL.
- **Capas estrictas**: cada capa del backend solo puede llamar a la capa
  inmediatamente inferior (controller → service → repository → db).
- **Máximo 300 líneas por archivo**: fuerza cohesión y nombres claros en vez de
  archivos "god object".

## Backend — flujo de una petición

```
Request
  │
  ▼
routes/*.routes.ts        (define método + path + middlewares)
  │
  ▼
middlewares/               (auth JWT, rate limiter, validator Zod)
  │
  ▼
controllers/*.controller.ts (traduce HTTP ⇄ dominio, sin lógica de negocio)
  │
  ▼
services/*.service.ts       (reglas de negocio, orquestación, ai-parser)
  │
  ▼
repositories/*.repository.ts (SQL puro parametrizado vía pg.Pool)
  │
  ▼
PostgreSQL (Neon)
```

### Capas

- `config/`: variables de entorno tipadas y el `pg.Pool` compartido.
- `database/`: migraciones SQL versionadas + runner idempotente
  (`schema_migrations`).
- `middlewares/`: `authMiddleware` (JWT), `errorHandler`, rate limiters
  (`express-rate-limit`), validadores Zod (`validateBody`/`validateQuery`).
- `repositories/`: una función por consulta, siempre parametrizada
  (`$1, $2, …`) — nunca interpolación de strings.
- `services/`: lógica de negocio, transacciones multi-repositorio,
  `activity_logs`, y la abstracción de IA (`ai-parser.service.ts`).
- `controllers/`: extraen `req.user` (inyectado por `authMiddleware`), llaman
  al service correspondiente, devuelven el status HTTP correcto.
- `routes/`: componen middlewares + controller por endpoint.

### `ai-parser.service.ts`

Define la interfaz `NaturalLanguageParser` con un único método `parse(text, contexts)`.
La implementación por defecto (`RuleBasedParser`) usa Regex para extraer fecha
(hoy/mañana/día de la semana/ISO), hora, prioridad y contexto (matching contra
`contexts.name` del usuario). Para escalar a un LLM, se implementa una nueva
clase (`OpenAiParser`) que satisfaga la misma interfaz y se intercambia en
`createNaturalLanguageParser()` sin tocar el resto del sistema.

## Frontend — flujo de datos

```
Componente de página (pages/*)
  │  usa hooks
  ▼
hooks/use*.ts (TanStack Query: useQuery / useMutation)
  │  llama
  ▼
api/*.ts (axios client con interceptor JWT)
  │  HTTP
  ▼
Backend API
```

- `context/AuthContext.tsx`: fuente de verdad de sesión (token en
  `localStorage`, usuario en memoria), expone `login/register/logout`.
- `api/client.ts`: instancia axios única; inyecta `Authorization: Bearer` y
  redirige a `/login` en 401.
- `hooks/`: encapsulan TanStack Query; invalidan `tasks`/`dashboard`/`contexts`
  tras cada mutación para mantener la UI consistente sin estado global manual.
- `components/`: divididos por dominio (`tasks/`, `dashboard/`, `capture/`,
  `layout/`, `ui/`) — nunca un archivo "components/index" gigante.

## Seguridad

- Contraseñas con `bcryptjs` (12 rounds).
- JWT firmado con `JWT_SECRET`, expiración configurable (`JWT_EXPIRES_IN`).
- Todas las consultas usan parámetros posicionales (`$1`) — cero interpolación
  de strings en SQL, cero superficie de SQL Injection.
- Rate limiting en `/api` (300 req/15min) y endurecido en `/api/auth` (20 req/15min).
- CORS restringido a `CORS_ORIGIN`.
