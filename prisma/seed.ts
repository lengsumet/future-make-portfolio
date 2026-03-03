import { PrismaClient } from "@prisma/client";
import productsData from "../public/data/products.json";

const db = new PrismaClient();

async function main() {
  console.log("Seeding products...");

  for (const p of productsData) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        slug: p.slug,
        title: p.title,
        category: p.category,
        shortDescription: p.shortDescription,
        longDescription: p.longDescription,
        price: p.price,
        currency: p.currency,
        thumbnail: p.thumbnail,
        images: JSON.stringify(p.images),
        techStack: JSON.stringify(p.techStack),
        features: JSON.stringify(p.features),
        deliverables: JSON.stringify(p.deliverables),
        demoUrl: p.demoUrl,
        featured: p.featured,
        status: p.status,
      },
    });
  }

  console.log(`✓ Seeded ${productsData.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
