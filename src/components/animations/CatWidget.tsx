"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

type CatState = "walk" | "sit" | "curious" | "play";

/* ── SVG Cat ──────────────────────────────────────── */
function CatSVG({ state }: { state: CatState }) {
  const walking = state === "walk";
  const sitting = state === "sit";
  const curious = state === "curious";
  const playing = state === "play";

  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Tail ── */}
      {sitting ? (
        /* Sitting: tail curls around front */
        <path
          d="M 22 58 Q 8 56 10 46 Q 12 38 24 42"
          stroke="#9ca3af"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          className="cat-tail-lazy"
          style={{ transformOrigin: "22px 58px", transformBox: "fill-box" }}
        />
      ) : curious ? (
        /* Curious: tail straight up */
        <path
          d="M 20 54 Q 10 40 14 24 Q 16 16 22 20"
          stroke="#9ca3af"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          className="cat-tail-excited"
          style={{ transformOrigin: "20px 54px", transformBox: "fill-box" }}
        />
      ) : (
        /* Walk / Play: tail raised behind */
        <path
          d="M 20 52 Q 4 46 8 34 Q 12 24 22 30"
          stroke="#9ca3af"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          className={playing ? "cat-tail-excited" : "cat-tail-lazy"}
          style={{ transformOrigin: "20px 52px", transformBox: "fill-box" }}
        />
      )}

      {/* ── Body ── */}
      <ellipse
        cx="38"
        cy={sitting ? 52 : 50}
        rx={sitting ? 20 : 17}
        ry={sitting ? 14 : 12}
        fill="#9ca3af"
      />

      {/* ── Legs ── */}
      {walking && (
        <>
          <rect
            x="26" y="58" width="6" height="10" rx="3"
            fill="#8d96a2"
            className="cat-leg-a"
            style={{ transformOrigin: "29px 58px", transformBox: "fill-box" }}
          />
          <rect
            x="35" y="58" width="6" height="10" rx="3"
            fill="#8d96a2"
            className="cat-leg-b"
            style={{ transformOrigin: "38px 58px", transformBox: "fill-box" }}
          />
          <rect
            x="44" y="58" width="6" height="10" rx="3"
            fill="#8d96a2"
            className="cat-leg-a"
            style={{ transformOrigin: "47px 58px", transformBox: "fill-box" }}
          />
        </>
      )}

      {/* ── Play: raised paw ── */}
      {playing && (
        <ellipse
          cx="56" cy="44" rx="6" ry="5"
          fill="#9ca3af"
          className="cat-paw-wave"
          style={{ transformOrigin: "56px 50px", transformBox: "fill-box" }}
        />
      )}

      {/* ── Head ── */}
      <circle
        cx="38"
        cy={curious ? 25 : 28}
        r="17"
        fill="#b0b8c4"
      />

      {/* ── Ears ── */}
      <polygon points="18,20 12,2 28,14" fill="#b0b8c4" />
      <polygon points="58,20 64,2 48,14" fill="#b0b8c4" />
      {/* Inner ears */}
      <polygon points="19,18 15,7 26,15" fill="#fda4af" />
      <polygon points="57,18 61,7 50,15" fill="#fda4af" />

      {/* ── Eyes ── */}
      {sitting ? (
        /* Closed/blinking eyes */
        <>
          <path d="M 30 27 Q 32 24 34 27" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 42 27 Q 44 24 46 27" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="31" cy={curious ? 24 : 27} rx="3.5" ry="4" fill="#1f2937" />
          <ellipse cx="45" cy={curious ? 24 : 27} rx="3.5" ry="4" fill="#1f2937" />
          {/* Shine dots */}
          <circle cx="32.5" cy={curious ? 22.5 : 25.5} r="1.2" fill="white" />
          <circle cx="46.5" cy={curious ? 22.5 : 25.5} r="1.2" fill="white" />
        </>
      )}

      {/* ── Nose ── */}
      <polygon
        points={`38,${curious ? 30 : 33} 36,${curious ? 32 : 35} 40,${curious ? 32 : 35}`}
        fill="#fda4af"
      />

      {/* ── Whiskers ── */}
      <line
        x1="38" y1={curious ? 32 : 35}
        x2="38" y2={curious ? 34 : 38}
        stroke="#6b7280" strokeWidth="1"
      />
      <line x1="22" y1={curious ? 30 : 33} x2="34" y2={curious ? 31 : 34} stroke="#6b7280" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="22" y1={curious ? 33 : 36} x2="34" y2={curious ? 33 : 36} stroke="#6b7280" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="42" y1={curious ? 31 : 34} x2="54" y2={curious ? 30 : 33} stroke="#6b7280" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="42" y1={curious ? 33 : 36} x2="54" y2={curious ? 33 : 36} stroke="#6b7280" strokeWidth="0.8" strokeOpacity="0.5" />
    </svg>
  );
}

/* ── Main Widget ──────────────────────────────────── */
const CAT_W = 72;
const WALK_SPEED = 55;
const CHASE_SPEED = 110;
const CURIOUS_DIST = 240;
const CHASE_DIST = 120;
const CATCH_DIST = 42;

export default function CatWidget() {
  const posRef    = useRef({ x: 160, dir: 1 as 1 | -1 });
  const mouseRef  = useRef({ x: -999, y: -999 });
  const stateRef  = useRef<CatState>("walk");
  const frameRef  = useRef(0);
  const lastRef   = useRef(0);
  const sitTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [catState,   setCatState]   = useState<CatState>("walk");
  const [facingLeft, setFacingLeft] = useState(false);
  const [catX,       setCatX]       = useState(160);
  const [hearts,     setHearts]     = useState<number[]>([]);

  /* Track mouse */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  /* rAF loop */
  useEffect(() => {
    const BOTTOM_Y = window.innerHeight - 40;

    const tick = (now: number) => {
      const dt  = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;

      const vw = window.innerWidth;
      const { x: mx, y: my } = mouseRef.current;
      const { x: cx, dir }   = posRef.current;
      const catCX = cx + CAT_W / 2;
      const dx    = mx - catCX;
      const dy    = my - BOTTOM_Y;
      const dist  = Math.hypot(dx, dy);

      let next: CatState = stateRef.current;
      let speed = WALK_SPEED;
      let moveDir = dir;

      if (dist < CATCH_DIST) {
        next  = "play";
        speed = 0;
      } else if (dist < CHASE_DIST) {
        next    = "walk";
        speed   = CHASE_SPEED;
        moveDir = dx > 0 ? 1 : -1;
      } else if (dist < CURIOUS_DIST) {
        next    = "curious";
        speed   = 0;
        moveDir = dx > 0 ? 1 : -1;
      } else {
        if (stateRef.current === "sit") {
          next  = "sit";
          speed = 0;
        } else {
          next  = "walk";
          speed = WALK_SPEED;
        }
      }

      /* Move */
      if (speed > 0) {
        let nx = cx + moveDir * speed * dt;
        if (nx < 0)          { nx = 0;          moveDir =  1; }
        if (nx > vw - CAT_W) { nx = vw - CAT_W; moveDir = -1; }
        posRef.current.x   = nx;
        posRef.current.dir = moveDir;
      } else {
        posRef.current.dir = moveDir;
      }

      /* State transition side-effects */
      if (next !== stateRef.current) {
        stateRef.current = next;
        setCatState(next);

        if (next === "walk") {
          /* Schedule random sit */
          if (sitTimer.current) clearTimeout(sitTimer.current);
          sitTimer.current = setTimeout(() => {
            if (stateRef.current === "walk") {
              stateRef.current = "sit";
              setCatState("sit");
              setTimeout(() => {
                if (stateRef.current === "sit") {
                  stateRef.current = "walk";
                  setCatState("walk");
                }
              }, 1800 + Math.random() * 2200);
            }
          }, 4500 + Math.random() * 5000);
        }
      }

      setFacingLeft(posRef.current.dir === -1);
      setCatX(posRef.current.x);

      frameRef.current = requestAnimationFrame(tick);
    };

    lastRef.current = performance.now();
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (sitTimer.current) clearTimeout(sitTimer.current);
    };
  }, []);

  /* Spawn heart on hover */
  const spawnHeart = useCallback(() => {
    const id = Date.now() + Math.random();
    setHearts(h => [...h, id]);
    setTimeout(() => setHearts(h => h.filter(x => x !== id)), 1100);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute bottom-0 pointer-events-auto"
        style={{
          left: catX,
          transform: facingLeft ? "scaleX(-1)" : "scaleX(1)",
          transition: "transform 0.12s ease",
        }}
        onMouseEnter={spawnHeart}
      >
        {/* Floating hearts */}
        <AnimatePresence>
          {hearts.map(id => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.7 }}
              animate={{ opacity: 0, y: -44, x: (Math.random() - 0.5) * 24, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, ease: "easeOut" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-pink-400 text-xl
                select-none pointer-events-none"
            >
              ♥
            </motion.span>
          ))}
        </AnimatePresence>

        <CatSVG state={catState} />
      </div>
    </div>
  );
}
