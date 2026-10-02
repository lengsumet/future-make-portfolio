import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LIMITS, badRequest, contactView, conversationForToken, hashLinkToken, linkSchema, newVisitorToken, readJson } from "@/lib/chat/core";
import { sendChatLink, siteBase, visitorMailAvailable } from "@/lib/chat/mail";

/**
 * GET  /api/chat/link — whether email links are switched on, so the widget
 *      only offers what works.
 * POST /api/chat/link { email, lang } — mail a one-time link that opens the
 *      chat on whatever device clicks it.
 *
 * With the visitor token: the link is for the caller's own chat (and the
 * email becomes the chat's email if it differs). Without it: the newest chat
 * that left this email gets the link. That case always answers the same way,
 * so it can't be used to probe which emails have chatted, and the link only
 * ever goes to the email on the chat — never to the caller.
 */
export function GET() {
  return NextResponse.json({ available: visitorMailAvailable() });
}

export async function POST(request: NextRequest) {
  if (!visitorMailAvailable()) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const parsed = linkSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/chat/link", parsed.error.issues);
  const { email, lang = "en" } = parsed.data;

  const own = await conversationForToken(request);
  const target = own
    ? { id: own.id, email: own.email, linkSentAt: own.linkSentAt }
    : await db.chatConversation.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        orderBy: { lastMessageAt: "desc" },
        select: { id: true, email: true, linkSentAt: true },
      });

  const coolingDown = !!target?.linkSentAt && Date.now() - target.linkSentAt.getTime() < LIMITS.linkCooldownMinutes * 60 * 1000;
  if (!target || coolingDown) {
    return own ? NextResponse.json({ error: "too soon" }, { status: 429 }) : NextResponse.json({ sent: true });
  }

  const token = newVisitorToken();
  const changedEmail = !!own && own.email?.toLowerCase() !== email.toLowerCase();
  const updated = await db.chatConversation.update({
    where: { id: target.id },
    data: {
      linkTokenHash: hashLinkToken(token),
      linkExpiresAt: new Date(Date.now() + LIMITS.linkTtlMinutes * 60 * 1000),
      linkSentAt: new Date(),
      ...(changedEmail ? { email, emailVerifiedAt: null } : {}),
    },
    select: { name: true, email: true, emailVerifiedAt: true },
  });

  const sent = await sendChatLink(updated.email ?? email, `${siteBase(request)}/#chat-link=${token}`, lang);
  if (!own) return NextResponse.json({ sent: true });
  if (!sent) {
    // Let the visitor retry straight away rather than wait out a cooldown for an email that never left.
    await db.chatConversation.update({ where: { id: target.id }, data: { linkSentAt: null, linkTokenHash: null, linkExpiresAt: null } });
    return NextResponse.json({ error: "send failed" }, { status: 502 });
  }
  return NextResponse.json({ sent: true, contact: contactView(updated) });
}
