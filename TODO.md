- [ ] Add `name` + `autoComplete` attributes to email/password inputs in `src/routes/login.tsx` and `src/routes/register.tsx`.
- [ ] Improve `register.tsx` signup flow: ensure we only write `profiles`/`user_roles` after a confirmed authenticated `userId` exists (or skip writes when signup requires email confirmation).
- [ ] Add more detailed UI error + console logging for Supabase signup 422 details.
- [ ] (After code changes) Run `bun test`/`bun run build` (or `npm run build`) to ensure TypeScript compiles.
- [ ] (Manual) Retest register once 429 limit is cleared; verify 401 no longer happens when RLS is correct.

