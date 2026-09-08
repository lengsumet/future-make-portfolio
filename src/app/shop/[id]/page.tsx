"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types/shop";
import { useTracking, usePageView } from "@/hooks/useTracking";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaExternalLinkAlt, FaArrowLeft, FaTimes } from "react-icons/fa";
import LiveStats from "@/components/product/LiveStats";
import ProductGallery from "@/components/product/ProductGallery";
import { liveSystemFor } from "@/lib/live-systems";

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

  const priceFormatted = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(product.price);

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
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-background border border-border rounded-2xl w-full max-w-md p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Complete Purchase</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <FaTimes />
          </button>
        </div>

        <div className="bg-surface-2 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground">{product.title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{priceFormatted}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full-name" className="block text-sm text-muted-foreground mb-1">Full Name *</label>
            <input id="full-name"
              type="text"
              required
              value={form.buyerName}
              onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
              className="w-full bg-surface-2 border border-input rounded-lg px-4 py-2.5 text-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-muted-foreground mb-1">Email *</label>
            <input id="email"
              type="email"
              required
              value={form.buyerEmail}
              onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
              className="w-full bg-surface-2 border border-input rounded-lg px-4 py-2.5 text-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="notes-optional" className="block text-sm text-muted-foreground mb-1">Notes (optional)</label>
            <textarea id="notes-optional"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-surface-2 border border-input rounded-lg px-4 py-2.5 text-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 resize-none"
              rows={2}
              placeholder="Any specific requirements..."
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
            After placing order, transfer via PromptPay 095-803-9303 and email the slip to sumet.buarod@gmail.com
          </div>

          <Button variant="primary" size="lg" disabled={loading} type="submit">
            {loading ? "Placing Order..." : `Place Order — ${priceFormatted}`}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function SuccessModal({ orderNumber, onClose }: { orderNumber: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background border border-green-500/40 rounded-2xl w-full max-w-md p-8 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-green-400 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-4">Your order number is:</p>
        <p className="text-xl font-mono text-green-400 bg-surface-2 rounded-lg px-4 py-2 mb-6">
          {orderNumber}
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          Transfer via PromptPay <strong className="text-foreground">095-803-9303</strong> and email
          the slip to <strong className="text-foreground">sumet.buarod@gmail.com</strong> with your
          order number. Delivery within 24 hours.
        </p>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </motion.div>
    </motion.div>
  );
}

export default function ProductDetailPage() {
  usePageView();
  const { track } = useTracking();
  const params = useParams();
  const router = useRouter();
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

  const priceFormatted = product
    ? new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
      }).format(product.price)
    : "";

  if (loading)
    return (
      <Container className="py-24 text-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </Container>
    );
  if (!product)
    return (
      <Container className="py-24 text-center">
        <p className="text-muted-foreground">Product not found.</p>
      </Container>
    );

  return (
    <Container className="py-16">
      <button
        onClick={() => router.push('/shop')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <FaArrowLeft size={12} /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Info */}
        <div>
          <div className="mb-8">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {product.category}
            </span>
            {product.featured && (
              <span className="bg-accent/20 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.title}</h1>
          <p className="text-ink-2 text-lg mb-8 leading-relaxed">{product.longDescription}</p>

          <h3 className="text-lg font-semibold text-foreground mb-4">What is Included</h3>
          <ul className="space-y-2 mb-8">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-ink-2">
                <FaCheck className="text-green-400 mt-1 flex-shrink-0" size={12} />
                {f}
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-foreground mb-3">Tech Stack</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {product.techStack.map((t) => (
              <span key={t} className="bg-surface-3 text-ink-2 text-sm px-3 py-1 rounded-lg">
                {t}
              </span>
            ))}
          </div>

          {liveSystem && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">Live System Stats</h3>
              <LiveStats system={liveSystem} />
            </div>
          )}

          <h3 className="text-lg font-semibold text-foreground mb-3">Deliverables</h3>
          <ul className="space-y-2">
            {product.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 text-muted-foreground text-sm">
                <FaCheck className="text-primary mt-1 flex-shrink-0" size={11} />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Buy panel */}
        <div>
          <div className="sticky top-8 bg-surface-2 border border-border rounded-2xl p-6">
            <div className="text-4xl font-bold text-foreground mb-1">{priceFormatted}</div>
            <p className="text-muted-foreground text-sm mb-6">One-time payment · Lifetime access</p>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  track("checkout_start", product.id);
                  setShowCheckout(true);
                }}
              >
                Buy Now
              </Button>
              {product.demoUrl !== "#" && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border border-input text-ink-2 hover:text-foreground rounded-xl py-3 text-sm font-medium transition-colors"
                  onClick={() => track("demo_click", product.id)}
                >
                  <FaExternalLinkAlt size={12} /> View Live Demo
                </a>
              )}
              {product.demoLogin && product.demoLogin.length > 0 && (
                <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs">
                  <p className="mb-2 font-semibold text-foreground">Demo login</p>
                  <p className="mb-2 text-muted-foreground">
                    Sign in to the live demo with any of these seeded accounts. Data resets and is shared, so do not enter anything private.
                  </p>
                  <ul className="space-y-1.5">
                    {product.demoLogin.map((account) => (
                      <li key={account.email} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="w-24 shrink-0 text-muted-foreground">{account.role}</span>
                        <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">{account.email}</code>
                        <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">{account.password}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-400" size={11} /> Source code included
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-400" size={11} /> Setup documentation
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-400" size={11} /> Email support after purchase
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
              <p className="mb-1 font-medium text-muted-foreground">Payment via PromptPay</p>
              <p>095-803-9303 · Sumet B.</p>
              <p className="mt-1">After payment, email slip to sumet.buarod@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
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
            orderNumber={orderNumber}
            onClose={() => setOrderNumber("")}
          />
        )}
      </AnimatePresence>
    </Container>
  );
}
