"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaExternalLinkAlt, FaTag } from "react-icons/fa";
import { Product } from "@/types/shop";

interface ProductCardProps {
  product: Product;
  onTrack?: (id: string) => void;
}

/*
  Text colour only. These badges used to carry their own translucent fill
  (`bg-primary/20`), which worked while the thumbnail was a flat dark
  placeholder — over a real screenshot of a white dashboard the light caramel
  text on a 20%-opaque wash was unreadable. The dark blurred base below is what
  makes them legible against an arbitrary image.
*/
const categoryColors: Record<string, string> = {
  template: "text-accent-soft",
  service: "text-blue-300",
  saas: "text-green-300",
  api: "text-orange-300",
  fullstack: "text-accent-soft",
};

const badgeBase =
  "absolute top-3 text-xs font-semibold px-2.5 py-1 rounded-full " +
  "bg-black/65 backdrop-blur-sm border border-white/10";

const categoryLabels: Record<string, string> = {
  template: "Template",
  service: "Service",
  saas: "SaaS",
  api: "API",
  fullstack: "Enterprise",
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onTrack }) => {
  const priceFormatted = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <motion.div
      className="group relative bg-surface-2 rounded-xl overflow-hidden border border-border flex flex-col"
      whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(192, 133, 82, 0.35)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Thumbnail — the real screenshot. This was a single letter at 10%
          opacity while `product.thumbnail` sat unused in the data. */}
      <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Scrim behind the badges, which sit at the top. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />
        {/* No "Featured" badge: 9 of the 10 products carry featured:true, so it
            marked almost everything and distinguished nothing while covering a
            corner of the screenshot. The flag stays in the data. */}
        <span className={`${badgeBase} left-3 ${categoryColors[product.category]}`}>
          {categoryLabels[product.category] ?? product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-foreground mb-2">{product.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-1">{product.shortDescription}</p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="bg-surface-3 text-ink-2 text-xs px-2 py-0.5 rounded">
              {tech}
            </span>
          ))}
          {product.techStack.length > 4 && (
            <span className="text-muted-foreground text-xs px-1 py-0.5">+{product.techStack.length - 4}</span>
          )}
        </div>

        {/* Price + CTA */}
        {/* flex-wrap, because it does not fit on one line: a text-2xl
            "฿44,900" plus the demo icon plus Buy Now overflowed the card on 9
            of the 10 products. Wrapping drops the buttons to their own row
            instead of letting them spill past the border. */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 mt-auto pt-4 border-t border-border">
          <span className="text-2xl font-bold text-foreground">{priceFormatted}</span>
          <div className="flex items-center gap-2 shrink-0">
            {product.demoUrl !== "#" && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                title="Live Demo"
              >
                <FaExternalLinkAlt size={14} />
              </a>
            )}
            <Link
              href={`/shop/${product.slug}`}
              onClick={() => onTrack?.(product.id)}
              className="flex items-center gap-2 whitespace-nowrap bg-primary hover:bg-primary/80 text-foreground text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <FaTag size={12} />
              Buy Now
            </Link>
          </div>
        </div>
      </div>

      {/*
        Stretched link — the card body itself opens the product.
        It looked clickable (`cursor-pointer`) but its only handler fired a
        tracking call, so clicking anywhere outside the two buttons did
        nothing. Kept as a real anchor rather than a router.push on the div so
        the card is reachable by keyboard and opens in a new tab on
        middle-click. z-10 puts it over the card body, under the buttons at
        z-20, which stay independently clickable.
      */}
      <Link
        href={`/shop/${product.slug}`}
        onClick={() => onTrack?.(product.id)}
        aria-label={`View ${product.title}`}
        className="absolute inset-0 z-10 rounded-xl"
      />
    </motion.div>
  );
};
