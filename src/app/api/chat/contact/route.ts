import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, contactSchema, contactView, conversationForToken, readJson } from "@/lib/chat/core";

/**
 * PATCH /api/chat/contact — the visitor adds or changes the name and email
 * the owner can reply to if they leave. Token required.
 */
export async function PATCH(request: NextRequest) {
  const conversation = await conversationForToken(request);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = contactSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/chat/contact", parsed.error.issues);

  const email = parsed.data.email ?? conversation.email;
  // A new address hasn't been proven yet, and an old link must not open the chat for it.
  const changedEmail = email?.toLowerCase() !== conversation.email?.toLowerCase();
  const updated = await db.chatConversation.update({
    where: { id: conversation.id },
    data: {
      name: parsed.data.name ?? conversation.name,
      email,
      ...(changedEmail ? { emailVerifiedAt: null, linkTokenHash: null, linkExpiresAt: null } : {}),
    },
    select: { name: true, email: true, emailVerifiedAt: true },
  });
  return NextResponse.json({ contact: contactView(updated) });
}
