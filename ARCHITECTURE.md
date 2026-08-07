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

`parser-factory.service.ts` siempre devuelve `ClaudeParser`: como ese parser
ya cae solo a `RuleBasedParser` ante cualquier falla (sin key global, sin key
personal, error de red, etc.), y la key personal de cada usuario solo se
conoce por pedido (`userId`), no al arrancar el proceso, la decisión
"¿hay IA disponible?" ya no puede tomarse una sola vez al boot — se resuelve
en cada llamada dentro de `anthropic-client.service.ts`. El resto del sistema
(`task.service.ts`) solo conoce la interfaz `NaturalLanguageParser`, nunca la
implementación concreta.

#### Pool de API keys de Anthropic (`anthropic-client.service.ts`)

Punto único por el que pasan las tres llamadas a Claude del backend
(`ClaudeParser`, `suggestNextTasks`, `draftFollowUp`). Resuelve, en este
orden, con qué key hacer el pedido:

1. **Key personal del usuario** (si `userId` la tiene configurada vía `PUT
   /auth/anthropic-key`): se usa esa única key, sin rotación ni failover —
   es la key del usuario, así que si falla se le informa a él en vez de
   consumir la key compartida del servidor a su costa.
2. **Pool compartido del servidor** (`ANTHROPIC_API_KEYS`, separadas por
   coma; `ANTHROPIC_API_KEY` sigue funcionando como caso de una sola key):
   - **Round-robin**: cada llamada arranca por la siguiente key en la
     rotación, para repartir el uso entre keys en vez de agotar siempre la
     primera.
   - **Failover**: si esa key responde 401/403 (inválida), 429
     (rate-limited/sin cupo) o 5xx (error transitorio de Anthropic),
     reintenta automáticamente con la siguiente key de la lista antes de
     fallar. Otros errores (4xx de validación del pedido) no reintentan —
     no tiene sentido repetir el mismo pedido inválido con otra key.

`hasAnthropicAccess(userId)` (key personal o pool) y `hasAnthropicClient()`
(solo pool, para chequeos que no tienen `userId` a mano) reemplazan el
chequeo directo de `env.anthropicApiKey` para decidir si las features de IA
están disponibles.

#### API key personal por usuario (`user-anthropic-key.service.ts`)

Cada usuario puede cargar su propia API key de Anthropic desde Configuración
(`AnthropicKeyForm.tsx` en el frontend, `PUT`/`DELETE /auth/anthropic-key` en
el backend) para que su consumo de IA salga de su propia cuenta, no de la del
servidor:

- Se cifra en reposo con AES-256-GCM (`crypto.service.ts`) usando la clave
  simétrica `ENCRYPTION_KEY` del servidor (32 bytes en base64) — nunca se
  guarda en texto plano. Sin `ENCRYPTION_KEY` configurada, guardar una key
  personal devuelve 503 (mismo criterio de degradación que el resto de las
  features de IA).
  Ver [DATABASE.md](./DATABASE.md) para las columnas (`anthropic_api_key_encrypted`,
  `anthropic_api_key_last4`).
- Solo se guardan/exponen los últimos 4 caracteres en texto plano
  (`anthropic_api_key_last4`) para mostrar en la UI ("termina en ab12") sin
  descifrar en cada carga.
- Se valida que la key tenga el prefijo `sk-ant-` antes de guardarla (422 si
  no).

### Asistencia con IA post-captura (`ai-assist.service.ts`)

Dos funciones separadas del parser de captura, ambas a pedido explícito del
usuario (nunca disparadas automáticamente ni en un polling — cada llamada
sale del mismo `ANTHROPIC_API_KEY` compartido, así que el costo queda bajo
control del usuario):

- **`suggestNextTasks`** (`GET /tasks/suggest-next`): manda la lista de
  tareas pendientes del usuario (título, estado, prioridad, fechas,
  contexto) a Claude con un tool use forzado (`pick_next_actions`) para que
  elija 2-3 y explique por qué en una frase. El resultado se puede pasar
  directo a `FocusModeModal` para revisar solo esas.
- **`draftFollowUp`** (`POST /tasks/:id/draft-followup`): le pasa el
  título/descripción de una tarea puntual a Claude y pide un borrador corto
  de email de seguimiento en español. Devuelve texto plano para copiar — la
  app nunca manda un email por su cuenta.

Ambas funciones llaman a `requireClient()`, que lanza un `AppError` 503 con
mensaje claro si `ANTHROPIC_API_KEY` no está configurada, en vez de romper
— mismo criterio de degradación que `parser-factory.service.ts`, salvo que
acá no hay fallback rule-based porque no tendría sentido (elegir tareas o
redactar un email no son tareas mecánicas).

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

- Tipografía: `Inter` para texto de UI (jerarquía por peso/tracking, sin
  serif), `IBM Plex Mono` para todo dato cuantitativo (fechas, horas,
  contadores) — la clase utilitaria `.figures` marca esta convención en todo
  el código.
- Color ("Dopamina & Energía", `tailwind.config.js`): fondo `paper` (`#FAFAFA`)
  en todas las superficies, incluido el sidebar y el login — no hay ninguna
  pantalla con fondo oscuro. Acento primario `signal` (coral `#FF6B6B`,
  botones/dots/glow), `sun` (amarillo `#FFD166`, prioridad media), `calm`
  (esmeralda, completadas), `urgent` (rojo cálido, prioridad alta/errores),
  texto principal `ink-950` (navy `#2C3E50`, no negro puro). Un color de
  contexto por fila de tarea (`box-shadow` inset de 3px en el borde izquierdo),
  elegido por el usuario de una paleta fija en `ContextFormModal`.
- Movimiento: `framer-motion` para transiciones con intención (entrada en
  cascada de `TaskRow`, bounce del check al completar, modales que escalan al
  abrir) — nunca en el contenedor `draggable` de `TaskRow` para no chocar con
  el drag & drop nativo HTML5 (framer intercepta `onDragStart` con su propio
  sistema de gestos si se aplica al mismo elemento).
- Modo enfoque (`FocusModeModal.tsx`): revisa las tareas pendientes de "Foco
  de hoy" de a una (ordenadas por fecha, ignorando el agrupado por contexto
  que usa el browse normal), con swipe horizontal (`drag="x"` de
  framer-motion — izquierda avanza, derecha vuelve atrás) además de los
  botones Completar/Más tarde/Editar/Anterior. `SuggestNextButton` puede
  alimentarlo con la selección de `suggestNextTasks` en vez de la cola
  completa.
- Configuración: las activaciones por dispositivo (Face ID/huella, alarmas
  push) viven detrás de un único botón "Configuración"
  (`layout/SettingsMenu.tsx`), no sueltas en el sidebar/header.
- Mobile: `AppShell` oculta el `Sidebar` (`hidden md:flex`) y muestra
  `MobileHeader` + `MobileTabBar` (`md:hidden`) por debajo de 768px. El resto
  de las páginas usan grids/paddings responsive (`sm:`/`md:`) en vez de
  layouts separados por dispositivo. La home no tiene fila de KPIs — se sacó
  porque ocupaba espacio sin aportar valor; va directo de captura rápida a
  "Foco de hoy".
- PWA: `manifest.webmanifest` + `public/sw.js` (`install`/`activate`/`fetch`,
  registrado sin condiciones en `main.tsx`) hacen que Focus sea instalable
  desde el navegador (Android Chrome ofrece "Agregar a inicio" solo; iOS
  Safari lo tiene bajo Compartir). El manifest no cachea nada offline —
  Focus depende de datos en vivo — solo cumple el requisito de instalabilidad.

### Entrega de recordatorios (Web Push)

Dos mecanismos independientes, uno server-side (real) y uno client-side
(fallback visual):

- **Server-side (real)**: `dispatchDueReminders()` corre cada 30s en
  `server.ts`, busca recordatorios `pending` vencidos de todos los usuarios
  y llama a `push.service.ts` (`web-push` + claves VAPID) para mandar una
  notificación a cada `push_subscriptions` del usuario dueño de la tarea.
  Llega aunque la app esté cerrada porque corre en el navegador vía el
  Service Worker (`frontend/public/sw.js`), no en la pestaña. El recordatorio
  se marca `sent` después de intentar el envío (no reintenta indefinidamente
  si una suscripción quedó inválida — esos casos se limpian solos con un
  404/410 de la API de push).
- **Client-side (fallback)**: `ReminderWatcher` sondea `GET /reminders/due`
  cada 20s mientras la pestaña está abierta y dispara una `Notification` del
  navegador. Solo funciona con la app en primer plano; existía antes de Web
  Push y se mantiene como red de seguridad visual.
- El botón "Activar alarmas aunque la app esté cerrada" (`EnablePushButton`,
  dentro de `SettingsMenu`) registra el service worker, pide permiso de
  notificaciones, y sube la suscripción del navegador a
  `POST /api/push/subscribe`. Sin `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`
  configuradas en el backend, este flujo queda deshabilitado sin romper nada
  (el endpoint devuelve `publicKey: null`).

## Seguridad

- Contraseñas con `bcryptjs` (12 rounds).
- JWT firmado con `JWT_SECRET`, expiración configurable (`JWT_EXPIRES_IN`).
- Todas las consultas usan parámetros posicionales (`$1`) — cero interpolación
  de strings en SQL, cero superficie de SQL Injection.
- Rate limiting en `/api` (300 req/15min) y endurecido en `/api/auth` (20 req/15min).
- CORS restringido a `CORS_ORIGIN`.
