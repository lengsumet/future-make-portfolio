import { createHash } from "node:crypto";
import { NextRequest } from "next/server";

/**
 * A salted hash of the caller's address: enough to rate-limit, not enough to
 * identify. Shared by the chat and the admin login limits.
 *
 * Reads ADMIN_JWT_SECRET straight from the environment rather than through
 * requireSecret, on purpose: the chat is public, and a missing or weak admin
 * secret must not stop visitors from starting a conversation.
 */
export function ipHash(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const salt = process.env.ADMIN_JWT_SECRET ?? "chat";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
