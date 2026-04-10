
-- Fix 1: Add DELETE policy on family_members
-- Allow the child's creator or the family member themselves to remove a membership
CREATE POLICY "Creator or self can remove family member"
ON public.family_members
FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = family_members.child_id
    AND children.created_by = auth.uid()
  )
);
