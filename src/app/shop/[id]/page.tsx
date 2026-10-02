"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Product } from "@/types/shop";
import { useTracking, usePageView } from "@/hooks/useTracking";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FaCheck, FaArrowRight, FaArrowLeft, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import LiveStats from "@/components/product/LiveStats";
import ProductGallery from "@/components/product/ProductGallery";
import { splitTitle, formatTHB } from "@/components/shop/ProductCard";
import { liveSystemFor } from "@/lib/live-systems";
import Spotlight from "@/components/fx/Spotlight";
import BlurText from "@/components/fx/BlurText";

const ease = [0.22, 1, 0.36, 1] as const;

const categoryLabels: Record<string, string> = {
  template: "Template",
  service: "Service",
  saas: "SaaS",
  api: "API",
  fullstack: "Enterprise system",
};

const primaryPill =
  "group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[var(--text-1)] px-6 py-3.5 text-sm font-medium text-[var(--background)] shadow-[0_0_50px_-12px_rgba(255,248,240,0.6)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50";
const ghostPill =
  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border-mid)] px-6 py-3.5 text-sm font-medium text-[var(--text-2)] transition-colors hover:border-[var(--accent-border)] hover:bg-white/[0.04] hover:text-[var(--text-1)]";
const field =
  "w-full rounded-xl border border-[var(--border-strong-visible)] bg-[var(--surface-2)] px-4 py-2.5 text-[var(--text-1)] placeholder:text-[var(--text-4)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40";

/** A caramel check, the bullet for every list on this page. */
function Check({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent-3)] ${small ? "h-4 w-4" : "h-5 w-5"}`}
      aria-hidden="true"
    >
      <FaCheck size={small ? 7 : 8} />
    </span>
  );
}

/**
 * The dialog shell shared by checkout and success: a real backdrop button to
 * dismiss, Escape to close, focus moved in on open and back out on close.
 */
function Dialog({
  labelledBy,
  onClose,
  children,
  className = "",
}: {
  labelledBy: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  // Held in a ref so a new closure from the parent does not re-run the effect
  // below — that would pull focus back to the first field on every render.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("input") ?? panel?.querySelector<HTMLElement>("button"))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      restore?.focus?.();
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative isolate w-full max-w-md overflow-hidden rounded-[24px] border border-[var(--border-mid)] bg-[var(--surface)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ${className}`}
        initial={reduce ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease }}
      >
        <div className="absolute inset-x-[15%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />
        <div className="absolute left-1/2 top-0 -z-10 h-24 w-2/3 -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-15 blur-3xl" aria-hidden="true" />
        {children}
      </motion.div>
    </motion.div>
  );
}

function CheckoutModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product;
  onClose: () => void;
  onSuccess: (orderNumber: string) => void;
}) {
  const { track } = useTracking();
  const [form, setForm] = useState({ buyerName: "", buyerEmail: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priceFormatted = formatTHB(product.price);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: form.buyerName,
          buyerEmail: form.buyerEmail,
          productId: product.id,
          productTitle: product.title,
          price: product.price,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      track("purchase_complete", product.id, { price: product.price });
      onSuccess(data.order.orderNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog labelledBy="checkout-title" onClose={onClose} className="p-6 md:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout</p>
          <h2 id="checkout-title" className="display text-silver mt-2 pb-[0.06em] text-3xl">
            Complete <span className="accent-serif">purchase</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout"
          className="rounded-full border border-[var(--border-mid)] p-2.5 text-[var(--text-3)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]"
        >
          <FaTimes size={12} />
        </button>
      </div>

      <div className="mb-6 flex items-end justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <p className="text-sm text-[var(--text-3)]">{product.title}</p>
        <p className="display text-silver shrink-0 pb-[0.06em] text-2xl">{priceFormatted}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="full-name" className="mb-1.5 block font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-3)]">Full Name *</label>
          <input
            id="full-name"
            type="text"
            required
            value={form.buyerName}
            onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
            className={field}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-3)]">Email *</label>
          <input
            id="email"
            type="email"
            required
            value={form.buyerEmail}
            onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
            className={field}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="notes-optional" className="mb-1.5 block font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-3)]">Notes (optional)</label>
          <textarea
            id="notes-optional"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={`${field} resize-none`}
            rows={2}
            placeholder="Any specific requirements..."
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] p-3.5 text-sm leading-relaxed text-[var(--accent-fg)]">
          After placing order, transfer via PromptPay <span className="whitespace-nowrap font-mono">095-803-9303</span> and email the slip to{" "}
          <span className="font-mono">sumet.buarod@gmail.com</span>
        </div>

        <button type="submit" disabled={loading} className={primaryPill}>
          {loading ? "Placing Order..." : `Place Order — ${priceFormatted}`}
        </button>
      </form>
    </Dialog>
  );
}

function SuccessModal({ orderNumber, onClose }: { orderNumber: string; onClose: () => void }) {
  return (
    <Dialog labelledBy="success-title" onClose={onClose} className="p-8 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent-border)] bg-[var(--green-bg)] text-[var(--green)]">
        <FaCheck size={20} aria-hidden="true" />
      </div>
      <h2 id="success-title" className="display text-silver pb-[0.06em] text-3xl">
        Order <span className="accent-serif">placed!</span>
      </h2>
      <p className="mt-3 text-sm text-[var(--text-3)]">Your order number is:</p>
      <p className="mt-2 rounded-xl border border-[var(--border-mid)] bg-[var(--surface-2)] px-4 py-2.5 font-mono text-lg text-[var(--green)]">
        {orderNumber}
      </p>
      <p className="mt-5 text-sm leading-relaxed text-[var(--text-3)]">
        Transfer via PromptPay <strong className="font-medium text-[var(--text-1)]">095-803-9303</strong> and email
        the slip to <strong className="font-medium text-[var(--text-1)]">sumet.buarod@gmail.com</strong> with your
        order number. Delivery within 24 hours.
      </p>
      <button type="button" onClick={onClose} className={`${primaryPill} mt-7`}>
        Done
      </button>
    </Dialog>
  );
}

export default function ProductDetailPage() {
  usePageView();
  const { track } = useTracking();
  const reduce = useReducedMotion();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    fetch("/api/shop/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        const found = data.find((p) => p.slug === params.id);
        setProduct(found || null);
        setLoading(false);
        if (found) track("product_view", found.id);
      })
      .catch(() => setLoading(false));
  }, [params.id, track]);

  const liveSystem = liveSystemFor(product?.slug);
  const priceFormatted = product ? formatTHB(product.price) : "";

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease, delay },
  });

  const backLink = (
    <Link
      href="/shop"
      className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3.5 py-1.5 font-mono text-2xs uppercase tracking-[0.12em] text-[var(--text-3)] transition-colors hover:border-[var(--border-mid)] hover:text-[var(--text-1)]"
    >
      <FaArrowLeft size={9} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      Back to Shop
    </Link>
  );

  if (loading)
    return (
      <div className="mx-auto box-content max-w-[1200px] px-5 py-16 md:px-10" aria-busy="true">
        <span className="sr-only">Loading product</span>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" aria-hidden="true">
          <div>
            <div className="skeleton-luxury h-6 w-40 rounded-full" />
            <div className="skeleton-luxury mt-6 h-16 w-3/4" />
            <div className="skeleton-luxury mt-10 aspect-[16/10] w-full rounded-[22px]" />
          </div>
          <div className="skeleton-luxury h-[28rem] rounded-[24px]" />
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="relative isolate overflow-hidden px-5 py-28 text-center md:px-10">
        <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
        <p className="eyebrow">404 · Shop</p>
        <h1 className="display text-silver mx-auto mt-4 max-w-xl pb-[0.06em] text-5xl">
          Product <span className="accent-serif">not found.</span>
        </h1>
        <p className="mt-4 text-sm text-[var(--text-3)]">Product not found.</p>
        <div className="mt-8 flex justify-center">{backLink}</div>
      </div>
    );

  const { name, expansion } = splitTitle(product.title);
  const hasDemo = product.demoUrl !== "#";

  return (
    <div className="bg-[var(--background)]">
      {/* Header */}
      <section className="relative isolate overflow-hidden px-5 pb-10 pt-10 md:-mt-20 md:px-10 md:pb-12 md:pt-32">
        <div className="dot-grid absolute inset-0 -z-10" aria-hidden="true" />
        <Spotlight className="-z-10" />
        <div className="mx-auto max-w-[1200px]">
          <motion.div {...fade(0)} className="flex flex-wrap items-center gap-2">
            {backLink}
            <span className="rounded-full border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2.5 py-0.5 font-mono text-2xs text-[var(--accent-fg)]">
              {categoryLabels[product.category] ?? product.category}
            </span>
            {product.featured && (
              <span className="rounded-full border border-[var(--border-mid)] px-2.5 py-0.5 font-mono text-2xs text-[var(--text-2)]">
                Featured
              </span>
            )}
          </motion.div>

          <h1 className="display mt-7 max-w-4xl text-[clamp(2.75rem,7vw,5.75rem)]">
            <BlurText text={name} wordClassName="text-silver pb-[0.08em]" />
            {expansion && (
              <span className="mt-2 block text-[clamp(1.5rem,3.5vw,2.875rem)]">
                <BlurText text={expansion} delay={0.2} wordClassName="accent-serif pb-[0.1em]" />
              </span>
            )}
          </h1>
          <motion.p {...fade(0.35)} className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-2)] md:text-lg">
            {product.longDescription}
          </motion.p>
        </div>
      </section>

      <div className="mx-auto box-content grid max-w-[1200px] gap-x-12 gap-y-14 px-5 pb-24 md:px-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Gallery */}
        <motion.div {...fade(0.45)} className="lg:col-start-1 lg:row-start-1">
          <ProductGallery images={product.images} title={product.title} />
        </motion.div>

        {/* Buy panel: sticky, on a lit card. Placed second so it follows the
            gallery on a phone instead of sitting below every section. */}
        <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-label="Purchase">
          <motion.div
            {...fade(0.55)}
            className="relative isolate overflow-hidden rounded-[24px] border border-[var(--border-mid)] bg-[var(--surface)] p-6 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] md:p-7 lg:sticky lg:top-24"
          >
            <div className="dot-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
            <div className="absolute inset-x-[12%] top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />
            <div className="absolute left-1/2 top-0 -z-10 h-28 w-3/4 -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" aria-hidden="true" />

            <p className="eyebrow">Full source licence</p>
            <p className="display text-silver mt-3 pb-[0.06em] text-[clamp(2.75rem,5vw,3.75rem)]">{priceFormatted}</p>
            <p className="mt-1 text-sm text-[var(--text-3)]">One-time payment · Lifetime access</p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className={primaryPill}
                onClick={() => {
                  track("checkout_start", product.id);
                  setShowCheckout(true);
                }}
              >
                Buy Now
                <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
              {hasDemo && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ghostPill}
                  onClick={() => track("demo_click", product.id)}
                >
                  <FaExternalLinkAlt size={11} aria-hidden="true" /> View Live Demo
                </a>
              )}
            </div>

            {product.demoLogin && product.demoLogin.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border-mid)] bg-[var(--background)] font-mono text-2xs">
                <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-3.5 py-2.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
                  <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
                  <span className="h-2 w-2 rounded-full bg-[var(--surface-3)]" />
                  <span className="ml-2 text-[var(--text-4)]">demo-credentials</span>
                </div>
                <div className="px-3.5 py-3">
                  <p className="font-semibold uppercase tracking-[0.12em] text-[var(--accent-3)]">Demo login</p>
                  <p className="mt-1.5 font-sans text-xs leading-relaxed text-[var(--text-3)]">
                    Sign in to the live demo with any of these seeded accounts. Data resets and is shared, so do not enter anything private.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {product.demoLogin.map((account) => (
                      <li key={account.email} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="w-20 shrink-0 text-[var(--text-3)]">{account.role}</span>
                        <code className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[var(--text-1)]">{account.email}</code>
                        <code className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[var(--accent-fg)]">{account.password}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <ul className="mt-6 space-y-2.5 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-2)]">
              <li className="flex items-center gap-2.5"><Check small /> Source code included</li>
              <li className="flex items-center gap-2.5"><Check small /> Setup documentation</li>
              <li className="flex items-center gap-2.5"><Check small /> Email support after purchase</li>
            </ul>

            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white/[0.02] p-4 text-sm">
              <p className="eyebrow">Payment via PromptPay</p>
              <p className="mt-2 font-mono text-[var(--text-1)]">095-803-9303 · Sumet B.</p>
              <p className="mt-1 text-[var(--text-3)]">After payment, email slip to sumet.buarod@gmail.com</p>
            </div>
          </motion.div>
        </aside>

        {/* Sections */}
        <div className="space-y-14 lg:col-start-1 lg:row-start-2">
          <section aria-labelledby="included-title">
            <p className="eyebrow rule">01 · Included</p>
            <h2 id="included-title" className="display text-silver mt-4 pb-[0.06em] text-3xl md:text-4xl">
              What is <span className="accent-serif">included</span>
            </h2>
            <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-2)]">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="stack-title">
            <p className="eyebrow rule">02 · Stack</p>
            <h2 id="stack-title" className="display text-silver mt-4 pb-[0.06em] text-3xl md:text-4xl">
              Tech <span className="accent-serif">stack</span>
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.techStack.map((t) => (
                <li key={t} className="rounded-full border border-[var(--border-mid)] bg-white/[0.02] px-3 py-1 font-mono text-xs text-[var(--text-2)]">
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {liveSystem && (
            <section aria-labelledby="live-title">
              <p className="eyebrow rule">03 · Live</p>
              <h2 id="live-title" className="display text-silver mt-4 pb-[0.06em] text-3xl md:text-4xl">
                Live system <span className="accent-serif">stats</span>
              </h2>
              <div className="mt-6">
                <LiveStats system={liveSystem} />
              </div>
            </section>
          )}

          <section aria-labelledby="deliverables-title">
            <p className="eyebrow rule">{liveSystem ? "04" : "03"} · Deliverables</p>
            <h2 id="deliverables-title" className="display text-silver mt-4 pb-[0.06em] text-3xl md:text-4xl">
              What you <span className="accent-serif">receive</span>
            </h2>
            <ul className="mt-6 space-y-3">
              {product.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-2)]">
                  <Check small />
                  {d}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            key="checkout"
            product={product}
            onClose={() => setShowCheckout(false)}
            onSuccess={(num) => {
              setShowCheckout(false);
              setOrderNumber(num);
            }}
          />
        )}
        {orderNumber && (
          <SuccessModal
            key="success"
            orderNumber={orderNumber}
            onClose={() => setOrderNumber("")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
