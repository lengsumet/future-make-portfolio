"use client";

import { motion, useReducedMotion } from "framer-motion";

interface Cell {
  index: string;
  title: string;
  body: string;
  figure?: string;
  span: string;
}

/**
 * How the platform is built, as a bento grid of facts rather than a list of
 * adjectives. Every figure here is something the code actually does.
 */
const CELLS: Cell[] = [
  {
    index: "03.1",
    figure: "1,156",
    title: "automated tests across eight apps",
    body: "Each app's money paths — stock, payments, approvals, shipments, work orders — run against an in-memory database. Every defect the suites found became a regression test before it was fixed.",
    span: "md:col-span-4 md:row-span-2",
  },
  {
    index: "03.2",
    title: "Nine systems, one event bus",
    body: "Signed webhooks and a transactional outbox. A goods receipt in the warehouse moves stock in inventory; a finished work order draws its materials.",
    span: "md:col-span-2",
  },
  {
    index: "03.3",
    title: "One identity",
    body: "A central user directory: one account per person, a role in each app, verified at every sign-in.",
    span: "md:col-span-2",
  },
  {
    index: "03.4",
    title: "Errors find people",
    body: "Every app reports failures to one hub that groups them by cause; alerts and new errors reach a webhook or an inbox.",
    span: "md:col-span-3",
  },
  {
    index: "03.5",
    title: "Sells while offline",
    body: "The point of sale queues sales in the browser when the network drops and replays them once it returns — never booking one twice.",
    span: "md:col-span-3",
  },
];

export default function ProofGrid() {
  const reduce = useReducedMotion();
  return (
    <section className="px-5 md:px-10 pb-24 md:pb-32">
      <div className="mx-auto max-w-[1400px]">
        <p className="eyebrow rule">(03) How it&apos;s built</p>
        <div className="mt-10 grid gap-3 md:grid-cols-6 md:auto-rows-[minmax(13rem,auto)]">
          {CELLS.map((cell, i) => (
            <motion.article
              key={cell.index}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
              className={`relative flex flex-col justify-between overflow-hidden rounded-[20px] border p-6 md:p-8 ${cell.span}`}
              style={{ borderColor: "var(--border-mid)", background: "var(--surface)" }}
            >
              {cell.figure && (
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
                  style={{ background: "var(--accent)" }}
                  aria-hidden="true"
                />
              )}
              <span className="eyebrow">{cell.index}</span>
              <div className="relative mt-8">
                {cell.figure && (
                  <p className="display text-[clamp(4.5rem,11vw,10rem)]" style={{ color: "var(--text-1)" }}>
                    {cell.figure}
                  </p>
                )}
                <h3
                  className={cell.figure ? "mt-2 text-xl md:text-2xl" : "display text-3xl md:text-4xl"}
                  style={{ color: "var(--text-1)" }}
                >
                  {cell.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                  {cell.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
