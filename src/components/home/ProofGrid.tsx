"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FaShieldAlt, FaUserCheck, FaBell, FaWifi } from "react-icons/fa";
import SpotlightCard from "@/components/fx/SpotlightCard";
import NumberTicker from "@/components/fx/NumberTicker";
import EventBeams from "@/components/fx/EventBeams";

/**
 * How the platform is built, as an Aceternity-style bento grid: a count-up
 * figure, the event bus drawn as live beams, and three smaller facts. Every
 * claim here is something the code actually does.
 */
const SMALL = [
  {
    icon: FaUserCheck,
    title: "One identity",
    body: "A central user directory: one account per person, a role in each app, verified at every sign-in.",
  },
  {
    icon: FaBell,
    title: "Errors find people",
    body: "Every app reports failures to one hub that groups them by cause; alerts reach a webhook or an inbox.",
  },
  {
    icon: FaWifi,
    title: "Sells while offline",
    body: "The point of sale queues sales in the browser when the network drops and replays them — never booking one twice.",
  },
];

export default function ProofGrid() {
  const reduce = useReducedMotion();
  const reveal = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.06 },
  });

  return (
    <section className="px-5 pb-24 md:px-10 md:pb-28">
      <div className="mx-auto max-w-[1200px]">
        <p className="eyebrow">How it&apos;s built</p>
        <h2 className="display text-silver mt-3 text-[clamp(2.25rem,5vw,4rem)]">
          Engineered, <span className="accent-serif">not assembled.</span>
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <motion.div className="md:col-span-3" {...reveal(0)}>
            <SpotlightCard className="h-full p-7 md:p-9">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)] opacity-25 blur-3xl" aria-hidden="true" />
              <FaShieldAlt className="text-[var(--accent-3)]" size={18} aria-hidden="true" />
              <p className="display text-silver mt-10 text-[clamp(4rem,9vw,7.5rem)]">
                <NumberTicker value={1156} />
              </p>
              <h3 className="mt-2 text-lg font-medium" style={{ color: "var(--text-1)" }}>
                automated tests across eight apps
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                Stock, payments, approvals, shipments and work orders run against an in-memory database. Every defect
                the suites found became a regression test before it was fixed.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div className="md:col-span-3" {...reveal(1)}>
            <SpotlightCard className="h-full p-7 md:p-9">
              <div className="flex h-full flex-col">
                <div className="-mx-2 h-56 md:h-60">
                  <EventBeams />
                </div>
                <h3 className="mt-4 text-lg font-medium" style={{ color: "var(--text-1)" }}>
                  Nine systems, one event bus
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                  Signed webhooks and a transactional outbox: a goods receipt in the warehouse moves stock in
                  inventory, a finished work order draws its materials, and everything reports to the dashboard.
                </p>
              </div>
            </SpotlightCard>
          </motion.div>

          {SMALL.map(({ icon: Icon, title, body }, i) => (
            <motion.div key={title} className="md:col-span-2" {...reveal(i + 2)}>
              <SpotlightCard className="h-full p-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-mid)] bg-white/[0.03] text-[var(--accent-3)]">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-medium" style={{ color: "var(--text-1)" }}>
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                  {body}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
