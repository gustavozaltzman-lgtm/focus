# ROADMAP.md

## v1.0 — Fundación (actual)
- [x] Modelo de datos completo (users, contexts, tasks, reminders, activity_logs)
- [x] Auth JWT (registro/login)
- [x] CRUD de tareas y contextos
- [x] Captura rápida con parser rule-based (fecha, hora, prioridad, contexto)
- [x] Dashboard con "Foco de hoy" e indicadores
- [x] Inbox y vistas por contexto

## v1.1 — Reminders activos
- [ ] Worker/cron que consulte `reminders` pendientes (`trigger_at <= now()`)
      y dispare notificaciones (email o push web).
- [ ] UI para crear/editar recordatorios asociados a una tarea.
- [ ] Snooze desde la notificación (`status = 'snoozed'`).

## v1.2 — Parser con IA real
- [ ] Implementar `OpenAiParser` (misma interfaz `NaturalLanguageParser`) usando
      OpenAI SDK con function calling para extraer título/fecha/contexto/prioridad
      con mayor tolerancia a ambigüedad que el motor de Regex.
- [ ] Fallback automático al `RuleBasedParser` si la llamada a IA falla o no hay
      `OPENAI_API_KEY` configurada.
- [ ] Confirmación editable: mostrar la interpretación de la IA antes de guardar.

## v1.3 — Vistas de planificación
- [ ] Vista "Próximamente" (agrupada por semana).
- [ ] Vista "Algún día" con revisión periódica sugerida.
- [ ] Arrastrar y soltar entre Inbox → Hoy → Contexto.

## v1.4 — Colaboración ligera
- [ ] Compartir un contexto (proyecto) como solo-lectura con otro usuario.
- [ ] `activity_logs` visible como historial por tarea.

## v1.5 — Auth social real
- [ ] Google OAuth funcional (hoy es un contrato de UI deshabilitado).
- [ ] Vinculación de cuenta email/password ↔ Google.

## Ideas en evaluación (sin comprometer)
- Atajos de teclado estilo Things 3 / Linear (⌘K, captura global).
- Modo offline con sincronización diferida.
- App móvil (React Native) reutilizando `api/` y `types/`.
