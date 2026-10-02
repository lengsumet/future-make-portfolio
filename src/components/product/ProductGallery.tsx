"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaExpand } from "react-icons/fa";
import Lightbox from "@/components/ui/Lightbox";
import TiltCard from "@/components/fx/TiltCard";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

/**
 * Screenshot gallery: the main shot on a card that tilts toward the pointer,
 * a strip of rounded thumbnails with a caramel ring on the active one, and a
 * lightbox.
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
      <div className="relative">
        <div className="absolute inset-x-0 -top-6 bottom-0 -z-10 rounded-full md:-inset-x-6 bg-[radial-gradient(closest-side,rgba(192,133,82,0.28),transparent)] blur-2xl" aria-hidden="true" />
        <TiltCard className="rounded-[22px] border border-[var(--border-mid)] bg-[var(--surface)] p-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]" max={5}>
          {/*
            aspect-[16/10] with object-contain: every screenshot is 16:10, so
            the box matches the source and the whole frame shows; contain keeps
            that true if a differently shaped image is ever added.
          */}
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={`Enlarge ${title} screenshot`}
            className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-[16px] bg-[var(--surface-2)]"
          >
            <Image
              src={images[shot]}
              alt={title}
              fill
              priority
              sizes="(min-width: 1024px) 720px, 95vw"
              className="object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-[1.02]"
            />
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex translate-y-1 items-center gap-1.5 rounded-full border border-[var(--border-mid)] bg-black/70 px-3 py-1 font-mono text-2xs text-[var(--text-1)] opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              <FaExpand size={9} aria-hidden="true" />
              Enlarge
            </span>
          </button>
        </TiltCard>
      </div>

      {images.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
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
                  "relative h-14 w-[5.5rem] overflow-hidden rounded-[10px] border transition-all duration-200 " +
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] " +
                  (active
                    ? "border-transparent opacity-100 ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]"
                    : "border-[var(--border-mid)] opacity-55 hover:opacity-100")
                }
              >
                <Image src={img} alt="" fill sizes="88px" className="object-cover object-top" />
              </button>
            );
          })}
          <span className="ml-auto font-mono text-2xs tabular-nums text-[var(--text-3)]" aria-hidden="true">
            {String(shot + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
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
