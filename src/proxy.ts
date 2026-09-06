import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { requireSecret } from "@/lib/env";

// Resolved per request rather than at import so a missing secret fails the
// guarded request with a clear error instead of crashing module evaluation.
const getSecret = () => new TextEncoder().encode(requireSecret("ADMIN_JWT_SECRET"));

/**
 * Admin route guard.
 *
 * Renamed from `middleware.ts`: Next.js 16 deprecated that file convention in
 * favour of `proxy`, and the exported function has to match the filename.
 * `config.matcher` still applies; route segment config such as `runtime` does
 * not, because proxy always runs on the Node.js runtime.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, getSecret());
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
