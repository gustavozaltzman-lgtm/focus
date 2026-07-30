# DATABASE.md

PostgreSQL puro, sin ORM. El DDL vive versionado en
[`backend/src/database/migrations/001_init.sql`](./backend/src/database/migrations/001_init.sql)
y se aplica con `npm run migrate` (runner idempotente respaldado por la tabla
`schema_migrations`).

## Diagrama de entidades

```
users (1) ───< (N) contexts
users (1) ───< (N) tasks >─── (0..1) contexts
tasks (1) ───< (N) reminders
users (1) ───< (N) activity_logs >─── (0..1) tasks
```

## DDL completo

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  color_hex VARCHAR(7) NOT NULL DEFAULT '#6366F1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT contexts_user_name_unique UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_contexts_user_id ON contexts(user_id);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context_id UUID REFERENCES contexts(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'inbox'
    CHECK (status IN ('inbox', 'today', 'upcoming', 'someday', 'completed')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  scheduled_date DATE,
  scheduled_time TIME,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_context_id ON tasks(context_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_scheduled ON tasks(user_id, scheduled_date);

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  trigger_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'snoozed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_reminders_trigger_at ON reminders(trigger_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
```

## Notas de diseño

- **UUID + `gen_random_uuid()`** (via `pgcrypto`): IDs no secuenciales, seguros
  para exponer en URLs públicas.
- **`ON DELETE CASCADE`** en `contexts→users`, `reminders→tasks`,
  `activity_logs→users`: al borrar un usuario o tarea, se limpia todo su rastro.
- **`ON DELETE SET NULL`** en `tasks.context_id`: borrar un contexto no borra
  las tareas, solo las "desclasifica".
- **`CHECK` constraints** en `status`/`priority` reemplazan tablas de lookup
  para estos enums pequeños y estables — menos joins, misma integridad.
- **Índices compuestos** (`user_id, status` y `user_id, scheduled_date`) cubren
  las consultas más frecuentes del dashboard (tareas de hoy, conteos por
  estado) sin escaneos completos.
- **`contexts_user_name_unique`**: evita contextos duplicados por usuario
  (ej. dos "CDI"), lo que también hace determinístico el matching del parser
  de lenguaje natural.
