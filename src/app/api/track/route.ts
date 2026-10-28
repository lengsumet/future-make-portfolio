import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { CLIENT_EVENT_TYPES } from "@/types/analytics";

/**
 * POST /api/track — analytics beacons from the browser. Anonymous, so every
 * field is bounded: without that one script could fill the database.
 * purchase_complete is not in the list; the orders route records it.
 */
const MAX_BODY_BYTES = 4096;
const MAX_METADATA_BYTES = 1024;

const TrackSchema = z.object({
  sessionId: z.string().min(1).max(64),
  eventType: z.enum(CLIENT_EVENT_TYPES),
  page: z.string().min(1).max(300),
  element: z.string().max(100).optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .transform((m) => JSON.stringify(m ?? {}))
    .refine((json) => Buffer.byteLength(json) <= MAX_METADATA_BYTES, "metadata too large"),
});

export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get("content-length"));
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // sendBeacon posts text/plain, so read the text rather than trust the content type.
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = TrackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const event = await db.pageEvent.create({
      data: {
        ...parsed.data,
        element: parsed.data.element ?? null,
        userAgent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    console.error("[track] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
