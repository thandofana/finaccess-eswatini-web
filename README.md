# FinAccess Eswatini Web

The deployable FinAccess Eswatini product: a responsive Next.js interface and a FastAPI inference service containing two validated model pipelines and their model-matched SHAP explainers.

[Open the live application](https://finaccess-eswatini.vercel.app) | [Interactive API documentation](https://finaccess-eswatini.vercel.app/api/docs)

![FinAccess Eswatini overview](docs/screenshots/overview.png)

## Product experience

The selected **Signal** direction presents five connected areas:

- Overview of weighted access estimates and analytical patterns
- Financial-inclusion evidence and Model 1 insights
- Mobile-money evidence and Model 2 insights
- One Financial Access Assessment that returns both predictions
- Methodology, leakage controls, evaluation, and explainability

The result hierarchy leads with a clear answer, followed by a supporting probability and five signed factors generated from the relevant SHAP explainer.

![Two-model assessment result](docs/screenshots/assessment-results.png)

## Deployment architecture

```text
Vercel project
|-- web/       Next.js 16 frontend
`-- backend/   FastAPI service and validated model artifacts

/api/*  -> FastAPI service
/*      -> Next.js service
```

The split is declared in `vercel.json` using Vercel Services. Browser requests stay on one HTTPS origin, so the assessment needs no public backend URL or normal-path CORS configuration.

## Public routes

| Route | Purpose |
|---|---|
| `/` | Selected Signal product experience |
| `/concepts/ledger` | Archived Phase 11 editorial direction |
| `/concepts/open-field` | Archived Phase 11 public-interest direction |
| `/concepts/signal` | Signal comparison route |
| `/api/health` | Model, explainer, and artifact-integrity status |
| `/api/docs` | Interactive FastAPI contract |
| `/api/v1/assessment` | Combined two-model assessment endpoint |

## Repository layout

```text
web/                    Next.js application, visualizations, and rendered-route tests
backend/                FastAPI schemas, service layer, API tests, and model artifacts
docs/screenshots/       Fresh screenshots captured from the live public application
vercel.json             Multi-service build and routing contract
.vercelignore           Minimal deployment package allowlist/exclusions
```

## Local development

From the parent project directory:

```powershell
.\.venv\Scripts\uvicorn.exe frontend.backend.main:app --host 127.0.0.1 --port 8000
.\.tools\node-v24.19.0-win-x64\npm.cmd --prefix frontend\web run dev
```

For a Vercel-equivalent local route map, install the Vercel CLI and run `vercel dev -L` from this repository root.

## Validation

```powershell
..\.tools\node-v24.19.0-win-x64\npm.cmd --prefix web run lint
..\.tools\node-v24.19.0-win-x64\npm.cmd --prefix web run build
..\.tools\node-v24.19.0-win-x64\npm.cmd --prefix web test
..\.venv\Scripts\python.exe -m unittest discover -s backend\tests -v
```

Production validation additionally checks public unauthenticated access, prediction equivalence with the Phase 10 reference response, invalid-input rejection, same-origin routing, all six model/explainer artifacts, microdata exclusion, and secret-file safety.

## Deployment

1. Import `thandofana/finaccess-eswatini-web` into Vercel.
2. Select **Services** as the project framework.
3. Keep this repository root as the project root.
4. Deploy on the Hobby plan.

No application environment variables are required. The validated release can also be published with the authenticated Vercel CLI. Automatic Git deployments require the Vercel GitHub App to have access to this repository.

## Scope and limitations

- Submitted profiles are not persisted by the application.
- Raw and processed respondent microdata are not included in this repository.
- Artifact hashes are verified before the API reports healthy.
- Vercel Services and its Python runtime should be regression-tested as platform features evolve.
- The application is a portfolio proof of concept, not a production financial decision or eligibility system.

Developed by **Thando F. Dlamini**.
