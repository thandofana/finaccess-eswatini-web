# FinAccess Eswatini Web Application

The selected Signal interface is the production homepage. The repository also retains the two alternative Phase 11 design routes for portfolio comparison:

1. **The Ledger** — editorial evidence
2. **Open Field** — human-centred insight
3. **Signal** — modern fintech clarity

The root route opens Signal directly. Each direction includes Overview, Financial Inclusion, Mobile Money, Financial Access Assessment, and Methodology areas.

## Easiest review

Double-click `OPEN_DESIGN_REVIEW.cmd` in the main project folder. It opens a self-contained offline gallery with all three concepts and requires no API, server, or command window.

## Local development

Start the Phase 10 API from the repository root, then start the frontend from this directory:

```powershell
..\.tools\node-v24.19.0-win-x64\npm.cmd run dev
```

The frontend proxy uses `FINACCESS_API_URL`, defaulting to `http://127.0.0.1:8000`. Copy `.env.example` to `.env.local` only when a different local API address is required.

## Validation

```powershell
..\.tools\node-v24.19.0-win-x64\npm.cmd run lint
..\.tools\node-v24.19.0-win-x64\npm.cmd test
```

The production dependency audit, standalone build, and Render-style proxy smoke test are run with:

```powershell
..\.tools\node-v24.19.0-win-x64\npm.cmd audit --omit=dev
..\.tools\node-v24.19.0-win-x64\npm.cmd run build
..\.venv\Scripts\python.exe .\scripts\validate_render_server.py --node ..\.tools\node-v24.19.0-win-x64\node.exe
```

## Render deployment

`render.yaml` defines a Frankfurt Node web service. The build produces vinext's standalone Node server, and `FINACCESS_API_URL` routes the same-origin assessment proxy to the separately hosted FastAPI service.

The Render build and start commands are:

```text
npm ci && npm run build
npm start
```
