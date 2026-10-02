import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, contactSchema, conversationForToken, readJson } from "@/lib/chat/core";

/**
 * PATCH /api/chat/contact — the visitor adds or changes the name and email
 * the owner can reply to if they leave. Token required.
 */
export async function PATCH(request: NextRequest) {
  const conversation = await conversationForToken(request);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = contactSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/chat/contact", parsed.error.issues);

  const updated = await db.chatConversation.update({
    where: { id: conversation.id },
    data: { name: parsed.data.name ?? conversation.name, email: parsed.data.email ?? conversation.email },
    select: { name: true, email: true },
  });
  return NextResponse.json({ contact: updated });
}
