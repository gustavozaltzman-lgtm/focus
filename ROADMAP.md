# ROADMAP.md

## v1.0 — Fundación (hecho)
- [x] Modelo de datos completo (users, contexts, tasks, reminders, activity_logs)
- [x] Auth JWT (registro/login)
- [x] CRUD de tareas y contextos
- [x] Captura rápida con parser rule-based (fecha, hora, prioridad, contexto)
- [x] Dashboard con "Foco de hoy" e indicadores
- [x] Inbox y vistas por contexto
- [x] Parser con IA real (`ClaudeParser`, Anthropic SDK con tool use) con
      fallback automático a `RuleBasedParser`
- [x] Captura por voz (Web Speech API del navegador) en la barra de captura rápida
- [x] Identidad visual propia (Fraunces + mono + paleta cálida, ledger-edge en tareas)
- [x] Responsive real: sidebar → bottom tab bar en mobile
- [x] Login biométrico (Face ID / Touch ID / Windows Hello / huella) vía WebAuthn

## v1.1 — Reminders activos
- [ ] Worker/cron que consulte `reminders` pendientes (`trigger_at <= now()`)
      y dispare notificaciones (email o push web).
- [ ] UI para crear/editar recordatorios asociados a una tarea.
- [ ] Snooze desde la notificación (`status = 'snoozed'`).

## v1.2 — Parser con IA (hecho, falta pulir)
- [x] `ClaudeParser` con tool use forzado (`extract_task`) + fallback a
      `RuleBasedParser`.
- [ ] Confirmación editable: mostrar la interpretación antes de guardar
      (hoy se guarda directo).

## v1.3 — Vistas de planificación
- [ ] Vista "Próximamente" (agrupada por semana).
- [ ] Vista "Algún día" con revisión periódica sugerida.
- [ ] Arrastrar y soltar entre Inbox → Hoy → Contexto.

## v1.4 — Colaboración ligera
- [ ] Compartir un contexto (proyecto) como solo-lectura con otro usuario.
- [ ] `activity_logs` visible como historial por tarea.

## v1.5 — Auth social y cuentas
- [ ] Google OAuth funcional (hoy es un contrato de UI deshabilitado).
- [ ] Vinculación de cuenta email/password ↔ Google.
- [ ] Pantalla de "Dispositivos" para ver/revocar passkeys registradas
      (el backend ya expone `GET /api/webauthn/devices`; falta la UI y el
      endpoint de borrado).

## v1.6 — Mobile nativo / PWA
- [ ] Manifest + service worker para instalar Focus como PWA en el teléfono
      (hoy es responsive web, no instalable).
- [ ] Push notifications reales (depende del worker de reminders de v1.1).

## Ideas en evaluación (sin comprometer)
- Atajos de teclado estilo Things 3 / Linear (⌘K, captura global).
- Modo offline con sincronización diferida.
- App móvil (React Native) reutilizando `api/` y `types/`.
- Modo oscuro real (hoy el sidebar/login son oscuros por diseño, pero el
  resto de la app no tiene un theme toggle).
