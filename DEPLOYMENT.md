# Deploying Partner Hub to a brand-new database

This guide gets the site live with a completely fresh, empty database in
three steps — no data or setup carried over from the Lovable project.

## Step 1 — Create the database schema

1. Create a new Supabase project (or use the database that comes with your
   Lovable Cloud setup).
2. Open the SQL editor and run **`supabase/setup.sql`** (the whole file).
   This creates every table, all access rules, and the "first signup
   becomes admin" bootstrap.
3. *(Optional)* To explore with sample partners, also run
   **`supabase/demo-seed.sql`**. Skip this for production.

## Step 2 — First admin

With an empty database there is no admin yet, so the **very first account
that signs up at `/auth` automatically becomes the network admin** — it is
approved and granted the admin role. Every signup after that goes into the
normal pending-approval queue for admins to accept.

If you ran the demo seed, the demo admin account already exists and the
next real signup will be a pending agent instead. **Change or delete the
demo admin's password immediately if you keep it.**

## Step 3 — Environment variables

Copy `.env.example` into your host's environment settings (Vercel →
Project → Settings → Environment Variables) and fill in the values from
your Supabase project:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — used by the browser.
- `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` — used by server functions.
  Set them to the **same** URL and publishable key as the VITE_ pair, so
  one configuration serves both sides.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only secret. Never prefix it with
  `VITE_`.

## Step 4 — Deploy

1. Push this repository to GitHub and import it into Vercel.
2. Vercel detects the Vite setup automatically: build command
   `npm run build`, install `npm install`. Use Node 20+.
3. Deploy, then sign up at `/auth` (Step 2 above) and start approving
   partners from the admin panel.

## Notes

- Hero images are bundled as regular static files under `public/hero/`, so
  they work on any host — no external asset service needed.
- When there are no approved partners yet, the Ecom and Executive home
  pages show an onboarding card with an "Apply to join" link instead of a
  blank partner list.
- New agents invited through the dashboard receive an email invite and
  stay unapproved until an admin approves them.
