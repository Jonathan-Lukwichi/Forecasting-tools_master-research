import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    return NextResponse.json({
      status: "ok",
      api: data,
      pinged_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to reach API",
        pinged_at: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}
