"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Product } from "@/types/shop";
import { FaExternalLinkAlt, FaStar } from "react-icons/fa";
import { Skeleton, LoadingRegion } from "@/components/ui/Skeleton";
import { PageHeader, StatusPill } from "@/components/admin/AdminKit";

export default function AdminProductsPage() {
  const reduce = useReducedMotion();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop/products")
      .then((r) => r.json())
      .then((d) => { setProducts(d); setLoading(false); });
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="02 — Catalogue"
        title="Products"
        description={
          <>
            <span className="font-mono" style={{ color: "var(--text-2)" }}>{products.length}</span> products listed in the shop
          </>
        }
        actions={
          <span className="inline-flex items-center rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs" style={{ color: "var(--text-3)" }}>
            Edit via public/data/products.json
          </span>
        }
      />

      {loading ? (
        <LoadingRegion label="Loading products">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-[20px]" />
            ))}
          </div>
        </LoadingRegion>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {products.map((product, i) => (
            <motion.li
              key={product.id}
              className="flex flex-col rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--border-mid)]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.04 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="eyebrow">{product.category}</span>
                    <StatusPill status={product.status} />
                    {product.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-0.5 text-xs text-[var(--accent-3)]">
                        <FaStar size={8} aria-hidden="true" /> Featured
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-lg font-medium leading-snug" style={{ color: "var(--text-1)" }}>
                    {product.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                    {product.shortDescription}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-lg tabular-nums" style={{ color: "var(--text-1)" }}>
                    ฿{product.price.toLocaleString()}
                  </p>
                  <Link
                    href={`/shop/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[var(--accent-3)] transition-colors hover:text-[var(--text-1)]"
                  >
                    View <FaExternalLinkAlt size={8} aria-hidden="true" />
                    <span className="sr-only">{product.title} (opens in a new tab)</span>
                  </Link>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {product.techStack.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-2xs"
                    style={{ color: "var(--text-3)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <div className="rounded-[20px] border border-[var(--accent-border)] bg-[var(--accent-bg)] px-6 py-4 text-sm" style={{ color: "var(--text-2)" }}>
        To add or edit products, update{" "}
        <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs" style={{ color: "var(--accent-fg)" }}>
          public/data/products.json
        </code>
        . Changes will reflect immediately.
      </div>
    </div>
  );
}
