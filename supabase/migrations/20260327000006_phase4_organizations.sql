-- Phase 4: Organizations (Team/Org Feature)

-- organizations テーブル
CREATE TABLE IF NOT EXISTS public.organizations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- organization_members テーブル
CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role            text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id
  ON public.organization_members(user_id);

CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id
  ON public.organization_members(organization_id);

-- RLS 有効化
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- organizations: 全ユーザー読み取り可
CREATE POLICY "organizations_select_all" ON public.organizations
  FOR SELECT USING (true);

-- organizations: 認証済みユーザーのみ作成可
CREATE POLICY "organizations_insert_auth" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- organizations: owner のみ削除可（organization_members で確認）
CREATE POLICY "organizations_delete_owner" ON public.organizations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- organization_members: 全ユーザー読み取り可
CREATE POLICY "organization_members_select_all" ON public.organization_members
  FOR SELECT USING (true);

-- organization_members: owner のみ追加可
CREATE POLICY "organization_members_insert_owner" ON public.organization_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'owner'
    )
    OR auth.uid() = user_id  -- 作成直後の自己追加も許可
  );

-- organization_members: owner のみ削除可
CREATE POLICY "organization_members_delete_owner" ON public.organization_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'owner'
    )
  );
