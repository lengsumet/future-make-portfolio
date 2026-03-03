import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, eventType, page, element, metadata } = body;

    if (!sessionId || !eventType || !page) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await db.pageEvent.create({
      data: {
        sessionId,
        eventType,
        page,
        element: element ?? null,
        metadata: JSON.stringify(metadata ?? {}),
        userAgent: request.headers.get("user-agent") ?? null,
      },
    });

    return NextResponse.json({ ok: true, id: event.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
