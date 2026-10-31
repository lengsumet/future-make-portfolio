"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import CatFigure, { type Pose } from "./cat/CatFigure";

/**
 * A cat that lives along the bottom of every page (mounted in ClientShell).
 *
 * On its own it wanders, sits, grooms, yawns, stretches and — once the mouse
 * has been still for a while — curls up and sleeps. A cursor nearby makes it
 * look, then trot over, crouch and pounce. Clicking it makes it purr; a hard
 * scroll startles it.
 *
 * Position lives in refs and is written straight to the DOM every frame;
 * React only re-renders when the pose changes. With reduced motion the cat
 * just sleeps in the corner.
 */

const CAT_W = 96;
const WALK_SPEED = 45;
const TROT_SPEED = 130;
const CURIOUS_DIST = 260;
const CHASE_DIST = 150;
const CATCH_DIST = 60;
const MOUSE_FRESH_MS = 6000;   // a cursor still for longer than this is ignored
const SLEEPY_AFTER_MS = 20000; // no mouse movement this long → sleeping becomes likely
const SCROLL_STARTLE = 2500;   // px/s

type Step = { pose: Pose; ms: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function pick<T>(weighted: [T, number][]): T {
  let r = Math.random() * weighted.reduce((n, [, w]) => n + w, 0);
  for (const [v, w] of weighted) if ((r -= w) <= 0) return v;
  return weighted[0][0];
}

/* What the cat does next when nothing is going on. */
function idlePlan(after: Pose, sleepy: boolean): Step[] {
  if (after === "sleep") return [{ pose: "yawn", ms: 1400 }, { pose: "stretch", ms: 1800 }];
  if (after !== "walk") return [{ pose: "walk", ms: rand(3500, 8000) }];
  const next = pick<Pose>([
    ["walk", 3], ["sit", 3], ["groom", 2], ["stretch", 1], ["yawn", 1], ["sleep", sleepy ? 6 : 0.4],
  ]);
  switch (next) {
    case "sit":   return [{ pose: "sit", ms: rand(2500, 6000) }, ...(Math.random() < 0.4 ? [{ pose: "groom" as Pose, ms: rand(2000, 3500) }] : [])];
    case "groom": return [{ pose: "sit", ms: 800 }, { pose: "groom", ms: rand(2500, 4500) }];
    case "yawn":  return [{ pose: "sit", ms: 600 }, { pose: "yawn", ms: 1400 }, { pose: "sit", ms: 1500 }];
    case "sleep": return [{ pose: "yawn", ms: 1400 }, { pose: "sleep", ms: rand(18000, 40000) }];
    case "stretch": return [{ pose: "stretch", ms: 1800 }];
    default:      return [{ pose: "walk", ms: rand(3000, 7000) }];
  }
}

type Float = { id: number; kind: "heart" | "z" | "!"; drift: number };

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void) => {
  const m = window.matchMedia(REDUCE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

export default function CatWidget() {
  const rootRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const brain = useRef({
    x: 160, dir: 1 as 1 | -1, pose: "walk" as Pose, until: 0, queue: [] as Step[],
    mouseX: -9999, mouseY: -9999, mouseAt: 0, lastActivity: 0, pounceTo: 0,
    scrollY: 0, scrollAt: 0, startleReadyAt: 0, pounceReadyAt: 0,
  });

  const [pose, setPose] = useState<Pose>("walk");
  const [hop, setHop] = useState<"" | "cat-hop" | "cat-hop-small">("");
  const [floats, setFloats] = useState<Float[]>([]);
  const still = useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);

  useEffect(() => {
    if (still) return;

    const b = brain.current;
    let frame = 0;
    let last = performance.now();
    let zTimer = 0;
    b.lastActivity = last;
    b.until = last + rand(3000, 6000);
    b.scrollY = window.scrollY;

    const float = (kind: Float["kind"]) => {
      const id = performance.now() + Math.random();
      setFloats((f) => [...f, { id, kind, drift: Math.round(rand(-14, 14)) }]);
      window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1700);
    };

    const go = (steps: Step[], now: number) => {
      const [first, ...rest] = steps;
      b.queue = rest;
      b.until = now + first.ms;
      if (first.pose !== b.pose) {
        b.pose = first.pose;
        setPose(first.pose);
        setHop(first.pose === "pounce" ? "cat-hop" : first.pose === "startle" ? "cat-hop-small" : "");
        if (first.pose === "startle") float("!");
      }
    };

    const onMove = (e: MouseEvent) => {
      b.mouseX = e.clientX;
      b.mouseY = e.clientY;
      b.mouseAt = b.lastActivity = performance.now();
    };
    const onScroll = () => {
      const now = performance.now();
      const v = Math.abs(window.scrollY - b.scrollY) / Math.max((now - b.scrollAt) / 1000, 0.016);
      b.scrollY = window.scrollY;
      b.scrollAt = now;
      b.lastActivity = now;
      if (v > SCROLL_STARTLE && now > b.startleReadyAt && b.pose !== "pounce") {
        b.startleReadyAt = now + 8000;
        go([{ pose: "startle", ms: 700 }, { pose: "trot", ms: 900 }], now);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const vw = window.innerWidth;
      const catCX = b.x + CAT_W / 2;
      const groundY = window.innerHeight - 36;
      const mouseLive = now - b.mouseAt < MOUSE_FRESH_MS;
      const dx = b.mouseX - catCX;
      const dist = mouseLive ? Math.hypot(dx, b.mouseY - groundY) : Infinity;
      const busy = b.pose === "crouch" || b.pose === "pounce" || b.pose === "startle" || b.pose === "purr";

      // Cursor first, unless the cat is mid-action.
      if (!busy && dist < CURIOUS_DIST) {
        const face: 1 | -1 = dx > 0 ? 1 : -1;
        if (b.pose === "sleep") {
          go([{ pose: "yawn", ms: 1200 }, { pose: "stretch", ms: 1400 }], now);
        } else if (b.pose === "yawn" || b.pose === "stretch") {
          // let it finish waking up
        } else if (dist < CATCH_DIST && now > b.pounceReadyAt) {
          b.dir = face;
          b.pounceTo = Math.min(Math.max(b.mouseX - CAT_W / 2, 0), vw - CAT_W);
          b.pounceReadyAt = now + 6000;
          go([{ pose: "crouch", ms: 750 }, { pose: "pounce", ms: 550 }, { pose: "sit", ms: rand(1800, 3000) }], now);
        } else if (dist < CHASE_DIST && dist >= CATCH_DIST) {
          b.dir = face;
          if (b.pose !== "trot") go([{ pose: "trot", ms: 600 }], now);
          else b.until = now + 600;
        } else if (dist >= CHASE_DIST) {
          b.dir = face;
          if (b.pose !== "curious") go([{ pose: "curious", ms: 900 }], now);
          else b.until = now + 900;
        }
      } else if (now >= b.until) {
        go(b.queue.length ? b.queue : idlePlan(b.pose, now - b.lastActivity > SLEEPY_AFTER_MS), now);
        if (b.pose === "walk" && Math.random() < 0.35) b.dir = b.dir === 1 ? -1 : 1;
      }

      // Move.
      const speed = b.pose === "walk" ? WALK_SPEED : b.pose === "trot" ? TROT_SPEED : 0;
      if (speed) {
        b.x += b.dir * speed * dt;
        if (b.x < 0) { b.x = 0; b.dir = 1; }
        if (b.x > vw - CAT_W) { b.x = vw - CAT_W; b.dir = -1; }
      } else if (b.pose === "pounce") {
        const left = Math.max(b.until - now, 16);
        b.x += ((b.pounceTo - b.x) * (dt * 1000)) / left;
      }

      // Sleep sends up a Z every couple of seconds.
      if (b.pose === "sleep" && now - zTimer > 2200) { zTimer = now; float("z"); }

      if (rootRef.current) rootRef.current.style.transform = `translateX(${b.x}px)`;
      if (flipRef.current) flipRef.current.style.transform = b.dir === -1 ? "scaleX(-1)" : "";
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [still]);

  const pet = () => {
    if (still) return;
    const b = brain.current;
    const now = performance.now();
    b.lastActivity = now;
    b.queue = [{ pose: "sit", ms: 1500 }];
    b.until = now + 2600;
    if (b.pose !== "purr") { b.pose = "purr"; setPose("purr"); setHop(""); }
    for (let i = 0; i < 3; i++) {
      window.setTimeout(() => {
        const id = performance.now() + Math.random();
        setFloats((f) => [...f, { id, kind: "heart", drift: Math.round(rand(-16, 16)) }]);
        window.setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 1700);
      }, i * 220);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-28 overflow-hidden" aria-hidden="true">
      <div
        ref={rootRef}
        className="absolute bottom-0 left-0"
        style={still ? { left: "auto", right: 88 } : undefined}
      >
        {floats.map((f) => (
          <span
            key={f.id}
            className="cat-float-up absolute left-1/2 top-1 select-none font-mono text-lg font-bold"
            style={{
              ["--drift" as string]: `${f.drift}px`,
              color: f.kind === "heart" ? "var(--accent-3)" : "var(--text-2)",
            }}
          >
            {f.kind === "heart" ? "♥" : f.kind === "z" ? "z" : "!"}
          </span>
        ))}
        <div
          className="pointer-events-auto cursor-pointer"
          onClick={pet}
          onMouseEnter={() => { if (!still && brain.current.pose === "sit") pet(); }}
        >
          <div ref={flipRef}>
            <div key={hop + pose} className={hop}>
              <CatFigure pose={still ? "sleep" : pose} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
