import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { badRequest, messageSchema, messagesAfter, readJson, serializeMessage, statusSchema } from "@/lib/chat/core";

/**
 * GET   /api/admin/chat/[id]?after=<iso> — one thread; reading clears the
 *       owner's unread count.
 * POST  /api/admin/chat/[id] — the owner replies.
 * PATCH /api/admin/chat/[id] — close or reopen.
 */
type Ctx = { params: Promise<{ id: string }> };

async function load(id: string) {
  return db.chatConversation.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, page: true, status: true, unreadByAdmin: true, createdAt: true },
  });
}

export async function GET(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const conversation = await load(id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await messagesAfter(id, request.nextUrl.searchParams.get("after"));
  if (conversation.unreadByAdmin > 0) {
    await db.chatConversation.update({ where: { id }, data: { unreadByAdmin: 0 } });
  }
  const { createdAt, unreadByAdmin: _unread, ...rest } = conversation;
  void _unread;
  return NextResponse.json({ conversation: { ...rest, createdAt: createdAt.toISOString() }, messages });
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const parsed = messageSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/admin/chat/[id]", parsed.error.issues);
  if (!(await load(id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [message] = await db.$transaction([
    db.chatMessage.create({
      data: { conversationId: id, sender: "owner", body: parsed.data.body },
      select: { id: true, sender: true, body: true, createdAt: true },
    }),
    db.chatConversation.update({
      where: { id },
      data: { unreadByVisitor: { increment: 1 }, unreadByAdmin: 0, lastMessageAt: new Date(), status: "open" },
    }),
  ]);
  return NextResponse.json({ message: serializeMessage(message) }, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { id } = await params;
  const parsed = statusSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest("/api/admin/chat/[id] PATCH", parsed.error.issues);
  if (!(await load(id))) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.chatConversation.update({ where: { id }, data: { status: parsed.data.status }, select: { status: true } });
  return NextResponse.json(updated);
}
