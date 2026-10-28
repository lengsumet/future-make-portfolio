import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createHmac, timingSafeEqual } from "crypto";
import { signAdminToken } from "@/lib/auth/admin";
import { requireSecret } from "@/lib/env";
import { ipHash } from "@/lib/request";

// At most 5 attempts per address per 15 minutes, counted in the database so
// every server instance sees the same attempts (an in-memory map gave each
// instance, and each cold start, its own fresh 5).
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * Records this attempt, then counts. Inserting first is what makes the limit
 * hold under a burst: parallel guesses each see the others' rows, so they
 * cannot all count 0 and all go through. Refused attempts keep their row on
 * purpose — removing it would lower the count mid-burst and let more through.
 */
async function overLimit(hash: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  await db.loginAttempt.create({ data: { ipHash: hash } });
  const [recent] = await Promise.all([
    db.loginAttempt.count({ where: { ipHash: hash, createdAt: { gte: since } } }),
    // Rows past the window are never read again; drop them so the table stays small.
    db.loginAttempt.deleteMany({ where: { createdAt: { lt: since } } }),
  ]);
  return recent > MAX_ATTEMPTS;
}

// Use HMAC to produce fixed-length buffers, then timingSafeEqual to prevent
// timing attacks that could reveal the password via response time differences.
function safePasswordCompare(input: string, expected: string): boolean {
  const key = requireSecret("ADMIN_JWT_SECRET");
  const inputHash = createHmac("sha256", key).update(input).digest();
  const expectedHash = createHmac("sha256", key).update(expected).digest();
  return timingSafeEqual(inputHash, expectedHash);
}

export async function POST(request: NextRequest) {
  const hash = ipHash(request);

  try {
    // Every attempt counts, a malformed one included.
    if (await overLimit(hash)) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }

    let password: unknown;
    try {
      ({ password } = await request.json());
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    if (!safePasswordCompare(password, requireSecret("ADMIN_PASSWORD"))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await signAdminToken();
    // The address proved it knows the password; its earlier misses no longer count.
    await db.loginAttempt.deleteMany({ where: { ipHash: hash } });

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
    // The database or a secret failed, not the caller: no cookie, and say so.
    console.error("[auth/admin] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("admin_token");
  return response;
}
