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
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:pl-16">
        <PageWrapper>{children}</PageWrapper>
        <Footer />
      </main>
    </div>
  );
}
