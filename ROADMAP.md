# ROADMAP.md

## v1.0 — Fundación (hecho)
- [x] Modelo de datos completo (users, contexts, tasks, reminders, activity_logs)
- [x] Auth JWT (registro/login)
- [x] CRUD completo de tareas (crear/editar/eliminar con título, descripción,
      contexto, prioridad, fecha, hora, estado) y de contextos (crear/editar/
      eliminar con paleta de color)
- [x] Captura rápida con parser rule-based (fecha, hora, prioridad, contexto)
- [x] Dashboard con "Foco de hoy" e indicadores
- [x] Inbox y vistas por contexto
- [x] Parser con IA real (`ClaudeParser`, Anthropic SDK con tool use) con
      fallback automático a `RuleBasedParser`
- [x] Identidad visual: Inter (jerarquía por peso/tracking, sin serif) + IBM
      Plex Mono para datos, acento coral/energético ("Dopamina & Energía"),
      ledger-edge en tareas
- [x] Responsive real: sidebar → bottom tab bar en mobile (4 pestañas: Hoy,
      Inbox, Planificar, Contextos)
- [x] Login biométrico (Face ID / Touch ID / Windows Hello / huella) vía
      WebAuthn, con email recordado para no tipearlo cada vez

## v1.1 — Reminders activos (hecho)
- [x] Worker cada 5 min que marca `sent` los recordatorios vencidos hace más
      de 10 min sin que nadie los haya visto (red de seguridad).
- [x] UI para crear/quitar recordatorios desde el editor de tarea.
- [x] Alarma in-app: polling de `/reminders/due` cada 20s mientras la app está
      abierta, dispara una Notification del navegador y hace dismiss.
- [x] Web Push real: job server-side (`dispatchDueReminders`, cada 30s) manda
      la alarma a cada dispositivo suscripto via VAPID/`web-push`, así llega
      aunque la app esté cerrada. Botón "Activar alarmas aunque la app esté
      cerrada" en el sidebar/header móvil registra el service worker
      (`public/sw.js`) y la suscripción (`push_subscriptions`). El polling
      cliente queda como fallback visual mientras la pestaña está abierta.
- [ ] Snooze real desde la notificación (el endpoint `/reminders/:id/snooze`
      ya existe, falta exponerlo en la UI de la notificación push).

## v1.2 — Parser con IA (hecho)
- [x] `ClaudeParser` con tool use forzado (`extract_task`) + fallback a
      `RuleBasedParser`.
- [x] Confirmación editable: la captura rápida llama a
      `/tasks/capture/preview` (no persiste nada) y abre el editor de tarea
      precargado para confirmar o corregir antes de guardar.

## v1.3 — Vistas de planificación (hecho)
- [x] Vista "Próximamente" (`/planning`) agrupada por semana (Esta semana /
      Próxima semana / Más adelante / Sin fecha).
- [x] Vista "Algún día" en la misma página.
- [x] Arrastrar y soltar: filas de tarea arrastrables hacia Hoy/Inbox/
      Próximamente/un contexto en el sidebar (HTML5 DnD, solo desktop/mouse
      — sin alternativa táctil todavía).
- [x] Promoción automática: un job server-side (`promoteDueUpcomingTasks`,
      una vez por día + una vez al arrancar) pasa solo a "Hoy" cualquier tarea
      en "Próximamente" cuya `scheduled_date` ya llegó o pasó — no hace
      falta moverla a mano cuando se cumple la fecha.

## v1.4 — Colaboración ligera (hecho)
- [x] Compartir un contexto de solo lectura por email (`context_shares`);
      el invitado lo ve en "Compartido conmigo" y accede a una vista
      read-only (`/shared/:id`) sin poder editar (el scoping por `user_id`
      en las tareas ya lo impide a nivel de API).
- [x] `activity_logs` visible como historial colapsable en el editor de
      tarea.
- [ ] Revocar el propio acceso desde el lado del invitado (hoy solo el
      dueño puede quitar el share).

## v1.5 — Auth social y cuentas
- [ ] Google OAuth funcional (hoy es un contrato de UI deshabilitado).
- [ ] Vinculación de cuenta email/password ↔ Google.
- [x] Ver/revocar passkeys registradas: `DELETE /api/webauthn/devices/:id`
      y una lista simple en Configuración (`BiometricDevicesList.tsx`) con
      botón "Quitar" por dispositivo.

## v1.6 — Mobile nativo / PWA
- [x] Manifest (`manifest.webmanifest`, standalone + iconos 192/512/maskable)
      + service worker con `fetch`/`install`/`activate` registrado
      incondicionalmente al cargar la app (`main.tsx`) — Focus es instalable
      como PWA en Android/desktop Chrome y "Agregar a inicio" en iOS Safari.
- [ ] Alternativa táctil al drag & drop de v1.3 (hoy no funciona en mobile).

## v1.7 — Foco de ejecución e import externo
- [x] Modo enfoque (`FocusModeModal`): revisa las tareas de "Foco de hoy" de
      a una (ordenadas por fecha/hora), con Completar/Más tarde/Editar y
      barra de progreso — en vez de tener que recorrer toda la lista a
      simple vista.
- [x] Botón "Importar fichas" en Inbox: el navegador lee un `.txt` local
      (texto pegado de correos, formato `FICHA N` / `Título` / `Descripción`
      / `Prioridad`) y lo manda a `POST /tasks/import-fichas`, que crea una
      tarea por ficha nueva (idempotente por título). Pensado para desktop —
      en mobile el selector de archivos es más incómodo. También existe como
      script (`npm run import-fichas`) para uso desde línea de comandos.
- [ ] Automatizar el import sin intervención manual (hoy hay que tocar el
      botón o correr el script cada vez) — requeriría una Tarea Programada
      de Windows local, ya que el backend en Render no puede leer el
      filesystem del usuario.

## v1.8 — Diferenciales de IA para uso profesional (hecho)
Investigado en Reddit/comparativas de apps (Todoist, TickTick, Sunsama,
Motion) y priorizado para el caso de uso real: profesional de ventas que
importa acciones de correos.
- [x] `due_date` separado de `scheduled_date`: "cuándo lo voy a hacer" vs.
      "cuándo vence de verdad", como campos independientes en el editor de
      tarea. `countOverdueTasks` y la promoción Próximamente→Hoy consideran
      ambas fechas.
- [x] `source_ref`: campo de texto libre en el editor de tarea para anotar
      de dónde salió (asunto del mail, remitente, o un link) y no perder el
      contexto cuando se retoma más adelante.
- [x] "¿Qué hago ahora?" (`GET /tasks/suggest-next`): Claude elige 2-3
      tareas pendientes para atacar ya, con una razón breve, priorizando
      vencidas/por vencer y alta prioridad. Se puede pasar directo a Modo
      enfoque con esas tareas. Acción explícita del usuario (botón), no
      automática — no gasta saldo de API sin que lo pidas.
- [x] Seguimiento con IA (`POST /tasks/:id/draft-followup`): en el editor de
      cualquier tarea existente, un botón le pide a Claude un borrador corto
      de email de seguimiento basado en el título/descripción — para copiar
      y pegar, nunca se envía nada automáticamente. También on-demand.
- Ambas features de IA degradan con un mensaje claro (503) si
  `ANTHROPIC_API_KEY` no está configurada, sin romper el resto de la app.

## v1.9 — Resiliencia y costo de IA (hecho)
- [x] Pool multi-key de Anthropic (`ANTHROPIC_API_KEYS`, separadas por coma):
      reparte las llamadas round-robin entre varias keys y hace failover
      automático a la siguiente si una da 401/403/429/5xx, para no depender
      de una sola key del servidor.
- [x] API key personal de Anthropic por usuario: cada uno puede cargar la
      suya desde Configuración (cifrada en reposo con `ENCRYPTION_KEY`,
      AES-256-GCM); si está configurada, se usa en vez del pool compartido
      del servidor para captura con IA, "¿Qué hago ahora?" y seguimiento —
      así cada usuario paga su propio consumo.
- [x] Fix: `import-fichas` no reconocía encabezados `FICHA #N` (con
      numeral), solo `FICHA N` — el regex ahora acepta ambos formatos.
- [x] `import-fichas` ahora también lee `Fecha`, `Contexto`, `Estado` y
      `Fuente` de cada ficha (antes solo tomaba título/descripción/prioridad
      y todo entraba a Inbox sin fecha ni contexto). Crea el contexto si
      hace falta, igual que el parser de captura con IA.
- [x] El fallback al pool compartido (`ANTHROPIC_API_KEYS`) queda reservado
      a `ANTHROPIC_POOL_OWNER_EMAIL` — se detectó que cualquier usuario sin
      key propia estaba usando el pool (y por lo tanto el saldo de Anthropic
      de quien lo configuró) sin que nadie se lo pidiera. Sin esa variable,
      nadie cae al pool sin key personal.

## v1.10 — Auditoría de seguridad (hecho)
Auditoría completa antes de compartir la app con un segundo usuario. Todos
los hallazgos, de Alta a Baja, resueltos el mismo día:

- [x] **Alta** — control de acceso roto: `createTask`/`updateTask` no
      validaban que un `contextId` recibido perteneciera al usuario
      autenticado. Alguien con acceso de solo lectura a un contexto
      compartido podía inyectarle tareas propias, porque la vista de
      contexto compartido no filtra por dueño de la tarea. Fix:
      `assertOwnsContext` en `task.service.ts`.
- [x] **Media** — `rejectUnauthorized: false` en la conexión a Postgres
      (sin verificación de certificado TLS); `trust proxy` ausente en
      Express (rate limiter podía contar por la IP del proxy de Render en
      vez de la del cliente); `react-router-dom` desactualizado con CVEs —
      migrado de 6.25 a 7.18 (breaking, sin cambios de código necesarios).
- [x] **Baja** — algoritmo JWT fijado a `HS256` en sign/verify; enumeración
      de usuarios vía `/webauthn/login/options` cerrada (misma respuesta
      200 exista o no el email); logs de Anthropic sin el objeto de error
      completo; `helmet()` con cabeceras de seguridad estándar; `TtlMap`
      con expiración de 5 min para los challenges de WebAuthn (antes
      crecían sin límite); `.claude/` agregado a `.gitignore`.
- [x] Ver/revocar passkeys registradas: `DELETE /api/webauthn/devices/:id`
      y una lista simple en Configuración (`BiometricDevicesList.tsx`) con
      botón "Quitar" por dispositivo — quedaba pendiente desde v1.5.
- [x] Fix: transición entre tarjetas en Modo enfoque "rebotaba" en mobile —
      la animación de salida se quedaba corta contra lo que ya se había
      arrastrado. Ahora es direccional y el contenedor recorta el
      desborde durante el swipe.
- [x] Botones "¿Qué hago ahora?" (coral) y "Completar" en Modo enfoque
      (verde) con su propio color en vez del gris "ghost" genérico.

## v1.11 — Modo oscuro (hecho)
- [x] Ícono de Configuración: era un círculo con 8 rayos (se confundía con
      un sol) — ahora es un engranaje de verdad.
- [x] Toggle día/noche en Configuración (`ThemeToggle.tsx`, reutiliza el
      ícono de sol que quedó libre + uno de luna). Persistente
      (`localStorage`), arranca en el tema del sistema operativo la primera
      vez, se aplica antes del primer render para no parpadear.
- [x] Paleta completa con variante oscura: toda la app (no solo un par de
      pantallas) repinta sola porque los colores son variables CSS
      (`--c-*` en `index.css`) en vez de hex fijos — ver
      [ARCHITECTURE.md](./ARCHITECTURE.md#tema-claridad-y-oscuro-theme).

## Ideas en evaluación (sin comprometer)
- Atajos de teclado estilo Things 3 / Linear (⌘K, captura global).
- Modo offline con sincronización diferida.
- App móvil (React Native) reutilizando `api/` y `types/`.
