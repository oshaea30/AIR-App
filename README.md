# AIR Career OS (MVP)

Prototype app for AIR members to manage opportunities, active work, and fair-rate quoting.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Note: dev and production builds use separate Next output directories to avoid chunk/CSS manifest conflicts during iterative development.

## Supabase setup

1. Copy `.env.example` to `.env.local` and fill in project credentials.
2. Run the SQL in `sql/schema.sql` inside the Supabase SQL editor.
3. Create at least one auth user from the `Auth` tab in the app.
4. Insert opportunities into `public.opportunities` or the app will keep showing seeded fallback data.

### Demo auth for tester groups

If you want simple test logins without creating Supabase users, set:

```bash
NEXT_PUBLIC_ENABLE_DEMO_AUTH=true
```

Then open the `Auth` tab and click `Enter Demo`. In demo mode, saved jobs, work tracker items, and profile/check-ins are stored in the tester's browser.

## Included MVP flows

- Dashboard with daily action queue and core member stats.
- Opportunity Feed with AIR-style jobs, grants, fellowships, and pitch calls.
- Work Tracker to move opportunities from pitch to paid.
- Work Tracker sync backed by Supabase when signed in.
- Fair-Rate Assistant with quote range guidance.
- Saved opportunities and one-click "Add to Work Tracker" actions.
- Member profile preferences (skills/beats/location/pay floor) for personalized ranking.
- Coaching check-in scheduler and daily reminders on the dashboard.
