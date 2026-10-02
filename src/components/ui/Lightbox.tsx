"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface LightboxProps {
  images: string[];
  index: number;
  alt: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/**
 * Full-bleed image viewer for the showcase gallery.
 *
 * Rendered through a portal on `document.body` rather than inline: the modal
 * it opens from is a framer-motion element whose `scale` leaves a transform on
 * the node, and a transformed ancestor makes `position: fixed` resolve against
 * that ancestor instead of the viewport — the overlay would have been trapped
 * inside the modal box.
 */
const Lightbox: React.FC<LightboxProps> = ({ images, index, alt, onIndexChange, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  useEffect(() => setMounted(true), []);

  const count = images.length;
  const go = useCallback(
    (delta: number) => onIndexChange((index + delta + count) % count),
    [index, count, onIndexChange]
  );

  useEffect(() => {
    restoreFocusRef.current = document.activeElement;
    closeRef.current?.focus();

    /*
      Capture phase, and it stops propagation on the keys it handles.
      The Modal underneath listens for Escape on `window` to close the whole
      showcase dialog; without this, one Escape would dismiss the lightbox and
      the modal behind it in the same keystroke.
    */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowRight" && count > 1) {
        e.stopPropagation();
        go(1);
      } else if (e.key === "ArrowLeft" && count > 1) {
        e.stopPropagation();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey, true);

    return () => {
      window.removeEventListener("keydown", onKey, true);
      (restoreFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose, go, count]);

  if (!mounted) return null;

  /*
    z-10 on every control, and it is load-bearing.
    The image below is `fill` — absolutely positioned across the whole overlay
    — and being a later positioned sibling it painted over these buttons, so
    Next/Prev/Close were visible but swallowed every click.
  */
  const navButton =
    "absolute z-10 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center " +
    "text-[var(--text-2)] bg-[var(--surface)]/80 border border-[var(--border-mid)] backdrop-blur transition-all duration-150 " +
    "hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] hover:border-[var(--accent-border)] motion-safe:hover:scale-105 motion-safe:active:scale-95";

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="lightbox"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10"
        style={{ background: "rgba(12,9,8,0.94)", backdropFilter: "blur(6px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${alt} — enlarged image ${index + 1} of ${count}`}
      >
        {/*
          The backdrop is a real button under everything, so a click anywhere
          outside the controls dismisses — the image above it ignores the
          pointer. Out of the tab order: the labelled Close button is the
          keyboard path, and Escape works too.
        */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close enlarged image"
          onClick={onClose}
          className="absolute inset-0 h-full w-full cursor-zoom-out"
        />

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close enlarged image"
          className="absolute z-10 top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-2)] bg-[var(--surface)]/80 border border-[var(--border-mid)] transition-all duration-150 hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] hover:border-[var(--accent-border)] motion-safe:hover:rotate-90"
        >
          <FaTimes size={16} />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className={`${navButton} left-3 md:left-6`}
              onClick={(e) => { e.stopPropagation(); go(-1); }}
            >
              <FaChevronLeft size={15} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className={`${navButton} right-3 md:right-6`}
              onClick={(e) => { e.stopPropagation(); go(1); }}
            >
              <FaChevronRight size={15} />
            </button>
          </>
        )}

        {/*
          object-contain, not cover: the point of opening this is to see the
          whole screenshot rather than a crop of its middle.

          pointer-events-none: `fill` makes this box cover the whole overlay,
          and the clicks have to fall through to the backdrop button so the
          dark bands beside a letterboxed screenshot — the obvious place to
          click to dismiss — still close it.
        */}
        <motion.div
          key={images[index]}
          className="pointer-events-none relative w-full h-full"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={images[index]}
            alt={`${alt} — image ${index + 1} of ${count}`}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </motion.div>

        {count > 1 && (
          <span className="absolute z-10 bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-[var(--border-mid)] bg-[var(--surface)]/80 px-3 py-1 font-mono text-2xs tabular-nums text-[var(--text-2)]">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default Lightbox;
