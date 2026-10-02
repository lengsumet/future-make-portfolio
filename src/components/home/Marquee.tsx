/**
 * A slow, continuous strip of the stack. Content is rendered twice and the
 * track moves by half its width, so the loop has no seam; it pauses on
 * hover and stands still for visitors who ask for reduced motion.
 */
export default function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="flex items-center">
          <span className="display px-6 md:px-8 text-[clamp(1.75rem,4vw,3.25rem)] italic" style={{ color: "var(--text-2)" }}>
            {item}
          </span>
          <span className="text-lg" style={{ color: "var(--accent)" }} aria-hidden="true">
            ✳
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Technologies I work with"
      className="marquee overflow-hidden border-y py-6 md:py-8"
      style={{ borderColor: "var(--border-mid)" }}
    >
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
