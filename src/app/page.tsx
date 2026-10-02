import productsData from "../../public/data/products.json";
import Hero, { type ProofStat } from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import WorkIndex, { type WorkItem } from "@/components/home/WorkIndex";
import ProofGrid from "@/components/home/ProofGrid";
import ContactBand from "@/components/home/ContactBand";
import CatWidget from "@/components/animations/CatWidget";

interface ProductEntry {
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  techStack: string[];
  images?: string[];
  demoUrl?: string;
  status: string;
}

/**
 * "Enterprise WMS (Warehouse Management System)" reads better on an index
 * as a large "WMS" with its expansion beside it.
 */
function splitTitle(title: string): { name: string; expansion: string | null } {
  const match = title.match(/^(?:Enterprise\s+)?(.+?)\s*\((.+)\)\s*(?:System)?$/);
  if (match) return { name: match[1].trim(), expansion: match[2].trim() };
  return { name: title, expansion: null };
}

/**
 * The work, read from products.json — the file the admin screen edits — so
 * the front page cannot advertise something the shop does not carry. The
 * enterprise systems lead, then the shop and the template.
 */
const order = (p: ProductEntry) => (p.category === "template" ? 2 : p.slug.startsWith("ecommerce") ? 1 : 0);
const work: WorkItem[] = (productsData as ProductEntry[])
  .filter((p) => p.status === "active")
  .sort((a, b) => order(a) - order(b))
  .map((p) => {
    const { name, expansion } = splitTitle(p.title);
    return {
      slug: p.slug,
      name,
      expansion,
      description: p.shortDescription,
      tags: p.techStack.slice(0, 3),
      image: p.images?.[0] ?? null,
      liveUrl: p.demoUrl ?? null,
    };
  });

const proof: ProofStat[] = [
  { value: String(work.filter((w) => w.slug !== "portfolio-template").length).padStart(2, "0"), label: "Production systems" },
  { value: "1,156", label: "Automated tests" },
  { value: "10", label: "Live deployments" },
  { value: "3+", label: "Years shipping" },
];

const stack = [
  "Next.js",
  "TypeScript",
  "C# / .NET",
  "Go",
  "Python",
  "PostgreSQL",
  "Prisma",
  "Docker",
  "AWS",
  "Event-driven",
  "Transactional outbox",
  "RBAC",
];

export default function Home() {
  return (
    <div style={{ background: "var(--background)" }}>
      <div className="grain-overlay" aria-hidden="true" />
      <Hero proof={proof} />
      <Marquee items={stack} />
      <WorkIndex items={work} />
      <ProofGrid />
      <ContactBand />
      <CatWidget />
    </div>
  );
}
