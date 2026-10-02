import nodemailer, { type Transporter } from "nodemailer";
import { NextRequest } from "next/server";
import { LIMITS } from "@/lib/chat/core";
import { siteConfig } from "@/config/siteConfig";

/**
 * Outgoing chat email: the owner's "visitor waiting" ping and the visitor's
 * "continue this chat" link.
 *
 * Two senders, picked by environment:
 *   GMAIL_USER + GMAIL_APP_PASSWORD   Gmail SMTP with a Google app password.
 *                                     Mail comes from the owner's own Gmail.
 *   RESEND_API_KEY (+ CHAT_NOTIFY_FROM) Resend's REST API. Mailing visitors
 *                                     needs CHAT_NOTIFY_FROM on a domain
 *                                     verified in Resend; the shared
 *                                     onboarding sender only reaches the
 *                                     account owner.
 * Gmail wins when both are set.
 */

type Mail = { to: string[]; subject: string; text: string; replyTo?: string };

function gmailAuth() {
  const user = process.env.GMAIL_USER?.trim();
  // Google shows app passwords in groups of four; accept them pasted with spaces.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  return user && pass ? { user, pass } : null;
}

// One SMTP client per server instance, not per email.
let gmailClient: Transporter | null = null;
function gmail(auth: { user: string; pass: string }): Transporter {
  gmailClient ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });
  return gmailClient;
}

/** Can the chat email someone other than the owner? */
export function visitorMailAvailable(): boolean {
  return !!gmailAuth() || !!(process.env.RESEND_API_KEY && process.env.CHAT_NOTIFY_FROM);
}

/** Where owner pings go, or null when no email channel is set up. */
export function ownerMailbox(): string[] | null {
  const to = process.env.CHAT_NOTIFY_EMAIL || (gmailAuth() ? process.env.GMAIL_USER : undefined);
  if (!to || !(gmailAuth() || process.env.RESEND_API_KEY)) return null;
  return to.split(",").map((s) => s.trim()).filter(Boolean);
}

/** True when the provider accepted the email. Never throws. */
export async function sendMail(mail: Mail): Promise<boolean> {
  const auth = gmailAuth();
  try {
    if (auth) {
      await gmail(auth).sendMail({
        from: { name: siteConfig.owner.name, address: auth.user },
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
      });
      return true;
    }
    const key = process.env.RESEND_API_KEY;
    if (!key) return false;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.CHAT_NOTIFY_FROM ?? "Portfolio chat <onboarding@resend.dev>",
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.warn(`[chat] email via Resend answered HTTP ${res.status}`);
    return res.ok;
  } catch (err) {
    // Message only: an SMTP error can quote the auth exchange, never log the whole object.
    console.warn(`[chat] email via ${auth ? "Gmail" : "Resend"} failed:`, err instanceof Error ? err.message : "unknown error");
    return false;
  }
}

export function siteBase(request: NextRequest): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");
}

const LINK_COPY = {
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

export async function sendChatLink(to: string, url: string, lang: "th" | "en"): Promise<boolean> {
  if (!visitorMailAvailable()) return false;
  const copy = LINK_COPY[lang];
  return sendMail({ to: [to], subject: copy.subject, text: copy.text(url) });
}
