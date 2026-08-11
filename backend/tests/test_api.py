"""Deployment-package contract tests for the Vercel FastAPI service."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient


BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from main import app  # noqa: E402
from service import SPECS, get_prediction_service  # noqa: E402


EXAMPLE_PROFILE = {
    "female": "Female",
    "age_group": "65+",
    "educ": "Primary education or less",
    "inc_q": "Income quintile 2",
    "emp_in": "Out of the workforce",
    "fin24c": "Yes",
    "internet_use": "No / don't know / refused",
    "internet_engagement_level": "No recent internet use / no-DK-ref",
    "phone_access_tier": "Smartphone",
    "con11": "Yes",
    "con12": "Daily",
    "con14": "Yes",
    "con16": "Yes",
    "con18": "No",
    "con20": "No",
    "data_purchase_pattern": "No recent internet use / skipped",
    "fin46": "Yes",
}


class DeploymentApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.client_context = TestClient(app, raise_server_exceptions=False)
        cls.client = cls.client_context.__enter__()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.client_context.__exit__(None, None, None)

    def test_health_loads_both_hash_validated_artifact_pairs(self) -> None:
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "healthy")
        self.assertEqual({model["target"] for model in body["models"]}, {"account_fin", "account_mob"})
        for observed, expected in zip(body["models"], SPECS, strict=True):
            self.assertEqual(observed["pipeline_sha256"], expected.pipeline_sha256)
            self.assertEqual(observed["explainer_sha256"], expected.explainer_sha256)

    def test_one_profile_returns_two_explained_predictions(self) -> None:
        response = self.client.post("/api/v1/assessment", json=EXAMPLE_PROFILE)
        self.assertEqual(response.status_code, 200)
        body = response.json()
        for key in ("financial_inclusion", "mobile_money_adoption"):
            result = body[key]
            self.assertRegex(result["answer"], r"^This person is (un)?likely")
            self.assertEqual(result["probability_percent"], round(result["probability"] * 100, 1))
            self.assertEqual(len(result["main_factors"]), 5)
            magnitudes = [abs(factor["contribution_log_odds"]) for factor in result["main_factors"]]
            self.assertTrue(all(left >= right for left, right in zip(magnitudes, magnitudes[1:])))

    def test_runtime_is_cached_and_invalid_profiles_are_rejected(self) -> None:
        self.assertIs(get_prediction_service(), get_prediction_service())
        invalid = dict(EXAMPLE_PROFILE, female="Unknown")
        response = self.client.post("/api/v1/assessment", json=invalid)
        self.assertEqual(response.status_code, 422)
        self.assertEqual(response.json()["error"]["code"], "VALIDATION_ERROR")

    def test_openapi_uses_same_origin_api_paths(self) -> None:
        document = self.client.get("/api/openapi.json").json()
        self.assertIn("/api/v1/assessment", document["paths"])
        self.assertIn("/api/health", document["paths"])
        self.assertEqual(len(document["components"]["schemas"]["AssessmentRequest"]["required"]), 17)


if __name__ == "__main__":
    unittest.main()
