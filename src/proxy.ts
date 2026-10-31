import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth/admin";

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

    // Expired, forged, or issued before the admin password last changed.
    if (!(await verifyAdminToken(token))) {
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
