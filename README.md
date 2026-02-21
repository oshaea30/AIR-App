# AIR Career OS (MVP)

Prototype app for AIR members to manage opportunities, career pipeline, and fair-rate quoting.

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

## Included MVP flows

- Dashboard with daily action queue and core member stats.
- Opportunity Feed with AIR-style jobs, grants, fellowships, and pitch calls.
- Pipeline Tracker to move opportunities from pitch to paid.
- Pipeline sync backed by Supabase when signed in.
- Fair-Rate Assistant with quote range guidance.
- Saved opportunities and one-click "Track in Pipeline" actions.
- Member profile preferences (skills/beats/location/pay floor) for personalized ranking.
- Mentor check-in scheduler and daily reminder surfacing on dashboard.
