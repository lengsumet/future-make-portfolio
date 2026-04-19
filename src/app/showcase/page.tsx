"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShowcaseModal from "@/components/showcase/ShowcaseModal";

interface ShowcaseItem {
  id: number;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  gallery: string[];
  tags: string[];
  price: number;
  livePreview: string;
}

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

export default function ShowcasePage() {
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);

  useEffect(() => {
    fetch("/data/showcase.json")
      .then((r) => r.json())
      .then((data) => setShowcaseItems(data))
      .catch(() => {});
  }, []);

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="mb-14"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            Portfolio
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "#fff" }}>
            Website Showcase
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            A collection of my finest work and templates.
          </p>
        </motion.div>

        {/* Grid */}
        {showcaseItems.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-64 animate-pulse"
                style={{ background: "rgba(255,255,255,0.03)" }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {showcaseItems.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: spring },
                }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedItem(item)}
                className="cursor-pointer rounded-2xl overflow-hidden group"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(192, 133, 82,0.3)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                }}
              >
                {/* Image */}
                {item.image && (
                  <div className="h-40 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-sm font-semibold mb-1.5 text-white">{item.title}</h3>
                  <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <ShowcaseModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
