import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/admin";

export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const token = request.cookies.get("admin_token")?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null; // OK
}
