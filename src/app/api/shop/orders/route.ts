import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const CheckoutSchema = z.object({
  buyerName: z.string().min(2).max(100),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().optional(),
  productId: z.string(),
  productTitle: z.string(),
  price: z.number().positive(),
  notes: z.string().optional(),
});

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `ORD-${date}-${rand}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CheckoutSchema.parse(body);

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerName: validated.buyerName,
        buyerEmail: validated.buyerEmail,
        buyerPhone: validated.buyerPhone,
        totalAmount: validated.price,
        currency: "THB",
        notes: validated.notes,
        items: {
          create: [{
            productId: validated.productId,
            title: validated.productTitle,
            price: validated.price,
            quantity: 1,
          }],
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json();
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "paid" ? { paidAt: new Date() } : {}),
      },
      include: { items: true },
    });
    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
