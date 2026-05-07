-- 短縮リンク本体
CREATE TABLE links (
  slug TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  expires_at INTEGER,
  password_hash TEXT
);
CREATE INDEX idx_links_created_at ON links(created_at DESC);

-- Passkey（WebAuthn）
CREATE TABLE passkeys (
  credential_id TEXT PRIMARY KEY,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT,
  label TEXT,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);
