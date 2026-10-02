import { NextRequest } from "next/server";
import { LIMITS } from "@/lib/chat/core";

/**
 * Emails a visitor the link that reopens their chat on any device.
 *
 * Needs RESEND_API_KEY and CHAT_NOTIFY_FROM on a domain verified in Resend:
 * Resend's shared onboarding sender only delivers to the account owner, so
 * without a verified sender the feature reports itself unavailable instead of
 * pretending to send.
 */
export function visitorMailAvailable(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.CHAT_NOTIFY_FROM);
}

export function siteBase(request: NextRequest): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

const COPY = {
  en: {
    subject: "Continue your chat with Sumet",
    text: (url: string) =>
      `Open this link to continue your chat with Sumet on this device:\n\n${url}\n\nIt works once and expires in ${LIMITS.linkTtlMinutes} minutes. If you didn't ask for it, ignore this email.`,
  },
  th: {
    subject: "ลิงก์สำหรับคุยต่อกับสุเมธ",
    text: (url: string) =>
      `เปิดลิงก์นี้เพื่อคุยต่อกับสุเมธบนเครื่องนี้:\n\n${url}\n\nใช้ได้ครั้งเดียว และหมดอายุใน ${LIMITS.linkTtlMinutes} นาที ถ้าคุณไม่ได้ขอลิงก์นี้ ไม่ต้องทำอะไรครับ`,
  },
} as const;

/** True when Resend accepted the email. Never throws. */
export async function sendChatLink(to: string, url: string, lang: "th" | "en"): Promise<boolean> {
  if (!visitorMailAvailable()) return false;
  const copy = COPY[lang];
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.CHAT_NOTIFY_FROM, to: [to], subject: copy.subject, text: copy.text(url) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.warn(`[chat] link email answered HTTP ${res.status}`);
    return res.ok;
  } catch (err) {
    console.warn("[chat] link email failed:", err instanceof Error ? err.message : err);
    return false;
  }
}
