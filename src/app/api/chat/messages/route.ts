import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LIMITS, badRequest, contactView, conversationForToken, messageSchema, messagesAfter, readJson, serializeMessage } from "@/lib/chat/core";
import { notifyOwner } from "@/lib/chat/notify";

/**
 * GET  /api/chat/messages?after=<iso> — the visitor's poll: messages newer
 *      than the cursor, plus the conversation status. Reading clears the
 *      visitor's unread count.
 * POST /api/chat/messages — the visitor sends a message.
 *
 * Both need the visitor token in the x-chat-token header.
 */
export async function GET(request: NextRequest) {
  const conversation = await conversationForToken(request);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await messagesAfter(conversation.id, request.nextUrl.searchParams.get("after"));
  if (conversation.unreadByVisitor > 0) {
    await db.chatConversation.update({ where: { id: conversation.id }, data: { unreadByVisitor: 0 } });
  }
  return NextResponse.json({
    status: conversation.status,
    messages,
    contact: contactView(conversation),
  });
}

export async function POST(request: NextRequest) {
  const conversation = await conversationForToken(request);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = messageSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/chat/messages", parsed.error.issues);

  const recent = await db.chatMessage.count({
    where: { conversationId: conversation.id, sender: "visitor", createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
  });
  if (recent >= LIMITS.messagesPerFiveMinutes) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please wait a moment." }, { status: 429 });
  }

  // A visitor writing into a closed conversation reopens it.
  const [message, updated] = await db.$transaction([
    db.chatMessage.create({
      data: { conversationId: conversation.id, sender: "visitor", body: parsed.data.body },
      select: { id: true, sender: true, body: true, createdAt: true },
    }),
    db.chatConversation.update({
      where: { id: conversation.id },
      data: { unreadByAdmin: { increment: 1 }, lastMessageAt: new Date(), status: "open" },
      select: { unreadByAdmin: true },
    }),
  ]);

  // One ping per burst: only when this message is the first one unread.
  if (updated.unreadByAdmin === 1) {
    notifyOwner({ name: conversation.name, email: conversation.email, body: parsed.data.body, conversationId: conversation.id, isNew: false });
  }

  return NextResponse.json({ message: serializeMessage(message), status: "open" }, { status: 201 });
}
