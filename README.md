# FinAccess Eswatini Web Application

Phase 11 contains three complete, light visual directions built on one shared product and API contract:

1. **The Ledger** — editorial evidence
2. **Open Field** — human-centred insight
3. **Signal** — modern fintech clarity

The root route is a concept gallery. Each concept includes Overview, Financial Inclusion, Mobile Money, Financial Access Assessment, and Methodology areas.

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

Deployment and final concept selection are intentionally outside the current Phase 11 handoff.
