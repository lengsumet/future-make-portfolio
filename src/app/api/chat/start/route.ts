import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LIMITS, badRequest, ipHash, newVisitorToken, readJson, serializeMessage, startSchema } from "@/lib/chat/core";
import { notifyOwner } from "@/lib/chat/notify";

/**
 * POST /api/chat/start — a visitor opens a conversation with its first
 * message. Returns the visitor token once; the browser keeps it.
 */
export async function POST(request: NextRequest) {
  const parsed = startSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/chat/start", parsed.error.issues);
  const { name, email, message, page } = parsed.data;

  const hash = ipHash(request);
  const recent = await db.chatConversation.count({
    where: { ipHash: hash, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= LIMITS.startsPerHour) {
    return NextResponse.json({ error: "Too many new chats. Please try again later." }, { status: 429 });
  }

  const visitorToken = newVisitorToken();
  const conversation = await db.chatConversation.create({
    data: {
      visitorToken,
      name: name ?? null,
      email: email ?? null,
      page: page ?? null,
      ipHash: hash,
      unreadByAdmin: 1,
      messages: { create: { sender: "visitor", body: message } },
    },
    select: { id: true, messages: { select: { id: true, sender: true, body: true, createdAt: true } } },
  });

  notifyOwner({ name, email, body: message, conversationId: conversation.id, isNew: true });

  return NextResponse.json(
    { token: visitorToken, status: "open", messages: conversation.messages.map(serializeMessage) },
    { status: 201 },
  );
}
