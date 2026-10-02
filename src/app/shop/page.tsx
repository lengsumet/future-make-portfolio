"use client";

import { systemUrl } from "@/lib/system-urls";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product, ProductCategory } from "@/types/shop";
import { useTracking, usePageView } from "@/hooks/useTracking";
import BlurText from "@/components/fx/BlurText";
import Spotlight from "@/components/fx/Spotlight";
import TiltCard from "@/components/fx/TiltCard";
import Magnetic from "@/components/fx/Magnetic";

const CATEGORIES: { label: string; value: ProductCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Enterprise Systems", value: "fullstack" },
  { label: "Templates", value: "template" },
  { label: "Services", value: "service" },
];

const STORE_STACK = ["Next.js 15", "Prisma", "NextAuth", "Zustand", "Recharts"];

const ease = [0.22, 1, 0.36, 1] as const;

export default function ShopPage() {
  usePageView();
  const { track } = useTracking();
  const reduce = useReducedMotion();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  const storeUrl = systemUrl(process.env.NEXT_PUBLIC_STORE_URL, "ecommerce", "3009");

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay },
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header: eyebrow, silver headline with one serif word, lead */}
      <section className="relative isolate overflow-hidden px-5 pb-14 pt-16 md:-mt-20 md:px-10 md:pb-16 md:pt-36">
        <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
        <Spotlight className="-z-10" />
        <div className="mx-auto max-w-[1200px]">
          <motion.p {...fade(0)} className="eyebrow">Shop · {loading ? "—" : String(products.length).padStart(2, "0")} products</motion.p>
          <h1 className="display mt-4 max-w-4xl text-[clamp(2.75rem,7vw,5.75rem)]">
            <BlurText text="Systems you can" wordClassName="text-silver pb-[0.08em]" />{" "}
            <BlurText text="own outright." delay={0.24} wordClassName="accent-serif pb-[0.08em]" />
          </h1>
          <motion.p {...fade(0.4)} className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-2)] md:text-lg">
            Production-ready code built with real-world enterprise experience. Every system runs live with demo
            data, and ships with its full source.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto box-content max-w-[1200px] px-5 pb-24 md:px-10">
        {/* Featured: the live store, on a lit card */}
        <motion.section
          {...fade(0.5)}
          aria-labelledby="store-title"
          className="relative isolate overflow-hidden rounded-[28px] border border-[var(--border-mid)] bg-[var(--surface)]"
        >
          <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
          <Spotlight className="-z-10" />
          <div className="absolute inset-x-[15%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />
          <div className="absolute left-1/3 top-0 -z-10 h-32 w-2/3 -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" aria-hidden="true" />

          <div className="grid items-center gap-10 p-7 md:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:p-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-3 py-1 font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-2)]">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                </span>
                Live project
              </p>
              <h2 id="store-title" className="display text-silver mt-5 pb-[0.06em] text-[clamp(2rem,4vw,3.25rem)]">
                Full E-Commerce <span className="accent-serif">Store</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-2)] md:text-base">
                Production-ready store with product catalog, PromptPay QR checkout, order management, and admin dashboard with sales reports.
              </p>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Built with">
                {STORE_STACK.map((t) => (
                  <li key={t} className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-2xs text-[var(--text-3)]">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Magnetic>
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--text-1)] px-6 py-3 text-sm font-medium text-[var(--background)] shadow-[0_0_50px_-12px_rgba(255,248,240,0.6)] transition-transform hover:-translate-y-0.5"
                  >
                    Open Store
                    <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                </Magnetic>
              </div>
            </div>

            <TiltCard className="rounded-[18px] border border-[var(--border-mid)] bg-[var(--surface-2)] p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]" max={6}>
              <div className="overflow-hidden rounded-[13px]">
                <Image
                  src="/images/showcase/ecommerce.png"
                  alt="The e-commerce storefront"
                  width={1440}
                  height={900}
                  sizes="(min-width: 1024px) 520px, 95vw"
                  className="block h-auto w-full"
                />
              </div>
            </TiltCard>
          </div>
        </motion.section>

        {/* Catalogue */}
        <div className="mt-24 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 className="display text-silver mt-3 pb-[0.06em] text-[clamp(2rem,4.5vw,3.5rem)]">
              Templates &amp; <span className="accent-serif">systems.</span>
            </h2>
          </div>

          {/* Category filter: a segmented control with a gliding active chip */}
          <div className="max-w-full overflow-x-auto">
            <div role="group" aria-label="Filter by category" className="inline-flex rounded-full border border-[var(--border-mid)] bg-[var(--surface)] p-1">
              {CATEGORIES.map((cat) => {
                const active = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActiveCategory(cat.value)}
                    aria-pressed={active}
                    className={`relative whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors duration-200 sm:px-4 sm:text-sm ${
                      active ? "text-[var(--background)]" : "text-[var(--text-3)] hover:text-[var(--text-1)]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="shop-filter-chip"
                        className="absolute inset-0 rounded-full bg-[var(--text-1)] shadow-[0_0_30px_-8px_rgba(255,248,240,0.55)]"
                        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            <span className="sr-only">Loading products</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-luxury h-[26rem] rounded-[20px]" aria-hidden="true" />
            ))}
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, i) => {
              // Widen the first card (and the last, when one would be left
              // alone) so every row of the three-column grid is full.
              const rem = filtered.length % 3;
              const wide = filtered.length > 1 && ((rem !== 0 && i === 0) || (rem === 1 && i === filtered.length - 1));
              return (
              <motion.li
                key={product.id}
                className={wide ? "lg:col-span-2" : ""}
                initial={reduce ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease, delay: Math.min(i, 8) * 0.05 }}
              >
                <ProductCard product={product} index={i} wide={wide} onTrack={() => track("product_view", product.id)} />
              </motion.li>
              );
            })}
          </ul>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-10 rounded-[20px] border border-dashed border-[var(--border-mid)] py-16 text-center">
            <p className="eyebrow">Nothing here yet</p>
            <p className="mt-2 text-sm text-[var(--text-3)]">No products in this category yet.</p>
          </div>
        )}

        {/* Custom work CTA */}
        <section
          aria-labelledby="custom-title"
          className="relative isolate mt-24 overflow-hidden rounded-[28px] border border-[var(--border-mid)] bg-[var(--surface)] px-6 py-16 text-center md:py-20"
        >
          <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
          <div className="absolute inset-x-[15%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />
          <div className="absolute left-1/2 top-0 -z-10 h-32 w-2/3 -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-15 blur-3xl" aria-hidden="true" />
          <p className="eyebrow">Custom work</p>
          <h2 id="custom-title" className="display text-silver mx-auto mt-4 max-w-2xl pb-[0.06em] text-[clamp(2rem,4.5vw,3.5rem)]">
            Need something <span className="accent-serif">custom?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-2)] md:text-base">
            I build custom distributed systems, API integrations, and cloud-native architectures.
            Let&apos;s discuss your project.
          </p>
          <div className="mt-8 flex justify-center">
            <Magnetic>
              <a
                href="mailto:sumet.buarod@gmail.com"
                className="border-spin group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-medium text-[var(--text-1)] shadow-[0_0_40px_-10px_rgba(224,168,120,0.6)] [--btn-bg:var(--surface)]"
                onClick={() => track("cta_click", "contact_custom")}
              >
                Get in Touch
                <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            </Magnetic>
          </div>
        </section>
      </div>
    </div>
  );
}
