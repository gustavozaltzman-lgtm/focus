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
      Plex Mono para datos, acento bronce/dorado, ledger-edge en tareas
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
- [ ] Snooze real desde la notificación (el endpoint `/reminders/:id/snooze`
      ya existe, falta exponerlo en la UI de la notificación).
- [ ] Notificaciones con la app cerrada (requiere service worker + push
      real, ver v1.6).

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
- [ ] Pantalla de "Dispositivos" para ver/revocar passkeys registradas
      (el backend ya expone `GET /api/webauthn/devices`; falta la UI y el
      endpoint de borrado).

## v1.6 — Mobile nativo / PWA
- [ ] Manifest + service worker para instalar Focus como PWA en el teléfono
      (hoy es responsive web, no instalable).
- [ ] Push notifications reales con la app cerrada (Web Push + VAPID).
- [ ] Alternativa táctil al drag & drop de v1.3 (hoy no funciona en mobile).

## Ideas en evaluación (sin comprometer)
- Atajos de teclado estilo Things 3 / Linear (⌘K, captura global).
- Modo offline con sincronización diferida.
- App móvil (React Native) reutilizando `api/` y `types/`.
- Modo oscuro real con theme toggle (hoy el sidebar/login son oscuros por
  diseño, pero no hay alternancia).
