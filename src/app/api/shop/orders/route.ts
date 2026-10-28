import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const CheckoutSchema = z.object({
  buyerName: z.string().min(2).max(100),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().optional(),
  // Only the product is the buyer's choice. Its price and title come from the
  // database: a client-sent price would let anyone order anything for ฿1.
  productId: z.string().min(1).max(64),
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

    const product = await db.product.findFirst({
      where: { id: validated.productId, status: "active" },
      select: { id: true, title: true, price: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerName: validated.buyerName,
        buyerEmail: validated.buyerEmail,
        buyerPhone: validated.buyerPhone,
        totalAmount: product.price,
        currency: "THB",
        notes: validated.notes,
        items: {
          create: [{
            productId: product.id,
            title: product.title,
            price: product.price,
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
    console.error("[shop/orders] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(orders);
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
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
  } catch (error) {
    console.error("[shop/orders] PATCH error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
