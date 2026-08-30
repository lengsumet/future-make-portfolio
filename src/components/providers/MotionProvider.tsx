"use client";

import { MotionConfig } from "framer-motion";

/**
 * reducedMotion="user" makes every framer-motion component in the tree respect
 * the OS-level "reduce motion" setting: transform/layout animations are dropped
 * while opacity and colour transitions still run, so nothing disappears.
 *
 * Wraps the whole app so the loading screen, page transitions, scroll reveals
 * and the hero parallax are all covered from one place.
 */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
