import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * Shared rules for the visitor chat.
 *
 * A conversation belongs to whoever holds its `visitorToken`: 32 random bytes
 * handed to the browser once, at start, and sent back in a header on every
 * call. The conversation id alone opens nothing, so ids can appear in the
 * admin UI and logs without letting anyone read someone else's chat.
 */

export const LIMITS = {
  bodyMax: 2000,
  nameMax: 80,
  emailMax: 160,
  /** New conversations one address may open per hour. */
  startsPerHour: 3,
  /** Visitor messages per conversation per five minutes. */
  messagesPerFiveMinutes: 20,
  /** Messages returned per poll. */
  pageSize: 50,
  /** How long a "continue this chat" email link works. */
  linkTtlMinutes: 30,
  /** Minimum gap between two link emails for one conversation. */
  linkCooldownMinutes: 5,
} as const;

export const TOKEN_HEADER = "x-chat-token";

const body = z.string().trim().min(1, "Message is empty").max(LIMITS.bodyMax, "Message is too long");
const name = z.string().trim().max(LIMITS.nameMax).optional().transform((v) => v || undefined);
const email = z
  .string()
  .trim()
  .max(LIMITS.emailMax)
  .optional()
  .transform((v) => v || undefined)
  .refine((v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Email looks wrong");

export const startSchema = z.object({
  name,
  email,
  message: body,
  page: z.string().max(300).optional(),
  /** Honeypot: a real visitor never sees or fills this field. */
  website: z.string().max(0).optional(),
});

export const messageSchema = z.object({ body });
export const contactSchema = z.object({ name, email });
export const statusSchema = z.object({ status: z.enum(["open", "closed"]) });
export const linkSchema = z.object({
  email: z.string().trim().min(1).max(LIMITS.emailMax).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  lang: z.enum(["th", "en"]).optional(),
});
export const verifySchema = z.object({ token: z.string().regex(/^[0-9a-f]{64}$/) });

export function newVisitorToken(): string {
  return randomBytes(32).toString("hex");
}

/** Link tokens are stored hashed, so a database read alone can't open a chat. */
export function hashLinkToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A salted hash of the caller's address: enough to rate-limit, not enough to identify. */
export function ipHash(request: NextRequest): string {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  const salt = process.env.ADMIN_JWT_SECRET ?? "chat";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Opaque 400: never echo what failed validation back to an anonymous caller. */
export function badRequest(where: string, issues?: unknown) {
  if (issues) console.warn(`[chat] invalid body on ${where}`, issues);
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** The conversation the caller's token opens, or null. */
export async function conversationForToken(request: NextRequest) {
  const token = request.headers.get(TOKEN_HEADER);
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return db.chatConversation.findUnique({
    where: { visitorToken: token },
    select: { id: true, status: true, name: true, email: true, emailVerifiedAt: true, linkSentAt: true, unreadByVisitor: true },
  });
}

/** What the widget shows about the visitor's own contact details. */
export function contactView(c: { name: string | null; email: string | null; emailVerifiedAt: Date | null }) {
  return { name: c.name, email: c.email, emailVerified: !!c.emailVerifiedAt };
}

export function serializeMessage(m: { id: string; sender: string; body: string; createdAt: Date }) {
  return { id: m.id, sender: m.sender as "visitor" | "owner", body: m.body, createdAt: m.createdAt.toISOString() };
}

/** Messages after a cursor, oldest first, bounded. */
export async function messagesAfter(conversationId: string, after: string | null) {
  const since = after && !Number.isNaN(Date.parse(after)) ? new Date(after) : null;
  const rows = await db.chatMessage.findMany({
    where: { conversationId, ...(since ? { createdAt: { gt: since } } : {}) },
    orderBy: { createdAt: since ? "asc" : "desc" },
    take: LIMITS.pageSize,
    select: { id: true, sender: true, body: true, createdAt: true },
  });
  // Without a cursor we took the newest page; return it oldest first.
  return (since ? rows : rows.reverse()).map(serializeMessage);
}
