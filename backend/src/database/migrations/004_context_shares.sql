-- Compartir un contexto (proyecto) de solo lectura con otro usuario
CREATE TABLE IF NOT EXISTS context_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_id UUID NOT NULL REFERENCES contexts(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT context_shares_unique UNIQUE (context_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS idx_context_shares_context_id ON context_shares(context_id);
CREATE INDEX IF NOT EXISTS idx_context_shares_shared_with ON context_shares(shared_with_user_id);
