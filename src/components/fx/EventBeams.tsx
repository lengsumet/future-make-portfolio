"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * The platform's event bus drawn as Aceternity-style animated beams: the
 * systems around a hub, each line carrying a travelling pulse of light into
 * the dashboard. Decorative; the card it sits in says what it means.
 */
const NODES = [
  { id: "WMS", x: 40, y: 40 },
  { id: "POS", x: 40, y: 120 },
  { id: "CRM", x: 40, y: 200 },
  { id: "TMS", x: 120, y: 240 },
  { id: "IMS", x: 360, y: 40 },
  { id: "SCMS", x: 360, y: 120 },
  { id: "PMS", x: 360, y: 200 },
  { id: "SHOP", x: 280, y: 240 },
];
const HUB = { x: 200, y: 130 };

export default function EventBeams() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 400 280" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E0A878" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFF8F0" />
          <stop offset="1" stopColor="#E0A878" stopOpacity="0" />
        </linearGradient>
      </defs>
      {NODES.map((n, i) => {
        const d = `M${n.x},${n.y} Q${(n.x + HUB.x) / 2},${n.y < HUB.y ? HUB.y - 50 : HUB.y + 50} ${HUB.x},${HUB.y}`;
        return (
          <g key={n.id}>
            <path d={d} fill="none" stroke="rgba(255,248,240,0.10)" strokeWidth="1.2" />
            {!reduce && (
              <motion.path
                d={d}
                fill="none"
                stroke="url(#beam)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0.18, pathOffset: 0 }}
                animate={{ pathOffset: [0, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
              />
            )}
            <rect x={n.x - 22} y={n.y - 11} width="44" height="22" rx="7" fill="#15100E" stroke="rgba(255,248,240,0.16)" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fill="rgba(255,248,240,0.75)" fontFamily="var(--mono-stack)">
              {n.id}
            </text>
          </g>
        );
      })}
      <circle cx={HUB.x} cy={HUB.y} r="34" fill="rgba(192,133,82,0.12)" />
      <rect x={HUB.x - 30} y={HUB.y - 16} width="60" height="32" rx="9" fill="#1D1613" stroke="#C08552" />
      <text x={HUB.x} y={HUB.y + 4} textAnchor="middle" fontSize="9.5" fill="#F2C9A0" fontFamily="var(--mono-stack)">
        DASH
      </text>
    </svg>
  );
}
