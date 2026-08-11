# FinAccess Eswatini Web Application

This repository deploys the selected **Signal** interface and both validated machine-learning pipelines as one public Vercel application. Recruiters use one URL, no account or sign-in is required, and browser requests stay on the same domain.

## Deployment architecture

```text
Vercel project
├── web/       Next.js 16 frontend
└── backend/   FastAPI inference service + validated model artifacts

/api/*  → FastAPI service
/*      → Next.js service
```

The service split is declared in `vercel.json` using Vercel Services. It replaces the earlier cross-host Render proxy and therefore needs no public API environment variable or CORS configuration.

## Product routes

- `/` — selected Signal experience
- `/concepts/ledger` — retained Phase 11 comparison direction
- `/concepts/open-field` — retained Phase 11 comparison direction
- `/concepts/signal` — retained Signal comparison route
- `/api/health` — model and explainer integrity status
- `/api/docs` — interactive FastAPI contract
- `/api/v1/assessment` — combined assessment endpoint

## Local validation

From this repository root:

```powershell
..\.tools\node-v24.19.0-win-x64\npm.cmd --prefix web run lint
..\.tools\node-v24.19.0-win-x64\npm.cmd --prefix web run build
..\.venv\Scripts\python.exe -m unittest discover -s backend\tests -v
```

Run the two services independently during development:

```powershell
..\.venv\Scripts\uvicorn.exe backend.main:app --host 127.0.0.1 --port 8000
..\.tools\node-v24.19.0-win-x64\npm.cmd --prefix web run dev
```

For Vercel-equivalent routing, install the Vercel CLI and run `vercel dev -L` at the repository root.

## Vercel deployment

1. Import `thandofana/finaccess-eswatini-web` in Vercel.
2. Select **Services** as the project framework.
3. Keep the repository root as the project root.
4. Deploy on the Hobby plan.

No application environment variables are required. The frontend posts directly to the same-origin FastAPI route.

Vercel Services and the Python runtime are currently beta features. The application therefore keeps artifact integrity checks, health reporting, and a validated fallback deployment until the public Vercel assessment flow has passed.
