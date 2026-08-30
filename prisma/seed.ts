import { PrismaClient } from "@prisma/client";
import productsData from "../public/data/products.json";

const db = new PrismaClient();

async function main() {
  console.log("Seeding products...");

  // `public/data/products.json` is the source of truth — the admin screen says
  // so in as many words. Anything in the database that is no longer in the file
  // is gone from the catalogue, and leaving it behind is how the shop came to
  // sell six products that the showcase had never heard of while none of the
  // ten it did show could be bought at all.
  const slugs = productsData.map((p) => p.slug);
  const { count: removed } = await db.product.deleteMany({
    where: { slug: { notIn: slugs } },
  });
  if (removed > 0) console.log(`  Removed ${removed} product(s) no longer in products.json`);

  for (const p of productsData) {
    const fields = {
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
    };

    // Updated as well as created: `update: {}` meant a price change, a new
    // screenshot or a corrected description in the file never reached a row
    // that already existed.
    await db.product.upsert({
      where: { slug: p.slug },
      update: fields,
      create: { id: p.id, slug: p.slug, ...fields },
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
