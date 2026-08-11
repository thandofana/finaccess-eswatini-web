import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.FINACCESS_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json();
    const response = await fetch(`${apiBaseUrl}/api/v1/assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
      cache: "no-store",
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: { code: "API_UNAVAILABLE", message: "The prediction service is currently unavailable.", details: [] } },
      { status: 503 },
    );
  }
}
