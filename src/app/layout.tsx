import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingScreen from "@/components/animations/LoadingScreen";
import MotionProvider from "@/components/providers/MotionProvider";
import { THEME_INIT_SCRIPT } from "@/lib/site-theme-init";

// Self-hosted (src/app/fonts, OFL): a build never downloads fonts, so a
// Google Fonts hiccup can no longer fail the deploy. Same families, subsets,
// weights and styles as before; the files are the ones next/font/google
// fetched. Prompt ships static weights, the others one variable file each.
const prompt = localFont({
  variable: "--font-prompt",
  src: [
    { path: "./fonts/Prompt-thai-100.woff2", weight: "100", style: "normal" },
    { path: "./fonts/Prompt-latin-100.woff2", weight: "100", style: "normal" },
    { path: "./fonts/Prompt-thai-200.woff2", weight: "200", style: "normal" },
    { path: "./fonts/Prompt-latin-200.woff2", weight: "200", style: "normal" },
    { path: "./fonts/Prompt-thai-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Prompt-latin-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/Prompt-thai-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Prompt-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Prompt-thai-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Prompt-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Prompt-thai-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Prompt-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Prompt-thai-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Prompt-latin-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Prompt-thai-800.woff2", weight: "800", style: "normal" },
    { path: "./fonts/Prompt-latin-800.woff2", weight: "800", style: "normal" },
    { path: "./fonts/Prompt-thai-900.woff2", weight: "900", style: "normal" },
    { path: "./fonts/Prompt-latin-900.woff2", weight: "900", style: "normal" },
  ],
  display: "swap",
});

// Referenced by --display-stack in globals.css (fallback behind Geist).
const inter = localFont({
  variable: "--font-inter",
  src: [{ path: "./fonts/Inter-latin-var.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
});

// Editorial display face and a mono for labels: the pairing most of the
// sites on godly.design use — a quiet serif at large sizes, a monospace for
// indices, captions and metadata.
const instrumentSerif = localFont({
  variable: "--font-instrument",
  src: [
    { path: "./fonts/InstrumentSerif-latin-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-latin-italic.woff2", weight: "400", style: "italic" },
  ],
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

// Headline sans, as on React Bits.
const geist = localFont({
  variable: "--font-geist",
  src: [{ path: "./fonts/Geist-latin-var.woff2", weight: "400 700", style: "normal" }],
  display: "swap",
});

const jetbrainsMono = localFont({
  variable: "--font-jetbrains",
  src: [{ path: "./fonts/JetBrainsMono-latin-var.woff2", weight: "400 500", style: "normal" }],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sumet Buarod | Software Engineer",
  description: "Software Engineer specializing in high-performance distributed systems and cloud-native architecture. Expert in C#, .NET Core, Python, Golang, and React/Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the init script may set data-theme before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${prompt.variable} ${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${geist.variable} ${prompt.className}`}>
        {/* Without JavaScript the loading screen never leaves and entrance
            animations never run: show the page as the server sent it. */}
        <noscript>
          <style>{'[data-loading-screen]{display:none!important}[style*="opacity:0"]{opacity:1!important;transform:none!important;filter:none!important}'}</style>
        </noscript>
        <MotionProvider>
          <LoadingProvider>
            <LoadingScreen />
            <ClientShell>{children}</ClientShell>
          </LoadingProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
