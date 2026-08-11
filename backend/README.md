# Inference service

This folder is the minimal deployment package for the two Phase 7–9 model pipelines. It intentionally excludes training data, notebooks, reports, and model-development code.

At process initialization, the service verifies the SHA-256 digest of every pipeline and SHAP explainer before loading it. One assessment request then runs both independently validated preprocessing/model pipelines and returns five model-derived local SHAP factors per result.

The files under `models/` are copied byte-for-byte from the validated project artifacts. Their expected digests are frozen in `service.py` and tested in `tests/test_api.py`.

`requirements.txt` is intentionally runtime-only. Install `requirements-dev.txt` when running the FastAPI `TestClient` suite in an isolated environment.
