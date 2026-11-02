<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Hero backgrounds are bundled static files in `public/hero/` referenced by plain paths (`/hero/*.jpg`), not Lovable `.asset.json` pointers — the site must render correctly on external hosts (e.g. Vercel) with no Lovable asset proxy.
- Fresh-database onboarding is handled by the `bootstrap_first_admin` trigger (migration 0001 / `supabase/setup.sql`): with zero admins, the first signup gets an approved profile and the admin role. Keep `supabase/setup.sql` in sync with new migrations.
