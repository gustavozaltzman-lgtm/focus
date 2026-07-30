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
  "scheduledTime": "14:30"
}
```
Todos los campos salvo `title` son opcionales. 201 → `{ "task": { ... } }`

### `POST /tasks/capture`
Captura rápida en lenguaje natural. Body: `{ "text": "Enviar reporte de costos a CDI el viernes prioridad alta" }`
El servidor interpreta contexto, fecha y prioridad automáticamente (ver
`ai-parser.service.ts`), crea el contexto si no existe, y guarda la tarea.
201 → `{ "task": { ... } }`

### `PATCH /tasks/:id`
Body parcial, mismos campos que create. Marcar `status: "completed"` setea
`completed_at` automáticamente.
200 → `{ "task": { ... } }`

### `DELETE /tasks/:id`
204 sin contenido.

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
