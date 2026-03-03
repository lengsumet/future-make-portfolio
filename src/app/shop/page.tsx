"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/layout/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { Product, ProductCategory } from "@/types/shop";
import { useTracking, usePageView } from "@/hooks/useTracking";
import { motion } from "framer-motion";

const CATEGORIES: { label: string; value: ProductCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Templates", value: "template" },
  { label: "SaaS Starters", value: "saas" },
  { label: "APIs & Systems", value: "api" },
  { label: "Services", value: "service" },
];

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
    <Container className="py-16">
      {/* ── Live E-Commerce Store Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-transparent mb-14 p-8"
      >
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(rgba(16,185,129,0.2) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-medium">Live Project</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Full E-Commerce Store</h2>
            <p className="text-gray-500 text-sm max-w-md">
              Production-ready store with product catalog, PromptPay QR checkout, order management, and admin dashboard with sales reports.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Next.js 15", "Prisma", "NextAuth", "Zustand", "Recharts"].map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800/60 text-gray-500">{t}</span>
              ))}
            </div>
          </div>
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold transition-colors"
          >
            Open Store →
          </a>
        </div>
      </motion.div>

      <SectionHeader
        title="Templates & Systems"
        subtitle="Production-ready code built with real-world enterprise experience."
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === cat.value
                ? "bg-primary text-white shadow-glow-purple"
                : "bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-800/30 rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filtered.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ProductCard
                product={product}
                onTrack={() => track("product_view", product.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-500 py-16">No products in this category yet.</p>
      )}

      {/* Custom work CTA */}
      <div className="mt-20 text-center bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-10">
        <h2 className="text-2xl font-bold text-white mb-3">Need Something Custom?</h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-6">
          I build custom distributed systems, API integrations, and cloud-native architectures.
          Let&apos;s discuss your project.
        </p>
        <a
          href="mailto:sumet.buarod@gmail.com"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          onClick={() => track("cta_click", "contact_custom")}
        >
          Get in Touch
        </a>
      </div>
    </Container>
  );
}
