"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnalyticsEventType } from "@/types/analytics";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("_sid");
  if (!id) {
    id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("_sid", id);
  }
  return id;
}

export function useTracking() {
  const track = useCallback(
    (event: AnalyticsEventType, element?: string, metadata?: Record<string, unknown>) => {
      if (typeof window === "undefined") return;
      const payload = {
        sessionId: getSessionId(),
        eventType: event,
        page: window.location.pathname,
        element,
        metadata,
      };
      // Fire-and-forget using sendBeacon for reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", JSON.stringify(payload));
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    },
    []
  );

  return { track };
}

// Auto track page views on mount
export function usePageView() {
  const tracked = useRef(false);
  const { track } = useTracking();

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("page_view");
    }
  }, [track]);
}

// Track scroll depth
export function useScrollDepth() {
  const { track } = useTracking();
  const milestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.body.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);

      for (const milestone of [25, 50, 75, 100]) {
        if (pct >= milestone && !milestones.current.has(milestone)) {
          milestones.current.add(milestone);
          track("scroll_depth", undefined, { depth: milestone });
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [track]);
}
