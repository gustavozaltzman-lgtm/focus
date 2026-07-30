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

### Parser de lenguaje natural

Interfaz `NaturalLanguageParser` (`ai-parser.service.ts`) con un único método
`parse(text, contexts)`. Dos implementaciones:

- **`RuleBasedParser`** (`ai-parser.service.ts`): Regex puro para extraer fecha
  (hoy/mañana/día de la semana/ISO), hora, prioridad y contexto (matching
  contra `contexts.name` del usuario). Cero dependencias externas, siempre
  disponible.
- **`ClaudeParser`** (`claude-parser.service.ts`): usa `@anthropic-ai/sdk` con
  tool use forzado (`extract_task`) para que Claude devuelva los mismos campos
  estructurados, con mucha más tolerancia a ambigüedad y lenguaje natural
  variado que el motor de Regex. Si la llamada falla (red, rate limit, etc.),
  cae automáticamente al `RuleBasedParser` — nunca bloquea la captura.

`parser-factory.service.ts` decide en runtime: si `ANTHROPIC_API_KEY` está
configurada usa `ClaudeParser`, si no, `RuleBasedParser`. El resto del sistema
(`task.service.ts`) solo conoce la interfaz, nunca la implementación concreta.

### Autenticación biométrica (WebAuthn)

`webauthn.service.ts` implementa registro y login con passkeys (Face ID, Touch
ID, Windows Hello, huella de Android) usando `@simplewebauthn/server`:

- **Registro** (`GET/POST /api/webauthn/register/*`, autenticado): genera un
  challenge de registro, el navegador lo firma con el autenticador de la
  plataforma, y el backend guarda `credential_id` + `public_key` + `counter`
  en `webauthn_credentials`.
- **Login** (`POST /api/webauthn/login/*`, público): dado un email, busca sus
  credenciales, genera un challenge de autenticación, verifica la firma y
  devuelve el mismo `{ user, token }` que el login con contraseña.
- Los challenges en tránsito viven en un `Map` en memoria del proceso (no en
  DB) — suficiente para una sola instancia; si el backend escala a múltiples
  instancias, hay que moverlos a un store compartido (Redis, tabla con TTL).
- `WEBAUTHN_RP_ID`/`WEBAUTHN_ORIGIN` deben coincidir exactamente con el
  dominio real del frontend en cada entorno.

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
  `layout/`, `auth/`, `ui/`) — nunca un archivo "components/index" gigante.

### Identidad visual y responsive

- Tipografía: `Fraunces` (display, solo greetings/wordmark/títulos), stack
  nativo del sistema (`-apple-system`/`SF Pro`) para texto de UI, `IBM Plex
  Mono` para todo dato cuantitativo (fechas, horas, contadores) — la clase
  utilitaria `.figures` marca esta convención en todo el código.
- Color: paleta cálida "paper" (`#FBFAF7`) para el contenido, `ink-950`
  (`#15151A`) para el sidebar/login como "lomo de cuaderno", un color de
  contexto por fila de tarea (`box-shadow` inset de 3px en el borde izquierdo).
- Mobile: `AppShell` oculta el `Sidebar` (`hidden md:flex`) y muestra
  `MobileHeader` + `MobileTabBar` (`md:hidden`) por debajo de 768px. El resto
  de las páginas usan grids/paddings responsive (`sm:`/`md:`) en vez de
  layouts separados por dispositivo.

## Seguridad

- Contraseñas con `bcryptjs` (12 rounds).
- JWT firmado con `JWT_SECRET`, expiración configurable (`JWT_EXPIRES_IN`).
- Todas las consultas usan parámetros posicionales (`$1`) — cero interpolación
  de strings en SQL, cero superficie de SQL Injection.
- Rate limiting en `/api` (300 req/15min) y endurecido en `/api/auth` (20 req/15min).
- CORS restringido a `CORS_ORIGIN`.
