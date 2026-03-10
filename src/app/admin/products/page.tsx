"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Product } from "@/types/shop";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop/products")
      .then((r) => r.json())
      .then((d) => { setProducts(d); setLoading(false); });
  }, []);

  const categoryBadge: Record<string, string> = {
    template: "bg-emerald-500/20 text-emerald-300",
    service: "bg-blue-500/20 text-blue-300",
    saas: "bg-green-500/20 text-green-300",
    api: "bg-orange-500/20 text-orange-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="text-sm text-gray-400">{products.length} products</p>
        </div>
        <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg">
          Edit via public/data/products.json
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-800/30 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${categoryBadge[product.category]}`}>
                      {product.category}
                    </span>
                    {product.featured && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white truncate">{product.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{product.shortDescription}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-white">
                    ฿{product.price.toLocaleString()}
                  </p>
                  <Link
                    href={`/shop/${product.slug}`}
                    target="_blank"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 justify-end mt-1"
                  >
                    View <FaExternalLinkAlt size={9} />
                  </Link>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {product.techStack.slice(0, 4).map((t) => (
                  <span key={t} className="text-xs bg-gray-700/60 text-gray-400 px-1.5 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-300">
        To add or edit products, update{" "}
        <code className="bg-blue-900/30 px-1 rounded">public/data/products.json</code>. Changes will reflect immediately.
      </div>
    </div>
  );
}
