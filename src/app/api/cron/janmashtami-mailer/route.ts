import { NextRequest, NextResponse } from "next/server";
import { dispatchJanmashtamiBatch, JanmashtamiBatchParams } from "@/app/actions/email";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/janmashtami-mailer
 * Health check & status check for cron services.
 */
export async function GET(request: NextRequest) {
  const now = new Date();
  return NextResponse.json({
    status: "online",
    serverTime: now.toISOString(),
    localTimeIST: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    message: "Janmashtami Guru-Shishya Mailer endpoint is operational."
  });
}

/**
 * POST /api/cron/janmashtami-mailer
 * Dispatches Janmashtami batch emails.
 */
export async function POST(request: NextRequest) {
  try {
    const body: JanmashtamiBatchParams = await request.json().catch(() => ({ target: "test_only" }));
    const result = await dispatchJanmashtamiBatch(body);
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to dispatch batch";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
