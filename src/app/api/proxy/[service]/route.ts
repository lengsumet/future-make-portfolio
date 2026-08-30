import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type ServiceConfig = {
  baseUrl: string;
  authHeader: string;
  authValue: () => string;
  allowedMethods: string[];
};

const PROXY_SERVICES: Record<string, ServiceConfig> = {
  email: {
    baseUrl: process.env.PROXY_EMAIL_URL || "https://api.resend.com",
    authHeader: "Authorization",
    authValue: () => `Bearer ${process.env.RESEND_API_KEY || ""}`,
    allowedMethods: ["POST"],
  },
  notify: {
    baseUrl: process.env.PROXY_NOTIFY_URL || "https://notify-api.line.me",
    authHeader: "Authorization",
    authValue: () => `Bearer ${process.env.LINE_NOTIFY_TOKEN || ""}`,
    allowedMethods: ["POST"],
  },
  payment: {
    baseUrl: process.env.PROXY_PAYMENT_URL || "https://api.omise.co",
    authHeader: "Authorization",
    authValue: () =>
      `Basic ${Buffer.from(`${process.env.OMISE_SECRET_KEY || ""}:`).toString("base64")}`,
    allowedMethods: ["GET", "POST"],
  },
  storage: {
    baseUrl: `https://${process.env.AWS_S3_BUCKET || "bucket"}.s3.${process.env.AWS_REGION || "ap-southeast-1"}.amazonaws.com`,
    authHeader: "X-Proxy-Auth",
    authValue: () => process.env.AWS_PROXY_TOKEN || "",
    allowedMethods: ["GET", "PUT"],
  },
};

type Params = { service: string };

/**
 * Resolve the caller-supplied `path` against the service base URL.
 * Returns null if the result would leave the service's origin — without this,
 * a path like "@evil.com/x" or "//evil.com/x" would send the service's API key
 * to an attacker-controlled host.
 */
function resolveTargetUrl(baseUrl: string, path: string): URL | null {
  if (path && !path.startsWith("/")) return null;
  if (path.startsWith("//")) return null;

  try {
    const base = new URL(baseUrl);
    const target = new URL(path || "/", base);
    return target.origin === base.origin ? target : null;
  } catch {
    return null;
  }
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  // Every service below forwards a server-held secret. Admin only.
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { service } = await params;
  const config = PROXY_SERVICES[service];

  if (!config) {
    return NextResponse.json(
      { error: `Unknown proxy service: ${service}` },
      { status: 404 }
    );
  }

  if (!config.allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { error: `Method ${request.method} not allowed for ${service}` },
      { status: 405 }
    );
  }

  const targetPath = request.nextUrl.searchParams.get("path") || "";
  const targetUrl = resolveTargetUrl(config.baseUrl, targetPath);

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Invalid path: must be an absolute path within the service origin" },
      { status: 400 }
    );
  }

  try {
    const forwardHeaders: Record<string, string> = {
      [config.authHeader]: config.authValue(),
    };

    const contentType = request.headers.get("Content-Type");
    if (contentType) forwardHeaders["Content-Type"] = contentType;

    const body =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardHeaders,
      body,
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error(`[Proxy] Error forwarding to ${service}:`, error);
    return NextResponse.json(
      { error: "Proxy request failed", service },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
