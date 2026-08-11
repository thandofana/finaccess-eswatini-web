"""Immutable, process-cached inference for the Vercel FastAPI service."""

from __future__ import annotations

import hashlib
import threading
import uuid
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Sequence

import joblib
import numpy as np
import pandas as pd

if __package__:
    from .schemas import AssessmentRequest, AssessmentResponse, ExplanationFactor, PredictionResult
else:
    from schemas import AssessmentRequest, AssessmentResponse, ExplanationFactor, PredictionResult


BACKEND_ROOT = Path(__file__).resolve().parent
MODEL_DIR = BACKEND_ROOT / "models"
SERVICE_VERSION = "1.1.0"
ADDITIVITY_TOLERANCE = 1e-8
PURPOSE = (
    "Estimate whether an individual profile is likely to be financially included "
    "and likely to use mobile money."
)
DISCLAIMER = (
    "This proof-of-concept explains model predictions, not causation, eligibility, "
    "creditworthiness, or an official World Bank classification."
)

COMMON_FEATURES = (
    "female",
    "age_group",
    "educ",
    "inc_q",
    "emp_in",
    "fin24c",
)
MODEL1_FEATURES = COMMON_FEATURES + (
    "internet_use",
    "phone_access_tier",
    "con11",
    "con12",
    "con14",
    "con16",
    "con18",
    "con20",
    "fin46",
)
MODEL2_FEATURES = COMMON_FEATURES + (
    "internet_engagement_level",
    "phone_access_tier",
    "con11",
    "con12",
    "con14",
    "con16",
    "con18",
    "con20",
    "data_purchase_pattern",
    "fin46",
)

FEATURE_LABELS = {
    "female": "gender",
    "age_group": "age group",
    "educ": "education level",
    "inc_q": "income quintile",
    "emp_in": "workforce status",
    "fin24c": "natural-disaster or severe-weather experience",
    "internet_use": "recent internet use",
    "internet_engagement_level": "internet engagement",
    "phone_access_tier": "phone access tier",
    "data_purchase_pattern": "data-purchase pattern",
    "con11": "SIM registration in own name",
    "con12": "mobile-phone use frequency",
    "con14": "ability to read a text message",
    "con16": "ability to send a text message",
    "con18": "phone PIN or password",
    "con20": "rules imposed on own-phone use",
    "fin46": "ID ownership",
}


class ArtifactIntegrityError(RuntimeError):
    """Raised when a saved model or explainer fails its immutable contract."""


class InferenceError(RuntimeError):
    """Raised when a validated request cannot be evaluated safely."""


@dataclass(frozen=True)
class ModelSpec:
    key: str
    target: str
    model_label: str
    question: str
    features: tuple[str, ...]
    pipeline_file: str
    pipeline_sha256: str
    explainer_file: str
    explainer_sha256: str


SPECS = (
    ModelSpec(
        key="model1",
        target="account_fin",
        model_label="Financial Inclusion",
        question="Based on the characteristics provided, is this person likely to be financially included?",
        features=MODEL1_FEATURES,
        pipeline_file="model1_financial_inclusion_pipeline.joblib",
        pipeline_sha256="467e5519c022a0c716e38bae3f7b44752b4a50da6553720541d75efcb5d2b7b3",
        explainer_file="model1_shap_explainer.joblib",
        explainer_sha256="ee6ff974c8295dc41948823786efb81d1e8c67bf015c3d20cee3dff370a932d0",
    ),
    ModelSpec(
        key="model2",
        target="account_mob",
        model_label="Mobile Money Adoption",
        question="Based on the characteristics provided, is this person likely to use mobile money?",
        features=MODEL2_FEATURES,
        pipeline_file="model2_mobile_money_pipeline.joblib",
        pipeline_sha256="3df51a31fc420043b8e386c73d2a46771cafe64a619d69faf6fd5a2db12d7606",
        explainer_file="model2_shap_explainer.joblib",
        explainer_sha256="0b36cf5d7208854125f5c0b14a1f84939bedebdc95b8a67c79afc20bd47a5033",
    ),
)


@dataclass(frozen=True)
class ModelRuntime:
    spec: ModelSpec
    pipeline: object
    bundle: dict[str, object]
    learned_categories: dict[str, frozenset[str]]


def file_hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def learned_categories(pipeline: object, features: Sequence[str]) -> dict[str, frozenset[str]]:
    encoder = pipeline.named_steps["preprocess"].named_transformers_["categorical"].named_steps["onehot"]
    return {
        feature: frozenset(str(value) for value in categories)
        for feature, categories in zip(features, encoder.categories_, strict=True)
    }


def explanation_arrays(explainer: object, transformed: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    explanation = explainer(transformed)
    values = np.asarray(explanation.values, dtype=float)
    base = np.asarray(explanation.base_values, dtype=float)
    if values.ndim == 3:
        values = values[:, :, 1]
    if base.ndim > 1:
        base = base[:, 1]
    if base.ndim == 0:
        base = np.repeat(float(base), len(transformed))
    return values, base.reshape(-1)


def probability_from_log_odds(value: float) -> float:
    if value >= 0:
        return float(1.0 / (1.0 + np.exp(-value)))
    exponential = np.exp(value)
    return float(exponential / (1.0 + exponential))


def prediction_statement(model_key: str, probability: float) -> str:
    if model_key == "model1":
        return (
            "This person is likely to be financially included."
            if probability >= 0.5
            else "This person is unlikely to be financially included."
        )
    return (
        "This person is likely to use mobile money."
        if probability >= 0.5
        else "This person is unlikely to use mobile money."
    )


def local_factors(
    spec: ModelSpec,
    profile: pd.Series,
    shap_row: np.ndarray,
    mapping: pd.DataFrame,
    top_n: int = 5,
) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for feature in spec.features:
        positions = mapping.loc[mapping["source_feature"] == feature, "encoded_index"].to_numpy()
        contribution = float(shap_row[positions].sum())
        direction = "increased" if contribution > 0 else "reduced" if contribution < 0 else "did not change"
        label = FEATURE_LABELS.get(feature, feature.replace("_", " "))
        rows.append(
            {
                "source_feature": feature,
                "feature_label": label,
                "profile_value": str(profile[feature]),
                "shap_log_odds": contribution,
                "direction": direction,
                "explanation_text": (
                    f"{label.capitalize()} ({profile[feature]}) {direction} the prediction "
                    "relative to the model baseline."
                ),
            }
        )
    rows.sort(key=lambda item: abs(float(item["shap_log_odds"])), reverse=True)
    return rows[:top_n]


def explain_profile(runtime: ModelRuntime, profile: pd.DataFrame) -> dict[str, object]:
    spec = runtime.spec
    if profile.shape[0] != 1 or profile.columns.tolist() != list(spec.features):
        raise ValueError(f"Profile must have one row and exact {spec.key} feature order.")
    if runtime.bundle.get("pipeline_sha256") != spec.pipeline_sha256:
        raise ValueError("Explainer bundle is not matched to the validated model.")

    transformed = runtime.pipeline.named_steps["preprocess"].transform(profile)
    values, base = explanation_arrays(runtime.bundle["explainer"], transformed)
    raw = float(runtime.pipeline.named_steps["model"].decision_function(transformed)[0])
    reconstructed_raw = float(base[0] + values[0].sum())
    if abs(raw - reconstructed_raw) > ADDITIVITY_TOLERANCE:
        raise RuntimeError("SHAP contributions do not reconstruct the model raw score.")

    probability = float(runtime.pipeline.predict_proba(profile)[0, 1])
    mapping = pd.DataFrame(runtime.bundle["feature_mapping"])
    return {
        "question": spec.question,
        "prediction_statement": prediction_statement(spec.key, probability),
        "probability": probability,
        "threshold": 0.5,
        "baseline_probability": probability_from_log_odds(float(base[0])),
        "factors": local_factors(spec, profile.iloc[0], values[0], mapping),
    }


class PredictionService:
    """Load validated artifacts once and produce both predictions from one profile."""

    def __init__(self) -> None:
        self._runtimes: dict[str, ModelRuntime] = {}
        self._lock = threading.RLock()
        for spec in SPECS:
            pipeline_path = MODEL_DIR / spec.pipeline_file
            explainer_path = MODEL_DIR / spec.explainer_file
            if not pipeline_path.is_file() or not explainer_path.is_file():
                raise ArtifactIntegrityError(f"{spec.key} deployment artifacts are missing.")
            if file_hash(pipeline_path) != spec.pipeline_sha256:
                raise ArtifactIntegrityError(f"{spec.key} pipeline failed its SHA-256 integrity check.")
            if file_hash(explainer_path) != spec.explainer_sha256:
                raise ArtifactIntegrityError(f"{spec.key} explainer failed its SHA-256 integrity check.")

            pipeline = joblib.load(pipeline_path)
            bundle = joblib.load(explainer_path)
            if bundle.get("pipeline_sha256") != spec.pipeline_sha256 or bundle.get("model") != spec.key:
                raise ArtifactIntegrityError(f"{spec.key} model and explainer are not a validated pair.")
            self._runtimes[spec.key] = ModelRuntime(
                spec=spec,
                pipeline=pipeline,
                bundle=bundle,
                learned_categories=learned_categories(pipeline, spec.features),
            )

    @property
    def health_models(self) -> list[dict[str, str]]:
        return [
            {
                "model": runtime.spec.key,
                "target": runtime.spec.target,
                "status": "ready",
                "pipeline_sha256": runtime.spec.pipeline_sha256,
                "explainer_sha256": runtime.spec.explainer_sha256,
            }
            for runtime in self._runtimes.values()
        ]

    @staticmethod
    def warnings(runtime: ModelRuntime, profile: pd.DataFrame) -> list[str]:
        messages: list[str] = []
        for feature in runtime.spec.features:
            value = str(profile.iloc[0][feature])
            if value not in runtime.learned_categories[feature]:
                messages.append(
                    f"{runtime.spec.model_label} did not observe {feature}={value!r} in its training "
                    "partition; the fitted encoder safely treats it as an unseen category."
                )
        return messages

    @staticmethod
    def result(model_key: str, explanation: dict[str, object], warnings: list[str]) -> PredictionResult:
        direction_map = {
            "increased": "increased_likelihood",
            "reduced": "reduced_likelihood",
            "did not change": "neutral",
        }
        factors = [
            ExplanationFactor(
                feature=str(factor["source_feature"]),
                label=str(factor["feature_label"]),
                value=str(factor["profile_value"]),
                direction=direction_map[str(factor["direction"])],
                explanation=str(factor["explanation_text"]),
                contribution_log_odds=float(factor["shap_log_odds"]),
            )
            for factor in explanation["factors"]
        ]
        probability = float(explanation["probability"])
        return PredictionResult(
            model="financial_inclusion" if model_key == "model1" else "mobile_money_adoption",
            question=str(explanation["question"]),
            answer=str(explanation["prediction_statement"]),
            probability=probability,
            probability_percent=round(probability * 100, 1),
            threshold=float(explanation["threshold"]),
            threshold_status="provisional",
            baseline_probability=float(explanation["baseline_probability"]),
            main_factors=factors,
            warnings=warnings,
        )

    def assess(self, request: AssessmentRequest, assessment_id: str | None = None) -> AssessmentResponse:
        values = request.model_dump()
        outputs: dict[str, PredictionResult] = {}
        try:
            with self._lock:
                for key, runtime in self._runtimes.items():
                    profile = pd.DataFrame(
                        [[values[feature] for feature in runtime.spec.features]],
                        columns=list(runtime.spec.features),
                    )
                    explanation = explain_profile(runtime, profile)
                    outputs[key] = self.result(key, explanation, self.warnings(runtime, profile))
        except (ValueError, RuntimeError, KeyError) as exc:
            raise InferenceError("The validated profile could not be evaluated safely.") from exc

        return AssessmentResponse(
            assessment_id=assessment_id or str(uuid.uuid4()),
            purpose=PURPOSE,
            financial_inclusion=outputs["model1"],
            mobile_money_adoption=outputs["model2"],
            disclaimer=DISCLAIMER,
        )


@lru_cache(maxsize=1)
def get_prediction_service() -> PredictionService:
    return PredictionService()
