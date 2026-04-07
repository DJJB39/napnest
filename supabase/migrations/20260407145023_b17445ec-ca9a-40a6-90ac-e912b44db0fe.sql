
-- 1. Fix invites SELECT: remove public readable policy, scope to invited user or creator
DROP POLICY "Anyone can read invite by token" ON invites;

CREATE POLICY "Invited user or creator can view invites"
ON invites FOR SELECT
USING (
  auth.jwt() ->> 'email' = email
  OR auth.uid() = invited_by
);

-- 2. Fix invites UPDATE: scope to invite owner or invited user accepting
DROP POLICY "Authenticated can update invites" ON invites;

CREATE POLICY "Invite owner or recipient can update invite"
ON invites FOR UPDATE
USING (
  auth.uid() = invited_by
  OR (auth.jwt() ->> 'email' = email AND status = 'pending')
);

-- 3. Fix family_members INSERT: require creator or valid invite
DROP POLICY "Users can insert family memberships" ON family_members;

CREATE POLICY "Creator or invited user can join family"
ON family_members FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Child creator can add themselves
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_members.child_id
        AND children.created_by = auth.uid()
    )
    OR
    -- User with a valid pending invite can join
    EXISTS (
      SELECT 1 FROM invites
      WHERE invites.child_id = family_members.child_id
        AND invites.email = auth.jwt() ->> 'email'
        AND invites.status = 'pending'
        AND invites.expires_at > now()
    )
  )
);
