/**
 * The cat itself: a caramel tabby in three-quarter profile, facing right.
 * Pure drawing — which pose to show is decided by CatWidget. Colours come
 * from the site's accent tokens so the cat sits in the same palette.
 *
 * Moving parts animate with the `cat-*` keyframes in globals.css. Each one is
 * an inner <g> so its CSS transform does not replace the SVG transform that
 * places it.
 */

export type Pose =
  | "walk" | "trot" | "curious" | "crouch" | "pounce" | "startle"
  | "sit" | "groom" | "yawn" | "purr"
  | "sleep" | "stretch";

const FUR = "var(--accent)";
const FUR_DARK = "var(--accent-2)";
const CREAM = "var(--accent-fg)";
const INK = "#1A120D";
const NOSE = "#E39A8F";
const SHINE = "#FFF8F0";

const box = (origin: string) => ({ transformBox: "fill-box" as const, transformOrigin: origin });

type Eyes = "open" | "closed" | "happy";
type Mouth = "none" | "yawn" | "tongue";

/* Head in local coordinates: centre at 0,0, facing right. */
function Head({ eyes = "open", mouth = "none", earsBack = false }: { eyes?: Eyes; mouth?: Mouth; earsBack?: boolean }) {
  const ear = earsBack ? "rotate(-28)" : undefined;
  return (
    <g>
      <g transform={ear}>
        <polygon points="-11,-5 -10,-19 -1,-10" fill={FUR} />
        <polygon points="-9,-8 -8.5,-15.5 -3.5,-10" fill={CREAM} opacity="0.7" />
      </g>
      <g transform={ear}>
        <g className={earsBack ? undefined : "cat-ear-flick"} style={box("50% 100%")}>
          <polygon points="0,-11 6,-22 10,-7" fill={FUR} />
          <polygon points="2.5,-11 6,-18 8.5,-8.5" fill={CREAM} />
        </g>
      </g>
      <circle r="12" fill={FUR} />
      <path d="M-4 -11.5 q1.2 3.5 0 6 M0 -12 q1.2 3.5 0 6.5 M4 -11 q1 3 0 5" stroke={FUR_DARK} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="7.5" cy="4.5" rx="6.5" ry="5" fill={CREAM} />
      <path d="M12.4 1.6 h3 l-1.5 2 z" fill={NOSE} />

      {eyes === "open" && (
        <g className="cat-blink" style={box("center")}>
          <ellipse cx="-3.5" cy="-2.5" rx="2" ry="2.6" fill={INK} />
          <ellipse cx="4.5" cy="-2" rx="2.4" ry="3" fill={INK} />
          <circle cx="5.3" cy="-3.1" r="0.85" fill={SHINE} />
          <circle cx="-2.9" cy="-3.4" r="0.6" fill={SHINE} />
        </g>
      )}
      {eyes === "closed" && (
        <path d="M-5.5 -2 q2 1.8 4 0 M2.3 -1.5 q2.2 2 4.4 0" stroke={INK} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      )}
      {eyes === "happy" && (
        <path d="M-5.5 -1.5 q2 -2.4 4 0 M2.3 -1 q2.2 -2.8 4.4 0" stroke={INK} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      )}

      {mouth === "none" && <path d="M10.5 6.2 q1.4 1.3 2.8 0" stroke={INK} strokeWidth="0.9" strokeLinecap="round" fill="none" />}
      {mouth === "yawn" && (
        <>
          <ellipse cx="11" cy="7.5" rx="2.6" ry="3.4" fill="#3A1F17" />
          <ellipse cx="11" cy="9.6" rx="1.7" ry="1.1" fill={NOSE} />
        </>
      )}
      {mouth === "tongue" && <ellipse cx="13.6" cy="7.6" rx="1.6" ry="1.1" fill={NOSE} />}

      <path d="M12 4.6 L22 2.6 M12 6 L22 7.4" stroke={CREAM} strokeWidth="0.6" strokeOpacity="0.6" strokeLinecap="round" />
    </g>
  );
}

/* A leg hangs down from (x, y); `angle` swings it about the hip. */
function Leg({ x, y, h, far = false, angle = 0, cls }: { x: number; y: number; h: number; far?: boolean; angle?: number; cls?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <g className={cls} style={box("50% 0%")}>
        <rect x="-3" y="0" width="6" height={h} rx="3" fill={far ? FUR_DARK : FUR} />
        <ellipse cx="0.8" cy={h - 0.5} rx="3.8" ry="2.3" fill={far ? FUR_DARK : CREAM} />
      </g>
    </g>
  );
}

function Tail({ d, cls, width = 5, origin }: { d: string; cls?: string; width?: number; origin: string }) {
  return (
    <g className={cls} style={{ transformOrigin: origin }}>
      <path d={d} stroke={FUR} strokeWidth={width} strokeLinecap="round" fill="none" />
      <path d={d} stroke={FUR_DARK} strokeWidth={width} strokeLinecap="round" fill="none" strokeDasharray="3 5" opacity="0.7" />
    </g>
  );
}

const Stripes = ({ d }: { d: string }) => (
  <path d={d} stroke={FUR_DARK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
);

type StandingPose = "walk" | "trot" | "curious" | "crouch" | "pounce" | "startle";
type Stance = { y: number; ry: number; leg: number; head: [number, number, number]; tail: string; tailCls?: string };

const STANCE: Record<StandingPose, Stance> = {
  walk:    { y: 42, ry: 12, leg: 20, head: [71, 27, 0],   tail: "M24 40 C 12 38 8 26 14 16", tailCls: "cat-tail-lazy" },
  trot:    { y: 42, ry: 12, leg: 20, head: [72, 28, 6],   tail: "M24 40 C 12 40 6 32 6 24",  tailCls: "cat-tail-quick" },
  curious: { y: 42, ry: 12, leg: 20, head: [72, 24, -14], tail: "M24 39 C 16 30 16 16 24 12", tailCls: "cat-tail-twitch" },
  crouch:  { y: 53, ry: 10, leg: 10, head: [71, 45, 4],   tail: "M24 53 C 14 55 8 57 2 55",  tailCls: "cat-tail-twitch" },
  pounce:  { y: 38, ry: 11, leg: 20, head: [73, 27, -6],  tail: "M24 38 C 14 36 6 34 0 30" },
  startle: { y: 37, ry: 14, leg: 22, head: [70, 29, 4],   tail: "M24 34 C 22 24 22 14 24 5" },
};

/* Standing family: walk, trot, curious, crouch, pounce, startle. */
function Standing({ pose }: { pose: StandingPose }) {
  const s = STANCE[pose];

  const legCls = pose === "walk" ? ["cat-leg-a", "cat-leg-b"] : pose === "trot" ? ["cat-leg-a cat-fast", "cat-leg-b cat-fast"] : [undefined, undefined];
  const [backA, frontA] = pose === "pounce" ? [40, -55] : [0, 0];
  const top = s.y + 4;
  const [hx, hy, hr] = s.head;

  return (
    <g className={pose === "crouch" ? "cat-wiggle" : pose === "walk" || pose === "trot" ? "cat-bob" : undefined}>
      <Tail d={s.tail} cls={s.tailCls} width={pose === "startle" ? 8 : 5} origin="24px 40px" />
      <Leg x={30} y={top} h={s.leg} far angle={backA} cls={legCls[1]} />
      <Leg x={60} y={top} h={s.leg} far angle={frontA} cls={legCls[0]} />
      <ellipse cx="44" cy={s.y} rx="23" ry={s.ry} fill={FUR} />
      <ellipse cx="47" cy={s.y + s.ry * 0.5} rx="15" ry={s.ry * 0.35} fill={CREAM} opacity="0.55" />
      <Stripes d={`M35 ${s.y - s.ry + 1} q2 5 0 9 M43 ${s.y - s.ry} q2 5 0 9 M51 ${s.y - s.ry + 1} q2 5 0 8`} />
      <Leg x={35} y={top} h={s.leg} angle={backA} cls={legCls[0]} />
      <Leg x={64} y={top} h={s.leg} angle={frontA} cls={legCls[1]} />
      <g transform={`translate(${hx} ${hy}) rotate(${hr})`}>
        <Head earsBack={pose === "startle" || pose === "crouch"} />
      </g>
    </g>
  );
}

type SittingPose = "sit" | "groom" | "yawn" | "purr";
const SIT_HEAD: Record<SittingPose, [number, number, number]> = {
  sit: [57, 24, 0], groom: [58, 28, 20], yawn: [56, 22, -20], purr: [57, 24, -6],
};

/* Sitting family: sit, groom, yawn, purr. */
function Sitting({ pose }: { pose: SittingPose }) {
  const head = SIT_HEAD[pose];
  const eyes: Eyes = pose === "sit" ? "open" : pose === "purr" ? "happy" : "closed";
  const mouth: Mouth = pose === "yawn" ? "yawn" : pose === "groom" ? "tongue" : "none";
  return (
    <g className={pose === "purr" ? "cat-purr" : undefined}>
      <Tail d="M28 66 C 16 70 8 64 12 56" cls="cat-tail-lazy" origin="28px 66px" />
      <ellipse cx="38" cy="56" rx="15" ry="11" fill={FUR} />
      <Stripes d="M31 47 q3 4 1 8 M38 46 q3 4 1 9" />
      <ellipse cx="30" cy="67" rx="7" ry="3" fill={CREAM} />
      <Leg x={51} y={50} h={16} far />
      <ellipse cx="48" cy="47" rx="13" ry="18" fill={FUR} />
      <ellipse cx="55" cy="49" rx="5" ry="10" fill={CREAM} />
      {pose !== "groom" && <Leg x={57} y={51} h={16} />}
      <g transform={`translate(${head[0]} ${head[1]}) rotate(${head[2]})`}>
        <g className={pose === "groom" ? "cat-lick" : undefined} style={box("50% 100%")}>
          <Head eyes={eyes} mouth={mouth} />
        </g>
      </g>
      {/* The raised paw goes over the face, so it is drawn after the head. */}
      {pose === "groom" && <Leg x={58} y={50} h={17} angle={-150} cls="cat-lick" />}
    </g>
  );
}

function Sleeping() {
  return (
    <g>
      <g className="cat-breathe" style={box("50% 100%")}>
        <ellipse cx="44" cy="58" rx="27" ry="12" fill={FUR} />
        <Stripes d="M32 47 q2 4 0 8 M40 46 q2 4 0 9 M48 46 q2 4 0 9" />
      </g>
      <path d="M18 60 C 18 69 58 70 76 64" stroke={FUR} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M18 60 C 18 69 58 70 76 64" stroke={FUR_DARK} strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="3 5" opacity="0.7" />
      <g transform="translate(70 55) rotate(14)">
        <Head eyes="closed" />
      </g>
    </g>
  );
}

function Stretching() {
  return (
    <g>
      <Tail d="M22 40 C 16 30 18 18 26 12" cls="cat-tail-lazy" origin="22px 40px" />
      <Leg x={27} y={44} h={23} far />
      <Leg x={60} y={63} h={20} far angle={-82} />
      <ellipse cx="44" cy="50" rx="24" ry="10" fill={FUR} transform="rotate(18 44 50)" />
      <Stripes d="M34 39 q2 5 0 9 M42 42 q2 5 0 9" />
      <Leg x={32} y={45} h={22} />
      <g transform="translate(68 50) rotate(-6)">
        <Head eyes="closed" />
      </g>
      {/* Front legs reach forward under the chin, so the near one is drawn over the head. */}
      <Leg x={62} y={65} h={20} angle={-86} />
    </g>
  );
}

export default function CatFigure({ pose }: { pose: Pose }) {
  let body;
  switch (pose) {
    case "sleep": body = <Sleeping />; break;
    case "stretch": body = <Stretching />; break;
    case "sit": case "groom": case "yawn": case "purr": body = <Sitting pose={pose} />; break;
    default: body = <Standing pose={pose} />;
  }
  return (
    <svg width="96" height="72" viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {body}
    </svg>
  );
}
