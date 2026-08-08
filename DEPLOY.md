# DEPLOY.md

## 1. Neon (PostgreSQL)

1. Crear proyecto en [neon.tech](https://neon.tech).
2. Copiar la connection string (incluye `?sslmode=require`).
3. Localmente o desde CI, correr las migraciones apuntando a esa URL:
   ```bash
   cd backend
   DATABASE_URL="postgresql://...neon.tech/focus?sslmode=require" npm run migrate
   ```

## 2. Render (Backend)

1. Nuevo **Web Service** → conectar el repo → root directory `backend`.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Variables de entorno (Render → Environment):
   - `DATABASE_URL` (de Neon)
   - `JWT_SECRET` (string largo aleatorio)
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGIN` = URL del frontend en Vercel (ej. `https://focus.vercel.app`)
   - `NODE_ENV` = `production`
   - `ANTHROPIC_API_KEY` (opcional; si no se define ni hay usuarios con key
     personal propia, el parser cae al motor rule-based. Con la key, la
     captura rápida usa Claude para interpretar lenguaje natural)
   - `ANTHROPIC_API_KEYS` (opcional, alternativa a la anterior: varias keys
     separadas por coma. El backend reparte las llamadas entre ellas
     round-robin y hace failover a la siguiente si una da 401/403/429/5xx —
     ver [ARCHITECTURE.md](./ARCHITECTURE.md#pool-de-api-keys-de-anthropic-anthropic-clientservicets).
     Si está definida, tiene prioridad sobre `ANTHROPIC_API_KEY`)
   - `ANTHROPIC_POOL_OWNER_EMAIL` (opcional pero recomendada si hay más de un
     usuario: el pool de arriba (`ANTHROPIC_API_KEY`/`ANTHROPIC_API_KEYS`)
     sale de la cuenta de Anthropic de quien lo configuró. Sin esta
     variable, **ningún** usuario cae al pool sin tener su propia key
     personal cargada — con esta variable, solo el usuario con ese email
     puede usar el pool como fallback; el resto necesita cargar la suya en
     Configuración o usa el parser sin IA)
   - `ANTHROPIC_MODEL` (opcional, default `claude-haiku-4-5-20251001`)
   - `ENCRYPTION_KEY` (opcional pero recomendada: 32 bytes en base64, ej.
     `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
     Sin esto, cada usuario no puede cargar su propia API key personal de
     Anthropic desde Configuración — esa función devuelve 503 — pero el resto
     de la app funciona igual)
   - `WEBAUTHN_RP_ID` = dominio del frontend sin protocolo (ej. `focus.vercel.app`;
     en local es `localhost`). Debe coincidir exactamente con el hostname donde
     corre la SPA o el navegador rechaza el registro/login biométrico.
   - `WEBAUTHN_RP_NAME` = `Focus` (nombre mostrado en el prompt de Face ID/huella)
   - `WEBAUTHN_ORIGIN` = URL completa del frontend (ej. `https://focus.vercel.app`,
     sin `/` final)
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` (opcional; sin estas dos, el
     endpoint `/api/push/vapid-public-key` devuelve `null` y las alarmas push
     quedan deshabilitadas sin romper nada más). Se generan una sola vez con:
     ```bash
     npx web-push generate-vapid-keys
     ```
   - `VAPID_SUBJECT` (opcional, default `mailto:no-reply@focus.app`) — un
     `mailto:` de contacto que exige el protocolo Web Push.
5. Render asigna `PORT` automáticamente; `server.ts` ya lo respeta vía `env.port`.
6. Tras el primer deploy, correr las migraciones una vez (Render Shell o
   localmente apuntando a la `DATABASE_URL` de producción).

## 3. Vercel (Frontend)

1. Importar el repo en Vercel → root directory `frontend`.
2. Framework preset: **Vite**.
3. Build command: `npm run build` — Output directory: `dist`.
4. Variables de entorno:
   - `VITE_API_URL` = URL pública del backend en Render + `/api`
     (ej. `https://focus-api.onrender.com/api`)
5. `frontend/vercel.json` reescribe cualquier ruta a `/index.html` — sin
   esto, entrar directo o refrescar en una ruta que no sea `/` (ej.
   `/inbox`, `/contexts/:id`) da 404, porque Vercel busca ese path como
   archivo estático en vez de dejar que React Router lo resuelva del
   lado del cliente.
6. Deploy. Vercel detecta cada push a la rama principal.

## 4. Checklist post-deploy

- [ ] `GET {API_URL}/api/health` responde `{ "status": "ok" }`
- [ ] Registro de usuario funciona end-to-end desde el frontend desplegado
- [ ] Refrescar el navegador estando en una ruta que no sea `/` (ej.
      `/inbox`) no da 404 (requiere `frontend/vercel.json`)
- [ ] CORS no bloquea peticiones (verificar `CORS_ORIGIN` exacto, sin `/` final)
- [ ] Migraciones aplicadas en la base de producción
- [ ] `JWT_SECRET` distinto entre entornos de desarrollo y producción
- [ ] `WEBAUTHN_RP_ID` coincide exactamente con el hostname de producción (sin
      `https://`, sin path) o Face ID/huella no va a funcionar ahí
- [ ] `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` configuradas si querés que las
      alarmas suenen con la app cerrada (`GET /api/push/vapid-public-key`
      debe devolver una key, no `null`)
- [ ] `ENCRYPTION_KEY` configurada si vas a usar API keys personales por
      usuario (`PUT /api/auth/anthropic-key` no debe devolver 503)
- [ ] `ANTHROPIC_POOL_OWNER_EMAIL` configurada con tu email si hay más de un
      usuario en la app — sin esto nadie (ni vos) cae al pool compartido sin
      key propia; con ella, solo vos
