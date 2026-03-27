-- Phase 4: series テーブル
CREATE TABLE IF NOT EXISTS series (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_series_user_id ON series(user_id);
CREATE INDEX idx_series_created_at ON series(created_at DESC);

-- Phase 4: series_articles 中間テーブル
CREATE TABLE IF NOT EXISTS series_articles (
  series_id   UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  PRIMARY KEY (series_id, article_id)
);

CREATE INDEX idx_series_articles_series_id ON series_articles(series_id);
CREATE INDEX idx_series_articles_position ON series_articles(series_id, position);
