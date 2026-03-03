import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const products = await db.product.findMany({
    where: {
      status: "active",
      ...(category ? { category } : {}),
      ...(featured === "true" ? { featured: true } : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const parsed = products.map((p) => ({
    ...p,
    images: JSON.parse(p.images),
    techStack: JSON.parse(p.techStack),
    features: JSON.parse(p.features),
    deliverables: JSON.parse(p.deliverables),
  }));

  return NextResponse.json(parsed);
}
