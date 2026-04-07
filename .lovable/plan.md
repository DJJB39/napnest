

## Fix: RLS Policy Bug + Auth Redirect + End-to-End Audit

### Root Cause of the Error

The onboarding flow does this:
1. INSERT into `children` (with `.select().single()` to get the new row back)
2. INSERT into `family_members` (linking user to child)
3. UPDATE `profiles`

Step 1 fails because `.select().single()` triggers the **SELECT** RLS policy on `children`, which requires `is_family_member(auth.uid(), id)`. But the `family_members` row hasn't been created yet (that's step 2). So Supabase blocks the SELECT after the INSERT.

### Fixes

**1. Database migration -- Add a SELECT policy for child creators**

Add a new RLS policy on `children` so the person who created the child can also SELECT it (not just family members):

```sql
CREATE POLICY "Creators can view own children"
  ON public.children FOR SELECT
  USING (auth.uid() = created_by);
```

This lets the `.select().single()` succeed immediately after INSERT, before the `family_members` row exists.

**2. Auth page -- redirect after login**

`Auth.tsx` currently does nothing after a successful `signInWithPassword`. Add a `useEffect` that watches `user` from `useAuth()` and navigates to `"/"` when authenticated. The `OnboardingGate` wrapper on `"/"` will then redirect to `/onboarding` if needed.

**3. Sign out redirect**

After sign out in `AuthContext.tsx`, the user should be redirected to `/auth`. Currently `signOut` just calls `supabase.auth.signOut()` with no navigation.

### Files Changed

| File | Change |
|------|--------|
| New migration SQL | Add `Creators can view own children` SELECT policy |
| `src/pages/Auth.tsx` | Add redirect to `/` when user is authenticated |

### What This Fixes
- Onboarding "Let's go!" no longer throws RLS error
- Login redirects to dashboard (or onboarding if incomplete)
- The full signup → confirm → login → onboard → track flow works end-to-end

