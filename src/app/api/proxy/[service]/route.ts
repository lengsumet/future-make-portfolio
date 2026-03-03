import { NextRequest, NextResponse } from "next/server";

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

async function handler(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
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
  const targetUrl = `${config.baseUrl}${targetPath}`;

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
