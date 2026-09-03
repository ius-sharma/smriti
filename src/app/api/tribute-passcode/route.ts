import { NextRequest, NextResponse } from "next/server";
import { getTributePasscode, verifyTributePasscode, adminUpdateTributePasscode } from "@/app/actions/wall";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const passcode = await getTributePasscode();
    return NextResponse.json({ success: true, passcode });
  } catch (error: any) {
    return NextResponse.json({ success: false, passcode: "67672006", error: error?.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code } = body;
    const result = await verifyTributePasscode(code);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, pass, newPasscode } = body;
    const result = await adminUpdateTributePasscode(email, pass, newPasscode);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
