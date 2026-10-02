import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

/**
 * GET /api/admin/chat?status=open|closed|all&page=N — the inbox list:
 * conversations newest activity first, each with its last message, plus the
 * total unread count for the nav badge. 30 per page.
 */
const PAGE_SIZE = 30;

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const page = Math.max(1, Math.floor(Number(params.get("page"))) || 1);
  const where = status === "open" || status === "closed" ? { status } : {};

  const [rows, total, unread] = await Promise.all([
    db.chatConversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        page: true,
        status: true,
        unreadByAdmin: true,
        lastMessageAt: true,
        createdAt: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { sender: true, body: true } },
      },
    }),
    db.chatConversation.count({ where }),
    db.chatConversation.aggregate({ _sum: { unreadByAdmin: true } }),
  ]);

  return NextResponse.json({
    data: rows.map(({ messages, lastMessageAt, createdAt, emailVerifiedAt, ...c }) => ({
      ...c,
      emailVerified: !!emailVerifiedAt,
      lastMessageAt: lastMessageAt.toISOString(),
      createdAt: createdAt.toISOString(),
      last: messages[0] ? { sender: messages[0].sender, body: messages[0].body.slice(0, 140) } : null,
    })),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    unread: unread._sum.unreadByAdmin ?? 0,
  });
}
