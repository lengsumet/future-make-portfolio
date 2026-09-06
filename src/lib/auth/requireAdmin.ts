import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { requireSecret } from "@/lib/env";

const getSecret = () => new TextEncoder().encode(requireSecret("ADMIN_JWT_SECRET"));

export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const token = request.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await jwtVerify(token, getSecret());
    return null; // OK
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
