"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import PageWrapper from "./PageWrapper";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col">
      <Sidebar />
      <main className="flex-1 md:pt-20">
        <PageWrapper>{children}</PageWrapper>
        <Footer />
      </main>
    </div>
  );
}
