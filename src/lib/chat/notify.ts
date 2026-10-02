import { after } from "next/server";

/**
 * Tells the owner a visitor is waiting.
 *
 * Sent once per burst — when a conversation goes from no unread messages to
 * one — so a visitor typing five lines produces one ping, not five. Two
 * optional channels, configured by environment so no secret sits in code:
 *
 *   CHAT_NOTIFY_WEBHOOK_URL   any JSON-POST endpoint (Discord/Slack incoming
 *                             webhook, n8n, a LINE Messaging API relay); the
 *                             body carries `text` and `content`.
 *   RESEND_API_KEY +          email through Resend's REST API.
 *   CHAT_NOTIFY_EMAIL
 *
 * Runs after the response, capped at 5 s per channel, and never throws: a
 * failed ping must not lose the visitor's message.
 */
export function notifyOwner(input: { name?: string | null; email?: string | null; body: string; conversationId: string; isNew: boolean }) {
  const webhook = process.env.CHAT_NOTIFY_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CHAT_NOTIFY_EMAIL;
  if (!webhook && !(resendKey && to)) return;

  const who = input.name || input.email || "A visitor";
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = base ? `${base.replace(/\/$/, "")}/admin/inbox?c=${input.conversationId}` : "";
  const preview = input.body.length > 280 ? `${input.body.slice(0, 280)}…` : input.body;
  const text = `💬 ${input.isNew ? "New chat" : "New message"} from ${who}${input.email ? ` <${input.email}>` : ""}\n${preview}${link ? `\n${link}` : ""}`;

  const run = async () => {
    const jobs: Promise<unknown>[] = [];
    if (webhook) {
      jobs.push(
        fetch(webhook, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text, content: text }),
          signal: AbortSignal.timeout(5000),
        }),
      );
    }
    if (resendKey && to) {
      jobs.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { authorization: `Bearer ${resendKey}`, "content-type": "application/json" },
          body: JSON.stringify({
            from: process.env.CHAT_NOTIFY_FROM ?? "Portfolio chat <onboarding@resend.dev>",
            to: to.split(",").map((s) => s.trim()).filter(Boolean),
            subject: `${input.isNew ? "New chat" : "New message"} from ${who}`,
            text,
            ...(input.email ? { reply_to: input.email } : {}),
          }),
          signal: AbortSignal.timeout(5000),
        }),
      );
    }
    const results = await Promise.allSettled(jobs);
    for (const r of results) {
      if (r.status === "rejected") console.warn("[chat] owner notification failed:", r.reason instanceof Error ? r.reason.message : r.reason);
      else if (r.value instanceof Response && !r.value.ok) console.warn(`[chat] owner notification answered HTTP ${r.value.status}`);
    }
  };

  try {
    after(run);
  } catch {
    void run();
  }
}
