# Athlete Collective Fund

Frontend-only MVP for **Athlete Collective Fund** — an athlete-only NIL financial literacy and recurring investment experience.

This build is intentionally **frontend-only**:

- No backend / API
- No Supabase
- No real Teamworks integration
- No real money movement
- No real investing API

All data is mocked via `lib/mockData.ts`, with calculations in `lib/calculations.ts` and a thin `localStorage` helper in `lib/storage.ts`.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts
- lucide-react

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
