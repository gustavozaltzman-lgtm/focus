# API.md

Base URL: `{API_URL}/api` (local: `http://localhost:4000/api`)

Autenticación: `Authorization: Bearer <token>` en todos los endpoints salvo
`/auth/register` y `/auth/login`.

## Auth

### `POST /auth/register`
Body:
```json
{ "email": "ana@cdi.com", "password": "mínimo8chars", "fullName": "Ana Pérez" }
```
201 →
```json
{ "user": { "id": "...", "email": "...", "full_name": "...", "avatar_url": null }, "token": "..." }
```

### `POST /auth/login`
Body: `{ "email": "...", "password": "..." }`
200 → mismo shape que register.

### `GET /auth/me`
200 → `{ "user": { ... } }`

## Contexts

### `GET /contexts`
200 → `{ "contexts": [{ "id", "name", "color_hex", "active_task_count", ... }] }`

### `GET /contexts/:id`
200 → `{ "context": { ... } }`

### `POST /contexts`
Body: `{ "name": "CDI", "colorHex": "#5B6CFF" }` (colorHex opcional, default `#6366F1`)
201 → `{ "context": { ... } }`

### `PATCH /contexts/:id`
Body parcial: `{ "name"?, "colorHex"? }`
200 → `{ "context": { ... } }`

### `DELETE /contexts/:id`
204 sin contenido.

### `POST /contexts/:id/shares`
Compartir de solo lectura con otro usuario (debe existir). Body: `{ "email": "..." }`
201 → `{ "share": { ... } }`. 404 si el email no está registrado, 409 si ya está compartido.

### `GET /contexts/:id/shares`
Lista quién tiene acceso a un contexto propio.
200 → `{ "shares": [{ "shared_with_email", "shared_with_name", ... }] }`

### `DELETE /contexts/:id/shares/:shareId`
Revoca un acceso compartido. 204 sin contenido.

### `GET /contexts/shared-with-me`
Contextos que otros usuarios compartieron con vos.
200 → `{ "contexts": [{ "id", "name", "color_hex", "owner_name" }] }`

### `GET /contexts/:id/shared-view`
Vista de solo lectura de un contexto (propio o compartido).
200 → `{ "context": {...}, "isOwner": bool, "ownerName": "...", "tasks": [...] }`

## Tasks

### `GET /tasks`
Query params: `status`, `contextId`, `scheduledDate` (YYYY-MM-DD), `page` (default 1),
`pageSize` (default 50, máx 100).
200 → `{ "tasks": [ { ... } ] }`

### `GET /tasks/dashboard`
200 →
```json
{
  "urgentCount": 3,
  "scheduledCount": 5,
  "inboxCount": 8,
  "todayTasks": [ { ... } ]
}
```

### `GET /tasks/:id`
200 → `{ "task": { ... } }`

### `POST /tasks`
Body:
```json
{
  "title": "Enviar reporte de costos",
  "description": null,
  "contextId": "uuid|null",
  "status": "inbox|today|upcoming|someday|completed",
  "priority": "low|medium|high",
  "scheduledDate": "2026-08-01",
  "scheduledTime": "14:30",
  "dueDate": "2026-08-20",
  "sourceRef": "Mail de Juan Pérez, asunto: Propuesta ACME Q3"
}
```
Todos los campos salvo `title` son opcionales. `scheduledDate` es cuándo
pensás trabajarla, `dueDate` es el vencimiento real — son independientes.
`sourceRef` es texto libre (referencia, asunto de mail, o un link) para
volver al origen de la tarea. 201 → `{ "task": { ... } }`

### `POST /tasks/capture`
Captura rápida en lenguaje natural: interpreta y **guarda directo**. Body:
`{ "text": "Enviar reporte de costos a CDI el viernes prioridad alta" }`
201 → `{ "task": { ... } }`

### `POST /tasks/capture/preview`
Igual interpretación (crea el contexto si hace falta) pero **sin crear la
tarea** — pensado para mostrar una confirmación editable antes de guardar.
200 → `{ "preview": { "title", "contextId", "status", "priority", "scheduledDate", "scheduledTime" } }`

### `POST /tasks/import-fichas`
Importa texto estructurado copiado de correos (formato `FICHA N` / `Título:`
/ `Descripción:` / `Prioridad: Alta|Media|Baja`, repetido). Crea una tarea en
Inbox por cada ficha nueva; si ya existe una tarea con el mismo título
(sin importar mayúsculas) para el usuario, la saltea — idempotente, se puede
mandar el mismo texto varias veces sin duplicar. No usa el parser de IA: el
formato ya viene estructurado, se parsea con regex.
Body: `{ "text": "FICHA 1\n\nTítulo: ...\n\nDescripción: ...\n\nPrioridad: Alta\n..." }`
200 → `{ "created": 3, "skipped": 1, "createdTitles": ["...", "..."] }`

### `GET /tasks/suggest-next`
Le pide a Claude que elija 2-3 tareas pendientes para atacar ahora
(priorizando vencidas/por vencer, alta prioridad, y las que ya están en
"today"). Requiere `ANTHROPIC_API_KEY` configurada — sin eso, 503.
200 → `{ "tasks": [{ ... }], "reasoning": "..." }`

### `POST /tasks/:id/draft-followup`
Le pide a Claude un borrador corto de email de seguimiento en español,
basado en el título/descripción de la tarea — para copiar y pegar, no se
envía nada automáticamente. Requiere `ANTHROPIC_API_KEY`, sin eso 503.
200 → `{ "draft": "..." }`

### `GET /tasks/:id/activity`
Historial de auditoría de una tarea (más reciente primero, máx 50).
200 → `{ "activity": [{ "action", "created_at", ... }] }`

### `PATCH /tasks/:id`
Body parcial, mismos campos que create. Un campo **ausente** no se toca; un
campo enviado explícitamente como `null` se limpia (ej. quitar el contexto o
la fecha). Marcar `status: "completed"` setea `completed_at` automáticamente.
200 → `{ "task": { ... } }`

### `DELETE /tasks/:id`
204 sin contenido.

## Reminders

### `POST /reminders`
Body: `{ "taskId": "uuid", "triggerAt": "2026-08-05T14:00:00.000Z" }`
201 → `{ "reminder": { ... } }`

### `GET /reminders?taskId=uuid`
200 → `{ "reminders": [...] }`

### `GET /reminders/due`
Recordatorios pendientes ya vencidos del usuario (para polling del frontend).
200 → `{ "reminders": [{ "task_title", "trigger_at", ... }] }`

### `POST /reminders/:id/dismiss`
Marca como `sent`. 200 → `{ "reminder": { ... } }`

### `POST /reminders/:id/snooze`
Body: `{ "minutes": 30 }`. Reprograma `trigger_at` y vuelve a `pending`.
200 → `{ "reminder": { ... } }`

### `DELETE /reminders/:id`
204 sin contenido.

Entrega real: un job server-side (`dispatchDueReminders`, cada 30s) busca
recordatorios vencidos y les manda un Web Push a cada dispositivo suscripto
del usuario, así llega la alarma aunque la app esté cerrada. El
`ReminderWatcher` del cliente (polling cada 20s + `Notification` local) queda
como fallback visual mientras la pestaña está abierta.

## Push notifications

### `GET /push/vapid-public-key`
Sin autenticación. 200 → `{ "publicKey": "..." | null }` (`null` si el backend
no tiene `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` configuradas).

### `POST /push/subscribe`
Body: `{ "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } }`
(el resultado de `PushSubscription.toJSON()` del navegador). 201 → `{ "ok": true }`.

### `POST /push/unsubscribe`
Body: `{ "endpoint": "..." }`. 204 sin contenido.

## WebAuthn (passkeys)

Ver [ARCHITECTURE.md](./ARCHITECTURE.md#autenticación-biométrica-webauthn):
`GET/POST /webauthn/register/options|verify`, `GET /webauthn/devices`,
`POST /webauthn/login/options|verify`.

## Errores

Formato uniforme:
```json
{ "error": "mensaje legible" }
```
Errores de validación (Zod) devuelven 422 con `details` (formato `flatten()` de Zod).

| Código | Significado |
|---|---|
| 401 | Token ausente, inválido o expirado |
| 404 | Recurso no encontrado o no pertenece al usuario autenticado |
| 409 | Conflicto (ej. email ya registrado) |
| 422 | Validación de body/query fallida |
| 429 | Rate limit excedido |
| 500 | Error interno no controlado |
