import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ADMIN_TOKEN_TTL_SECONDS, checkAdminPassword, signAdminToken } from "@/lib/auth/admin";
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

    if (!checkAdminPassword(password)) {
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
      maxAge: ADMIN_TOKEN_TTL_SECONDS,
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
