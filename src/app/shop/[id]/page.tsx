"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types/shop";
import { useTracking, usePageView } from "@/hooks/useTracking";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaExternalLinkAlt, FaArrowLeft, FaTimes } from "react-icons/fa";
import LiveStats from "@/components/showcase/LiveStats";

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
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Complete Purchase</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-400">{product.title}</p>
          <p className="text-2xl font-bold text-white mt-1">{priceFormatted}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.buyerName}
              onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.buyerEmail}
              onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none resize-none"
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
        className="bg-gray-900 border border-green-500/40 rounded-2xl w-full max-w-md p-8 text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-green-400 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
        <p className="text-gray-400 mb-4">Your order number is:</p>
        <p className="text-xl font-mono text-green-400 bg-gray-800 rounded-lg px-4 py-2 mb-6">
          {orderNumber}
        </p>
        <p className="text-gray-400 text-sm mb-6">
          Transfer via PromptPay <strong className="text-white">095-803-9303</strong> and email
          the slip to <strong className="text-white">sumet.buarod@gmail.com</strong> with your
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
        <div className="animate-pulse text-gray-500">Loading...</div>
      </Container>
    );
  if (!product)
    return (
      <Container className="py-24 text-center">
        <p className="text-gray-400">Product not found.</p>
      </Container>
    );

  return (
    <Container className="py-16">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <FaArrowLeft size={12} /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Info */}
        <div>
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{product.title}</h1>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">{product.longDescription}</p>

          <h3 className="text-lg font-semibold text-white mb-4">What is Included</h3>
          <ul className="space-y-2 mb-8">
            {product.features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-gray-300">
                <FaCheck className="text-green-400 mt-1 flex-shrink-0" size={12} />
                {f}
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-white mb-3">Tech Stack</h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {product.techStack.map((t) => (
              <span key={t} className="bg-gray-700/60 text-gray-300 text-sm px-3 py-1 rounded-lg">
                {t}
              </span>
            ))}
          </div>

          {/* Live Stats for WMS product */}
          {product.demoUrl?.includes("3001") && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Live System Stats</h3>
              <LiveStats system="wms" />
            </div>
          )}

          {/* Live Stats for POS product */}
          {product.demoUrl?.includes("3002") && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Live System Stats</h3>
              <LiveStats system="pos" />
            </div>
          )}

          {/* Live Stats for CRM product */}
          {product.demoUrl?.includes("3003") && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Live System Stats</h3>
              <LiveStats system="crm" />
            </div>
          )}

          {/* Live Stats for TMS product */}
          {product.demoUrl?.includes("3004") && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Live System Stats</h3>
              <LiveStats system="tms" />
            </div>
          )}

          <h3 className="text-lg font-semibold text-white mb-3">Deliverables</h3>
          <ul className="space-y-2">
            {product.deliverables.map((d) => (
              <li key={d} className="flex items-start gap-3 text-gray-400 text-sm">
                <FaCheck className="text-primary mt-1 flex-shrink-0" size={11} />
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Buy panel */}
        <div>
          <div className="sticky top-8 bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6">
            <div className="text-4xl font-bold text-white mb-1">{priceFormatted}</div>
            <p className="text-gray-400 text-sm mb-6">One-time payment · Lifetime access</p>

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
                  className="flex items-center justify-center gap-2 w-full border border-gray-600 text-gray-300 hover:text-white rounded-xl py-3 text-sm font-medium transition-colors"
                  onClick={() => track("demo_click", product.id)}
                >
                  <FaExternalLinkAlt size={12} /> View Live Demo
                </a>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700/50 space-y-2 text-sm text-gray-400">
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

            <div className="mt-6 pt-6 border-t border-gray-700/50 text-sm text-gray-500">
              <p className="mb-1 font-medium text-gray-400">Payment via PromptPay</p>
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
