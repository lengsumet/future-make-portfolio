"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import SpotlightCard from "@/components/fx/SpotlightCard";
import { Product } from "@/types/shop";

interface ProductCardProps {
  product: Product;
  /** Position in the grid, shown as the mono index beside the name. */
  index?: number;
  /** Spans two grid columns on large screens: image beside the text. */
  wide?: boolean;
  onTrack?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  template: "Template",
  service: "Service",
  saas: "SaaS",
  api: "API",
  fullstack: "Enterprise",
};

/**
 * "Enterprise WMS (Warehouse Management System)" reads better as a large
 * "WMS" with its expansion beneath — the same split the home index uses.
 */
export function splitTitle(title: string): { name: string; expansion: string | null } {
  const match = title.match(/^(?:Enterprise\s+)?(.+?)\s*\((.+)\)\s*(?:System)?$/);
  if (match) return { name: match[1].trim(), expansion: match[2].trim() };
  return { name: title, expansion: null };
}

export function formatTHB(price: number): string {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(price);
}

/**
 * A product as a spotlight card, the same anatomy as the home page's work
 * index: screenshot that zooms on hover, name with its expansion, price,
 * mono tags and a Live pill.
 *
 * The title link is stretched over the whole card (keyboard reachable, opens
 * in a new tab on middle-click); the Live pill sits above it with its own
 * destination.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, index, wide = false, onTrack }) => {
  const { name, expansion } = splitTitle(product.title);
  const hasDemo = product.demoUrl && product.demoUrl !== "#";
  const extra = product.techStack.length - 3;

  return (
    <SpotlightCard className="group h-full">
      <div className={`flex h-full flex-col ${wide ? "lg:flex-row" : ""}`}>
        <div
          className={`relative m-2 mb-0 aspect-[16/10] overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] ${
            wide ? "lg:mb-2 lg:mr-0 lg:aspect-auto lg:min-h-[17rem] lg:w-[62%] lg:shrink-0" : ""
          }`}
        >
          <Image
            src={product.thumbnail}
            alt=""
            fill
            sizes={wide ? "(min-width: 1024px) 500px, (min-width: 768px) 50vw, 95vw" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 95vw"}
            className={`object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.05] ${wide ? "lg:object-left-top" : ""}`}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--surface)] to-transparent" aria-hidden="true" />
          <span className="absolute left-3 top-3 rounded-full border border-[var(--border-mid)] bg-black/60 px-2.5 py-0.5 font-mono text-2xs text-[var(--accent-fg)] backdrop-blur-sm">
            {categoryLabels[product.category] ?? product.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="display text-2xl text-[var(--text-1)]">
              {index !== undefined && (
                <span className="mr-2 font-mono text-xs font-normal tracking-normal text-[var(--accent-3)]" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <Link
                href={`/shop/${product.slug}`}
                onClick={() => onTrack?.(product.id)}
                className="rounded-[20px] after:absolute after:inset-0 after:rounded-[20px] after:content-[''] focus-visible:underline"
              >
                {name}
              </Link>
            </h3>
            <FaArrowRight
              size={12}
              className="shrink-0 -translate-x-1 text-[var(--accent-3)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
          {expansion && <p className="mt-1 text-sm text-[var(--text-3)]">{expansion}</p>}
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-3)]">{product.shortDescription}</p>

          <div className="mt-auto pt-5">
            <div className="flex items-end justify-between gap-3 border-t border-[var(--border)] pt-4">
              <p className="display text-silver pb-[0.06em] text-3xl">{formatTHB(product.price)}</p>
              {hasDemo && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-0.5 font-mono text-2xs text-[var(--accent-3)] transition-colors hover:bg-[rgba(192,133,82,0.2)]"
                  aria-label={`Open the live ${name} demo`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" aria-hidden="true" />
                  Live ↗
                </a>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {product.techStack.slice(0, 3).map((tech) => (
                <span key={tech} className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-2xs text-[var(--text-3)]">
                  {tech}
                </span>
              ))}
              {extra > 0 && <span className="font-mono text-2xs text-[var(--text-4)]">+{extra}</span>}
            </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};
