"""Smoke-test the standalone frontend server and its production API proxy."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path


FRONTEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = FRONTEND_ROOT.parent
PORT = 4312


def wait_for_frontend(url: str, timeout: float = 30.0) -> str:
    deadline = time.monotonic() + timeout
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                return response.read().decode("utf-8")
        except (urllib.error.URLError, TimeoutError) as exc:
            last_error = exc
            time.sleep(0.5)
    raise RuntimeError(f"Standalone frontend did not become ready: {last_error}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--node", required=True, help="Absolute path to node.exe")
    args = parser.parse_args()

    environment = os.environ.copy()
    environment.update(
        {
            "PORT": str(PORT),
            "HOST": "127.0.0.1",
            "FINACCESS_API_URL": "https://finaccess-eswatini-api.onrender.com",
        }
    )
    creation_flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    process = subprocess.Popen(
        [args.node, "dist/standalone/server.js"],
        cwd=FRONTEND_ROOT,
        env=environment,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=creation_flags,
    )
    try:
        homepage = wait_for_frontend(f"http://127.0.0.1:{PORT}/")
        profile = json.loads(
            (PROJECT_ROOT / "api" / "examples" / "assessment_request.json").read_text(
                encoding="utf-8"
            )
        )
        request = urllib.request.Request(
            f"http://127.0.0.1:{PORT}/api/assessment",
            data=json.dumps(profile).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=120) as response:
            assessment = json.loads(response.read().decode("utf-8"))

        result = {
            "homepage_status": 200,
            "heading_found": "Financial Access in Eswatini" in homepage,
            "financial_inclusion_percent": assessment["financial_inclusion"][
                "probability_percent"
            ],
            "mobile_money_percent": assessment["mobile_money_adoption"][
                "probability_percent"
            ],
            "financial_inclusion_factors": len(
                assessment["financial_inclusion"]["main_factors"]
            ),
            "mobile_money_factors": len(
                assessment["mobile_money_adoption"]["main_factors"]
            ),
        }
        if not result["heading_found"] or any(
            result[key] != 5
            for key in ("financial_inclusion_factors", "mobile_money_factors")
        ):
            raise RuntimeError(f"Standalone validation failed: {result}")
        print(json.dumps(result, indent=2))
        return 0
    finally:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=10)


if __name__ == "__main__":
    raise SystemExit(main())
