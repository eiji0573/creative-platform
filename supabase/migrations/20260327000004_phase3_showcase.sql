-- Phase 3: showcase_works テーブル
CREATE TABLE IF NOT EXISTS showcase_works (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_showcase_works_user_id ON showcase_works(user_id);
CREATE INDEX idx_showcase_works_created_at ON showcase_works(created_at DESC);

-- Phase 3: image_comments テーブル
CREATE TABLE IF NOT EXISTS image_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id    UUID NOT NULL REFERENCES showcase_works(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  pos_x      FLOAT NOT NULL CHECK (pos_x >= 0 AND pos_x <= 100),
  pos_y      FLOAT NOT NULL CHECK (pos_y >= 0 AND pos_y <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_image_comments_work_id ON image_comments(work_id);
