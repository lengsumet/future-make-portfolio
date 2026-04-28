import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { signAdminToken } from "@/lib/auth/admin";
import { timingSafeEqual } from "crypto";

// Simple in-memory rate limiter: max 5 attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// Use HMAC to produce fixed-length buffers, then timingSafeEqual to prevent
// timing attacks that could reveal the password via response time differences.
function safePasswordCompare(input: string, expected: string): boolean {
  const key = process.env.ADMIN_JWT_SECRET || "dev-secret-please-change-in-production";
  const inputHash = createHmac("sha256", key).update(input).digest();
  const expectedHash = createHmac("sha256", key).update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!password || typeof password !== "string" || password.length < 1) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    if (!safePasswordCompare(password, adminPassword)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await signAdminToken();

    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[auth/admin] POST error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("admin_token");
  return response;
}
