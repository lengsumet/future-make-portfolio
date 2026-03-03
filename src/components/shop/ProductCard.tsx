"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaExternalLinkAlt, FaTag } from "react-icons/fa";
import { Product } from "@/types/shop";

interface ProductCardProps {
  product: Product;
  onTrack?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  template: "bg-purple-500/20 text-purple-300",
  service: "bg-blue-500/20 text-blue-300",
  saas: "bg-green-500/20 text-green-300",
  api: "bg-orange-500/20 text-orange-300",
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onTrack }) => {
  const priceFormatted = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <motion.div
      className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 flex flex-col"
      whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(147, 51, 234, 0.3)" }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => onTrack?.(product.id)}
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        <div className="text-6xl opacity-20 select-none">
          {product.category === "template" && "🎨"}
          {product.category === "service" && "⚙️"}
          {product.category === "saas" && "🚀"}
          {product.category === "api" && "🔌"}
        </div>
        {product.featured && (
          <span className="absolute top-3 right-3 bg-accent/90 text-black text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </span>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${categoryColors[product.category]}`}>
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
        <p className="text-gray-400 text-sm mb-4 flex-1">{product.shortDescription}</p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="bg-gray-700/60 text-gray-300 text-xs px-2 py-0.5 rounded">
              {tech}
            </span>
          ))}
          {product.techStack.length > 4 && (
            <span className="text-gray-500 text-xs px-1 py-0.5">+{product.techStack.length - 4}</span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-700/50">
          <div>
            <span className="text-2xl font-bold text-white">{priceFormatted}</span>
          </div>
          <div className="flex gap-2">
            {product.demoUrl !== "#" && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors"
                title="Live Demo"
              >
                <FaExternalLinkAlt size={14} />
              </a>
            )}
            <Link
              href={`/shop/${product.slug}`}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FaTag size={12} />
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
