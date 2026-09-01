# FinPilot

FinPilot is a browser-only educational finance simulation. It does not have login, account linking, a backend server, analytics, cookies, database storage, or real money movement.

## What It Does

- Landing screen with clear simulation and privacy copy
- Multi-step profile questions with inline validation
- Dashboard with simulated checking, savings, health score, and spending chart
- Data-driven financial playbook cards
- Future You projection chart with 1, 5, 10, and 20 year horizons
- JSON snapshot export/import for moving data manually between devices
- Light and dark mode

## Privacy Model

All user-entered figures are stored in `localStorage` in the browser. Exporting creates a JSON file locally with a Blob download. Importing reads a user-selected JSON file back into browser state.

There are no server calls for financial figures, no bank-linking SDKs, no auth provider, no database, and no environment variables or secrets required.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run smoke
npm run build
npm run acceptance:static
```

`npm run smoke` checks five representative profiles, malformed imported data, score bounds, projections, simulated spending, and playbook matching.
`npm run acceptance:static` checks the generated `out/` folder for required public safety copy and verifies backend/auth/bank-linking packages and files are absent.

## Static Export

```bash
npm run build
```

The static site is written to `out/`.

Preview the export locally:

```bash
python3 -m http.server 4173 --directory out
```

Open `http://localhost:4173`.

## Deployment

FinPilot can deploy as a static site to Vercel, Netlify, or GitHub Pages.

GitHub Pages workflow:
- `.github/workflows/deploy-pages.yml` runs on pushes to `master`
- The workflow runs lint, smoke tests, static export, and static acceptance checks
- The workflow publishes the `out/` directory with GitHub Pages
- GitHub Actions builds automatically use the repository name as the Next.js base path for project pages

Vercel:
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `out`

Netlify:
- Build command: `npm run build`
- Publish directory: `out`

GitHub Pages:
- Build with `npm run build`
- Publish the `out/` directory
- Or enable GitHub Pages for GitHub Actions and use the included workflow

## QA Checklist

- All five screens work without login
- Landing, dashboard, playbook, future projection, and About panel all state this is a simulation
- Negative discretionary income shows a clear warning and no `NaN`
- Income `0`, no debt, max-value inputs, and malformed imports do not crash
- Dashboard export/import round trip preserves profile data
- Playbook shows matching rule cards and general-education disclaimer
- Projection chart shows both current path and playbook path
- Mobile layout stacks cleanly around 360px width
- Dark mode remains readable
