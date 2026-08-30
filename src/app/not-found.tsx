import Link from "next/link";
import { FaHome, FaSearch } from "react-icons/fa";

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center"
      style={{ background: "var(--background)", color: "var(--text-1)" }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
        }}
        aria-hidden="true"
      >
        <FaSearch size={20} style={{ color: "var(--accent-3)" }} />
      </div>

      <div className="space-y-2">
        <p
          className="text-4xl font-bold tracking-tight"
          style={{ color: "var(--text-1)" }}
        >
          404
        </p>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-1)" }}>
          ไม่พบหน้าที่ค้นหา
        </h1>
        <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
          Page not found
        </p>
        <p
          className="mx-auto max-w-md text-sm leading-relaxed"
          style={{ color: "var(--text-3)" }}
        >
          หน้าที่คุณเรียกดูอาจถูกย้าย ถูกลบ หรือที่อยู่ที่พิมพ์อาจไม่ถูกต้อง
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity duration-200 hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, var(--grad-2), var(--grad-3))",
          color: "#fff",
          boxShadow: "0 0 24px var(--accent-glow)",
        }}
      >
        <FaHome size={14} aria-hidden="true" />
        กลับหน้าแรก / Back to home
      </Link>
    </main>
  );
}
