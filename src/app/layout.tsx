import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingScreen from "@/components/animations/LoadingScreen";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <LoadingProvider>
          <LoadingScreen />
          <ClientShell>{children}</ClientShell>
        </LoadingProvider>
      </body>
    </html>
  );
}
