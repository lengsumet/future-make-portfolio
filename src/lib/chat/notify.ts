import { after } from "next/server";
import { ownerMailbox, sendMail } from "@/lib/chat/mail";

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
 *   email                     through whichever sender mail.ts has (Gmail or
 *                             Resend), to CHAT_NOTIFY_EMAIL, else to the
 *                             Gmail account itself. Reply-To is the visitor
 *                             when they left an email.
 *
 * Runs after the response, capped per channel, and never throws: a failed
 * ping must not lose the visitor's message.
 */
export function notifyOwner(input: { name?: string | null; email?: string | null; body: string; conversationId: string; isNew: boolean }) {
  const webhook = process.env.CHAT_NOTIFY_WEBHOOK_URL;
  const mailbox = ownerMailbox();
  if (!webhook && !mailbox) return;

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
        }).then((r) => {
          if (!r.ok) console.warn(`[chat] owner webhook answered HTTP ${r.status}`);
        }),
      );
    }
    if (mailbox) {
      jobs.push(
        sendMail({
          to: mailbox,
          subject: `${input.isNew ? "New chat" : "New message"} from ${who}`,
          text,
          ...(input.email ? { replyTo: input.email } : {}),
        }),
      );
    }
    const results = await Promise.allSettled(jobs);
    for (const r of results) {
      if (r.status === "rejected") console.warn("[chat] owner notification failed:", r.reason instanceof Error ? r.reason.message : r.reason);
    }
  };

  try {
    after(run);
  } catch {
    void run();
  }
}
