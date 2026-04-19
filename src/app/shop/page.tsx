"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product, ProductCategory } from "@/types/shop";
import { useTracking, usePageView } from "@/hooks/useTracking";

const CATEGORIES: { label: string; value: ProductCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Enterprise Systems", value: "fullstack" },
  { label: "Templates", value: "template" },
  { label: "Services", value: "service" },
];

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

export default function ShopPage() {
  usePageView();
  const { track } = useTracking();
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

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3001";

  return (
    <div style={{ background: "var(--background)" }} className="min-h-screen">
      {/* Aurora bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, #C08552 0%, #8C5A3C 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:pl-20">
        {/* Live E-Commerce Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="relative overflow-hidden rounded-2xl mb-14 p-8"
          style={{
            background: "rgba(192, 133, 82,0.06)",
            border: "1px solid rgba(192, 133, 82,0.2)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(rgba(192, 133, 82,0.3) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
                <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#86efac" }}>Live Project</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Full E-Commerce Store</h2>
              <p className="text-sm max-w-md" style={{ color: "rgba(255,255,255,0.35)" }}>
                Production-ready store with product catalog, PromptPay QR checkout, order management, and admin dashboard with sales reports.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["Next.js 15", "Prisma", "NextAuth", "Zustand", "Recharts"].map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>{t}</span>
                ))}
              </div>
            </div>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity duration-150 hover:opacity-85"
              style={{ background: "linear-gradient(135deg, #C08552, #8C5A3C)", color: "#fff" }}
            >
              Open Store →
            </a>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }} className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>Shop</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Templates &amp; Systems</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Production-ready code built with real-world enterprise experience.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: activeCategory === cat.value ? "linear-gradient(135deg, #C08552, #8C5A3C)" : "rgba(255,255,255,0.04)",
                color: activeCategory === cat.value ? "#fff" : "rgba(255,255,255,0.4)",
                border: `1px solid ${activeCategory === cat.value ? "transparent" : "rgba(255,255,255,0.07)"}`,
                boxShadow: activeCategory === cat.value ? "0 0 20px rgba(192, 133, 82,0.3)" : "none",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl h-80 animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: spring } }}
              >
                <ProductCard product={product} onTrack={() => track("product_view", product.id)} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
            No products in this category yet.
          </p>
        )}

        {/* Custom work CTA */}
        <div
          className="mt-20 text-center rounded-2xl p-10"
          style={{
            background: "rgba(192, 133, 82,0.05)",
            border: "1px solid rgba(192, 133, 82,0.15)",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-3">Need Something Custom?</h2>
          <p className="text-sm max-w-xl mx-auto mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            I build custom distributed systems, API integrations, and cloud-native architectures.
            Let&apos;s discuss your project.
          </p>
          <a
            href="mailto:sumet.buarod@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-opacity duration-150 hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #C08552, #8C5A3C)", color: "#fff" }}
            onClick={() => track("cta_click", "contact_custom")}
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
