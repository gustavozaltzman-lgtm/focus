-- API key personal de Anthropic por usuario, cifrada en reposo (AES-256-GCM,
-- ver crypto.service.ts). anthropic_api_key_last4 guarda solo los últimos 4
-- caracteres en texto plano, para mostrarla en la UI sin tener que descifrar.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS anthropic_api_key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS anthropic_api_key_last4 VARCHAR(8);
