import type { Metadata } from "next";
import { Prompt, Inter, Playfair_Display, Noto_Sans_Thai, Instrument_Serif, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingScreen from "@/components/animations/LoadingScreen";
import MotionProvider from "@/components/providers/MotionProvider";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Editorial display face and a mono for labels: the pairing most of the
// sites on godly.design use — a quiet serif at large sizes, a monospace for
// indices, captions and metadata.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// Headline sans, as on React Bits.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  weight: ["400", "600"],
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
    <html lang="en">
      <body className={`${prompt.variable} ${inter.variable} ${playfair.variable} ${notoSansThai.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${geist.variable} ${prompt.className}`}>
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
