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
   - `ANTHROPIC_API_KEY` (opcional; si no se define, el parser cae al motor
     rule-based. Con la key, la captura rápida usa Claude para interpretar
     lenguaje natural)
   - `ANTHROPIC_MODEL` (opcional, default `claude-haiku-4-5-20251001`)
   - `WEBAUTHN_RP_ID` = dominio del frontend sin protocolo (ej. `focus.vercel.app`;
     en local es `localhost`). Debe coincidir exactamente con el hostname donde
     corre la SPA o el navegador rechaza el registro/login biométrico.
   - `WEBAUTHN_RP_NAME` = `Focus` (nombre mostrado en el prompt de Face ID/huella)
   - `WEBAUTHN_ORIGIN` = URL completa del frontend (ej. `https://focus.vercel.app`,
     sin `/` final)
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
5. Deploy. Vercel detecta cada push a la rama principal.

## 4. Checklist post-deploy

- [ ] `GET {API_URL}/api/health` responde `{ "status": "ok" }`
- [ ] Registro de usuario funciona end-to-end desde el frontend desplegado
- [ ] CORS no bloquea peticiones (verificar `CORS_ORIGIN` exacto, sin `/` final)
- [ ] Migraciones aplicadas en la base de producción
- [ ] `JWT_SECRET` distinto entre entornos de desarrollo y producción
- [ ] `WEBAUTHN_RP_ID` coincide exactamente con el hostname de producción (sin
      `https://`, sin path) o Face ID/huella no va a funcionar ahí
