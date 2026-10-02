import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, hashLinkToken, readJson, verifySchema } from "@/lib/chat/core";

/**
 * POST /api/chat/link/verify { token } — redeems an emailed link: hands back
 * the chat's visitor token, marks the email verified, and burns the link.
 * Expired, used or unknown links all answer 410.
 */
export async function POST(request: NextRequest) {
  const parsed = verifySchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/chat/link/verify", parsed.error.issues);

  const hash = hashLinkToken(parsed.data.token);
  const conversation = await db.chatConversation.findUnique({ where: { linkTokenHash: hash }, select: { id: true, visitorToken: true } });
  if (!conversation) return NextResponse.json({ error: "expired" }, { status: 410 });

  // Conditional update so two clicks racing can't both redeem the same link.
  const redeemed = await db.chatConversation.updateMany({
    where: { id: conversation.id, linkTokenHash: hash, linkExpiresAt: { gt: new Date() } },
    data: { linkTokenHash: null, linkExpiresAt: null, emailVerifiedAt: new Date() },
  });
  if (redeemed.count !== 1) return NextResponse.json({ error: "expired" }, { status: 410 });

  return NextResponse.json({ token: conversation.visitorToken });
}
