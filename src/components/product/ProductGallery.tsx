"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaSearchPlus } from "react-icons/fa";
import Lightbox from "@/components/ui/Lightbox";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

/**
 * Screenshot gallery: a main panel, a thumbnail strip, and a lightbox.
 *
 * Lifted out of the old showcase modal when the showcase and shop pages were
 * merged. The shop carried `thumbnail` and `images` in its data all along and
 * rendered neither — the detail page had no <Image> at all and the card drew a
 * 10%-opacity letter in place of the screenshot.
 */
export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [shot, setShot] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // Back to the first image whenever a different product is shown — otherwise
  // a three-image product opened after a two-image one starts on an index that
  // no longer exists and the panel renders nothing.
  useEffect(() => {
    setShot(0);
    setZoomed(false);
  }, [title]);

  if (!images?.length) return null;

  return (
    <div>
      {/*
        aspect-[16/10] with object-contain, not a fixed height with object-cover.
        The panel used to be an h-96 box roughly 1:1, and every screenshot is
        3200x2000 (16:10) — object-cover threw away about a third of the width,
        cutting the sidebar off one edge and a column off the other. Matching
        the box to the source shows the whole frame; contain keeps that true if
        a differently shaped image is ever added.
      */}
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label={`Enlarge ${title} screenshot`}
        className="group relative block w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 cursor-zoom-in bg-black/25"
      >
        <Image src={images[shot]} alt={title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
        <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/25" />
        <span
          className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white opacity-0 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
          style={{ background: "rgba(17,17,24,0.85)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <FaSearchPlus size={11} />
          Click to enlarge
        </span>
      </button>

      {images.length > 1 && (
        <div className="flex space-x-2">
          {images.map((img, index) => {
            const active = index === shot;
            return (
              <button
                key={img}
                type="button"
                onClick={() => setShot(index)}
                aria-label={`${title} — image ${index + 1} of ${images.length}`}
                aria-current={active}
                className={
                  "relative h-16 w-16 rounded-md overflow-hidden transition-all " +
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft " +
                  (active ? "ring-2 ring-accent-soft opacity-100" : "opacity-60 hover:opacity-100")
                }
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {zoomed && (
        <Lightbox
          images={images}
          index={shot}
          alt={title}
          onIndexChange={setShot}
          onClose={() => setZoomed(false)}
        />
      )}
    </div>
  );
}
