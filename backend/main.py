"""FastAPI service deployed alongside the Next.js frontend on Vercel."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

if __package__:
    from .schemas import AssessmentRequest, AssessmentResponse, ErrorResponse, HealthResponse
    from .service import (
        SERVICE_VERSION,
        ArtifactIntegrityError,
        InferenceError,
        PredictionService,
        get_prediction_service,
    )
else:
    from schemas import AssessmentRequest, AssessmentResponse, ErrorResponse, HealthResponse
    from service import (
        SERVICE_VERSION,
        ArtifactIntegrityError,
        InferenceError,
        PredictionService,
        get_prediction_service,
    )


app = FastAPI(
    title="FinAccess Eswatini Prediction API",
    summary="Combined financial-inclusion and mobile-money assessment API.",
    description=(
        "A portfolio proof-of-concept that validates one profile, runs two independently "
        "trained pipelines, and returns model-derived SHAP explanations."
    ),
    version=SERVICE_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

ServiceDependency = Annotated[PredictionService, Depends(get_prediction_service)]


@app.exception_handler(RequestValidationError)
async def request_validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    details = [
        {
            "field": ".".join(str(part) for part in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed.",
                "details": details,
            }
        },
    )


@app.exception_handler(InferenceError)
async def inference_error_handler(_: Request, __: InferenceError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INFERENCE_ERROR",
                "message": "The assessment could not be completed safely.",
                "details": [],
            }
        },
    )


@app.exception_handler(ArtifactIntegrityError)
async def artifact_error_handler(_: Request, __: ArtifactIntegrityError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "error": {
                "code": "SERVICE_NOT_READY",
                "message": "Validated model artifacts are unavailable or failed integrity checks.",
                "details": [],
            }
        },
    )


@app.get("/api", tags=["service"])
def service_information() -> dict[str, str]:
    return {
        "service": "FinAccess Eswatini Prediction API",
        "version": SERVICE_VERSION,
        "health": "/api/health",
        "documentation": "/api/docs",
    }


@app.get(
    "/api/health",
    response_model=HealthResponse,
    responses={503: {"model": ErrorResponse}},
    tags=["service"],
)
def health(service: ServiceDependency) -> HealthResponse:
    return HealthResponse(
        status="healthy",
        service="FinAccess Eswatini Prediction API",
        version=SERVICE_VERSION,
        models=service.health_models,
    )


@app.post(
    "/api/v1/assessment",
    response_model=AssessmentResponse,
    responses={
        422: {"model": ErrorResponse, "description": "Invalid or internally inconsistent profile."},
        500: {"model": ErrorResponse, "description": "Safe inference could not be completed."},
        503: {"model": ErrorResponse, "description": "Validated artifacts are unavailable."},
    },
    tags=["assessment"],
)
def assess_profile(request: AssessmentRequest, service: ServiceDependency) -> AssessmentResponse:
    return service.assess(request)
