"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaArrowUp, FaComments, FaTimes, FaEnvelope } from "react-icons/fa";

/**
 * Visitor chat with the owner.
 *
 * A floating launcher opens a glass panel. The first message starts a
 * conversation and the server hands back a token the browser keeps, so the
 * chat survives reloads and is the visitor's alone. Replies arrive by
 * polling — serverless functions cannot hold a socket open — and the poll
 * only runs fast while the panel is open and the tab visible: every 4 s,
 * easing to 15 s after two quiet minutes; once a minute while closed (for
 * the unread dot); never while the tab is hidden.
 */

type Message = { id: string; sender: "visitor" | "owner"; body: string; createdAt: string; pending?: boolean; failed?: boolean };
type Contact = { name: string | null; email: string | null; emailVerified: boolean };
type LinkState = "idle" | "sending" | "sent" | "tooSoon" | "failed";

const TOKEN_KEY = "sb-chat-token";
const LANG_KEY = "sb-chat-lang";
type Lang = "th" | "en";

const T = {
  en: {
    chatWith: "Chat with Sumet",
    openWithUnread: (n: number) => `Open chat, ${n} new message${n > 1 ? "s" : ""}`,
    close: "Close chat",
    replies: "Usually replies within a few hours",
    greeting: "Hi! 👋 I'm Sumet. Ask me anything — a custom system, one of the products, pricing, or a role you're hiring for.",
    quick: ["I need a custom system", "A question about a product", "Hiring / job opportunity"],
    sending: "Sending…",
    notSent: "Not sent",
    sent: (email: string | null) => `Sent. I'll reply here${email ? ` and to ${email}` : ""}.`,
    leaveEmail: "Leave your email so I can reply if you close this page",
    save: "Save",
    name: "Name (optional)",
    email: "Email (optional)",
    nameLabel: "Your name (optional)",
    emailLabel: "Your email (optional)",
    first: "Write your first message…",
    next: "Write a message…",
    message: "Message",
    send: "Send message",
    hint: "Enter to send · Shift+Enter for a new line",
    tooFast: "You're sending messages too quickly. Please wait a moment.",
    tooMany: "Too many new chats. Please try again later.",
    failed: "Couldn't send. Check your connection and try again.",
    badEmail: "That email doesn't look right.",
    switchTo: "ภาษาไทย",
    switchLabel: "เปลี่ยนเป็นภาษาไทย",
    resumeAsk: "Chatted before? Continue with your email",
    resumeHint: "I'll email a link that opens your earlier chat on this device.",
    resumeEmailLabel: "Email you chatted with",
    resumeSent: "If a chat used that email, a link is on its way. It works for 30 minutes.",
    sendLink: "Send link",
    cancel: "Cancel",
    linkCard: (email: string) => `Continue on another device: I'll email a link to ${email}`,
    linkSent: (email: string) => `Link sent to ${email}. Open it on any device within 30 minutes.`,
    linkTooSoon: "A link went out a few minutes ago. Check your inbox, or try again shortly.",
    linkFailed: "Couldn't send the email. Try again in a moment.",
    linkOk: "Welcome back. Your chat is here and your email is verified.",
    linkExpired: "That link has expired or was already used. You can ask for a new one.",
  },
  th: {
    chatWith: "แชทกับสุเมธ",
    openWithUnread: (n: number) => `เปิดแชท มีข้อความใหม่ ${n} ข้อความ`,
    close: "ปิดแชท",
    replies: "ตอบกลับภายในไม่กี่ชั่วโมง",
    greeting: "สวัสดีครับ 👋 ผมสุเมธ ถามได้ทุกเรื่องเลยครับ — อยากให้ทำระบบ สอบถามสินค้า ราคา หรือติดต่อเรื่องงาน",
    quick: ["อยากให้ทำระบบให้", "สอบถามเรื่องสินค้า", "ติดต่อเรื่องงาน / จ้างงาน"],
    sending: "กำลังส่ง…",
    notSent: "ส่งไม่สำเร็จ",
    sent: (email: string | null) => `ส่งแล้วครับ ผมจะตอบกลับที่นี่${email ? ` และทาง ${email}` : ""}`,
    leaveEmail: "ฝากอีเมลไว้ได้นะครับ ถ้าปิดหน้านี้ไปแล้วผมจะตอบกลับทางอีเมล",
    save: "บันทึก",
    name: "ชื่อ (ไม่บังคับ)",
    email: "อีเมล (ไม่บังคับ)",
    nameLabel: "ชื่อของคุณ (ไม่บังคับ)",
    emailLabel: "อีเมลของคุณ (ไม่บังคับ)",
    first: "พิมพ์ข้อความแรกได้เลย…",
    next: "พิมพ์ข้อความ…",
    message: "ข้อความ",
    send: "ส่งข้อความ",
    hint: "Enter เพื่อส่ง · Shift+Enter ขึ้นบรรทัดใหม่",
    tooFast: "ส่งข้อความถี่เกินไป รอสักครู่แล้วลองใหม่นะครับ",
    tooMany: "เริ่มแชทใหม่หลายครั้งเกินไป ลองใหม่ภายหลังนะครับ",
    failed: "ส่งไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
    badEmail: "รูปแบบอีเมลไม่ถูกต้อง",
    switchTo: "English",
    switchLabel: "Switch to English",
    resumeAsk: "เคยคุยไว้แล้ว? คุยต่อด้วยอีเมล",
    resumeHint: "ผมจะส่งลิงก์ไปที่อีเมล กดแล้วแชทเดิมจะเปิดขึ้นบนเครื่องนี้",
    resumeEmailLabel: "อีเมลที่เคยใช้คุย",
    resumeSent: "ถ้ามีแชทที่ใช้อีเมลนี้ ลิงก์กำลังส่งไปครับ ใช้ได้ภายใน 30 นาที",
    sendLink: "ส่งลิงก์",
    cancel: "ยกเลิก",
    linkCard: (email: string) => `คุยต่อบนเครื่องอื่น: ผมจะส่งลิงก์ไปที่ ${email}`,
    linkSent: (email: string) => `ส่งลิงก์ไปที่ ${email} แล้ว เปิดจากเครื่องไหนก็ได้ภายใน 30 นาที`,
    linkTooSoon: "เพิ่งส่งลิงก์ไปเมื่อไม่กี่นาทีก่อน ลองเช็กอีเมล หรือรอสักครู่แล้วขอใหม่",
    linkFailed: "ส่งอีเมลไม่สำเร็จ ลองใหม่อีกครั้งนะครับ",
    linkOk: "ยินดีต้อนรับกลับครับ แชทเดิมอยู่ตรงนี้ และยืนยันอีเมลแล้ว",
    linkExpired: "ลิงก์หมดอายุหรือถูกใช้ไปแล้ว ขอลิงก์ใหม่ได้ครับ",
  },
} as const;

// Saved choice first, then the browser language; Thai browsers get Thai.
const readLang = (): Lang => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "th" || saved === "en") return saved;
  } catch {
    /* storage blocked: fall through to the browser language */
  }
  return navigator.language?.toLowerCase().startsWith("th") ? "th" : "en";
};

const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const writeToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: the chat still works for this page view */
  }
};

const time = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleTimeString(lang === "th" ? "th-TH" : "en-GB", { hour: "2-digit", minute: "2-digit" });

export default function ChatWidget() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<Contact>({ name: null, email: null, emailVerified: false });
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailPrompt, setEmailPrompt] = useState("");
  const [linkAvailable, setLinkAvailable] = useState(false);
  const [linkState, setLinkState] = useState<LinkState>("idle");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [resumeEmail, setResumeEmail] = useState("");
  const [flash, setFlash] = useState<"linkOk" | "linkExpired" | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastActivity = useRef(Date.now());
  const cursor = useRef<string | null>(null);
  const checkedLink = useRef(false);

  // Arriving from an emailed link (#chat-link=…) swaps this browser onto that chat.
  useEffect(() => {
    setLang(readLang());
    const match = window.location.hash.match(/^#chat-link=([0-9a-f]{64})$/);
    if (!match) {
      setToken(readToken());
      return;
    }
    // Single-use: take it out of the address bar and history straight away.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setOpen(true);
    void (async () => {
      try {
        const res = await fetch("/api/chat/link/verify", {
          method: "POST",
          headers: { "content-type": "application/json", "x-no-progress": "1" },
          body: JSON.stringify({ token: match[1] }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { token: string };
        writeToken(data.token);
        setToken(data.token);
        setFlash("linkOk");
      } catch {
        setToken(readToken());
        setFlash("linkExpired");
      }
    })();
  }, []);

  // Ask once, on first open, whether email links are switched on.
  useEffect(() => {
    if (!open || checkedLink.current) return;
    checkedLink.current = true;
    fetch("/api/chat/link", { headers: { "x-no-progress": "1" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { available?: boolean } | null) => setLinkAvailable(!!d?.available))
      .catch(() => setLinkAvailable(false));
  }, [open]);

  const requestLink = async (address: string) => {
    setLinkState("sending");
    try {
      const res = await fetch("/api/chat/link", {
        method: "POST",
        headers: { "content-type": "application/json", "x-no-progress": "1", ...(token ? { "x-chat-token": token } : {}) },
        body: JSON.stringify({ email: address, lang }),
      });
      if (res.status === 429) return setLinkState("tooSoon");
      if (!res.ok) return setLinkState("failed");
      const data = (await res.json()) as { contact?: Contact };
      if (data.contact) setContact(data.contact);
      setLinkState("sent");
    } catch {
      setLinkState("failed");
    }
  };

  const toggleLang = () => {
    const next: Lang = lang === "th" ? "en" : "th";
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* not remembered, still switched for this page view */
    }
  };

  const merge = useCallback((incoming: Message[], countUnread: boolean) => {
    if (incoming.length === 0) return;
    lastActivity.current = Date.now();
    cursor.current = incoming[incoming.length - 1].createdAt;
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !seen.has(m.id));
      if (countUnread) setUnread((u) => u + fresh.filter((m) => m.sender === "owner").length);
      return [...prev.filter((m) => !m.pending || !fresh.some((f) => f.body === m.body && f.sender === "visitor")), ...fresh];
    });
  }, []);

  const poll = useCallback(async () => {
    if (!token) return;
    const url = `/api/chat/messages${cursor.current ? `?after=${encodeURIComponent(cursor.current)}` : ""}`;
    try {
      const res = await fetch(url, { headers: { "x-chat-token": token, "x-no-progress": "1" }, cache: "no-store" });
      if (res.status === 404) {
        // The conversation is gone (deleted by the owner): start fresh.
        writeToken(null);
        setToken(null);
        setMessages([]);
        cursor.current = null;
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[]; contact: typeof contact };
      setContact(data.contact);
      merge(data.messages, !open);
    } catch {
      /* offline for a moment: the next tick retries */
    }
  }, [token, open, merge]);

  // First load of an existing conversation.
  useEffect(() => {
    if (token) void poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // The polling loop: fast while open and visible, slow while closed, off while hidden.
  useEffect(() => {
    if (!token) return;
    let timer: number | undefined;
    const tick = async () => {
      if (document.visibilityState === "visible") await poll();
      const quiet = Date.now() - lastActivity.current > 2 * 60 * 1000;
      const delay = open ? (quiet ? 15000 : 4000) : 60000;
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, open ? 4000 : 60000);
    const onVisible = () => document.visibilityState === "visible" && void poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, open, poll]);

  // Opening the panel clears the unread dot and focuses the composer.
  useEffect(() => {
    if (!open) return;
    setUnread(0);
    lastActivity.current = Date.now();
    const id = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => window.clearTimeout(id);
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, open, reduce]);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const body = text.trim();
    if (!body || sending) return;
    setError(null);
    setSending(true);
    lastActivity.current = Date.now();
    const temp: Message = { id: `tmp-${Date.now()}`, sender: "visitor", body, createdAt: new Date().toISOString(), pending: true };
    setMessages((prev) => [...prev, temp]);
    setDraft("");
    try {
      if (!token) {
        const res = await fetch("/api/chat/start", {
          method: "POST",
          headers: { "content-type": "application/json", "x-no-progress": "1" },
          body: JSON.stringify({ message: body, name: name || undefined, email: email || undefined, page: pathname, website: honeypot || undefined }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(res.status === 429 ? t.tooMany : t.failed);
        writeToken(data.token);
        setContact({ name: name || null, email: email || null, emailVerified: false });
        setLinkState("idle");
        setMessages(data.messages);
        cursor.current = data.messages.at(-1)?.createdAt ?? null;
        setToken(data.token);
      } else {
        const res = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "content-type": "application/json", "x-chat-token": token, "x-no-progress": "1" },
          body: JSON.stringify({ body }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(res.status === 429 ? t.tooFast : t.failed);
        setMessages((prev) => prev.map((m) => (m.id === temp.id ? data.message : m)));
        cursor.current = data.message.createdAt;
      }
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? { ...m, pending: false, failed: true } : m)));
      // Errors we threw above are already worded; a network failure is not.
      setError(err instanceof Error && (err.message === t.tooMany || err.message === t.tooFast) ? err.message : t.failed);
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  const saveEmail = async () => {
    if (!token || !emailPrompt.trim()) return;
    const res = await fetch("/api/chat/contact", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-chat-token": token, "x-no-progress": "1" },
      body: JSON.stringify({ email: emailPrompt.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setContact(data.contact);
      setEmailPrompt("");
    } else {
      setError(t.badEmail);
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  const started = messages.length > 0;
  const ownerReplied = messages.some((m) => m.sender === "owner");

  return (
    <div className="fixed bottom-24 right-4 z-[55] md:bottom-6 md:right-6">
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-label={t.chatWith}
            lang={lang}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[calc(100%+0.75rem)] right-0 flex h-[min(600px,calc(100vh-9rem))] w-[min(390px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-[24px] border border-[var(--border-mid)] bg-[rgba(21,16,14,0.94)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-3)] to-transparent" aria-hidden="true" />

            {/* Header */}
            <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-fg)] to-[var(--accent-2)] text-xs font-bold text-[var(--background)]">
                SB
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] bg-[var(--green)]" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                  Sumet Buarod
                </p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {t.replies}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleLang}
                aria-label={t.switchLabel}
                lang={lang === "th" ? "en" : "th"}
                className="rounded-full border border-[var(--border-mid)] px-2.5 py-1 text-2xs font-medium text-[var(--text-2)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--text-1)]"
              >
                {t.switchTo}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.close}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-3)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]"
              >
                <FaTimes size={12} />
              </button>
            </header>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
              <Bubble sender="owner" body={t.greeting} />

              {flash && (
                <p
                  role="status"
                  className={`px-2 text-center font-mono text-2xs ${flash === "linkOk" ? "text-[var(--green)]" : "text-red-300"}`}
                >
                  {t[flash]}
                </p>
              )}

              {!started && (
                <div className="flex flex-wrap gap-2 pl-1 pt-1">
                  {t.quick.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setDraft(q);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full border border-[var(--border-mid)] bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--text-2)] transition-colors hover:border-[var(--accent-border)] hover:text-[var(--text-1)]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Returning visitor on a new device: mail a link to their earlier chat. */}
              {!started && linkAvailable &&
                (!resumeOpen ? (
                  <button
                    type="button"
                    onClick={() => {
                      setResumeOpen(true);
                      setLinkState("idle");
                    }}
                    className="pl-1 text-xs text-[var(--accent-3)] underline-offset-4 hover:underline"
                  >
                    {t.resumeAsk}
                  </button>
                ) : linkState === "sent" ? (
                  <p role="status" className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-3 text-xs" style={{ color: "var(--text-2)" }}>
                    {t.resumeSent}
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (resumeEmail.trim()) void requestLink(resumeEmail.trim());
                    }}
                    className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-3"
                  >
                    <p className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                      <FaEnvelope size={11} aria-hidden="true" className="text-[var(--accent-3)]" />
                      {t.resumeHint}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="email"
                        required
                        aria-label={t.resumeEmailLabel}
                        value={resumeEmail}
                        onChange={(e) => setResumeEmail(e.target.value)}
                        placeholder="you@company.com"
                        maxLength={160}
                        className="min-w-0 flex-1 rounded-full border border-[var(--border-mid)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-1)] outline-none focus:border-[var(--accent)]"
                      />
                      <button
                        type="submit"
                        disabled={linkState === "sending"}
                        className="rounded-full bg-[var(--text-1)] px-3 py-1.5 text-xs font-medium text-[var(--background)] disabled:opacity-50"
                      >
                        {t.sendLink}
                      </button>
                    </div>
                    {linkState === "failed" && (
                      <p role="alert" className="mt-2 text-xs text-red-300">
                        {t.linkFailed}
                      </p>
                    )}
                    <button type="button" onClick={() => setResumeOpen(false)} className="mt-2 text-2xs text-[var(--text-3)] hover:text-[var(--text-1)]">
                      {t.cancel}
                    </button>
                  </form>
                ))}

              {messages.map((m) => (
                <Bubble key={m.id} sender={m.sender} body={m.body} at={m.pending ? t.sending : m.failed ? t.notSent : time(m.createdAt, lang)} failed={m.failed} />
              ))}

              {started && !ownerReplied && (
                <p className="px-2 text-center font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                  {t.sent(contact.email)}
                </p>
              )}

              {started && !contact.email && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveEmail();
                  }}
                  className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-3"
                >
                  <label htmlFor="chat-email-later" className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                    <FaEnvelope size={11} aria-hidden="true" className="text-[var(--accent-3)]" />
                    {t.leaveEmail}
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="chat-email-later"
                      type="email"
                      value={emailPrompt}
                      onChange={(e) => setEmailPrompt(e.target.value)}
                      placeholder="you@company.com"
                      className="min-w-0 flex-1 rounded-full border border-[var(--border-mid)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-1)] outline-none focus:border-[var(--accent)]"
                    />
                    <button type="submit" className="rounded-full bg-[var(--text-1)] px-3 py-1.5 text-xs font-medium text-[var(--background)]">
                      {t.save}
                    </button>
                  </div>
                </form>
              )}

              {/* Email given but unproven: one click mails a link that verifies it and opens the chat anywhere. */}
              {started && contact.email && !contact.emailVerified && linkAvailable && (
                <div className="rounded-2xl border border-[var(--border)] bg-white/[0.02] p-3">
                  {linkState === "sent" ? (
                    <p role="status" className="text-xs" style={{ color: "var(--text-2)" }}>
                      {t.linkSent(contact.email)}
                    </p>
                  ) : (
                    <>
                      <p className="flex items-center gap-2 text-xs" style={{ color: "var(--text-2)" }}>
                        <FaEnvelope size={11} aria-hidden="true" className="shrink-0 text-[var(--accent-3)]" />
                        {t.linkCard(contact.email)}
                      </p>
                      <button
                        type="button"
                        onClick={() => contact.email && void requestLink(contact.email)}
                        disabled={linkState === "sending"}
                        className="mt-2 rounded-full bg-[var(--text-1)] px-3 py-1.5 text-xs font-medium text-[var(--background)] disabled:opacity-50"
                      >
                        {t.sendLink}
                      </button>
                      {(linkState === "tooSoon" || linkState === "failed") && (
                        <p role="alert" className="mt-2 text-xs text-red-300">
                          {linkState === "tooSoon" ? t.linkTooSoon : t.linkFailed}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
              className="border-t border-[var(--border)] p-3"
            >
              {!started && (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <input
                    aria-label={t.nameLabel}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.name}
                    maxLength={80}
                    className="min-w-0 rounded-full border border-[var(--border-mid)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-1)] outline-none focus:border-[var(--accent)]"
                  />
                  <input
                    aria-label={t.emailLabel}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.email}
                    maxLength={160}
                    className="min-w-0 rounded-full border border-[var(--border-mid)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-1)] outline-none focus:border-[var(--accent)]"
                  />
                  {/* Honeypot: hidden from people, filled by naive bots. */}
                  <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="hidden" name="website" />
                </div>
              )}
              {error && (
                <p role="alert" className="mb-2 px-1 text-xs text-red-300">
                  {error}
                </p>
              )}
              <div className="flex items-end gap-2 rounded-[18px] border border-[var(--border-mid)] bg-[var(--surface-2)] p-1.5 focus-within:border-[var(--accent)]">
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      void send(draft);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder={started ? t.next : t.first}
                  aria-label={t.message}
                  className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-4)]"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  aria-label={t.send}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--text-1)] text-[var(--background)] transition-opacity disabled:opacity-30"
                >
                  <FaArrowUp size={12} />
                </button>
              </div>
              <p className="mt-2 px-1 font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                {t.hint}
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t.close : unread > 0 ? t.openWithUnread(unread) : t.chatWith}
        aria-expanded={open}
        whileHover={reduce ? undefined : { scale: 1.06 }}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border-mid)] bg-gradient-to-br from-[var(--accent-fg)] to-[var(--accent-2)] text-[var(--background)] shadow-[0_10px_40px_-8px_rgba(224,168,120,0.7)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "chat"}
            initial={reduce ? false : { rotate: -60, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={reduce ? undefined : { rotate: 60, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <FaTimes size={18} /> : <FaComments size={20} />}
          </motion.span>
        </AnimatePresence>
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[var(--background)] bg-red-500 px-1 text-2xs font-bold text-white">
            {unread}
          </span>
        )}
      </motion.button>
    </div>
  );
}

function Bubble({ sender, body, at, failed }: { sender: "visitor" | "owner"; body: string; at?: string; failed?: boolean }) {
  const mine = sender === "visitor";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
        <p
          className={`whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2.5 text-sm leading-relaxed ${
            mine
              ? `rounded-br-md bg-[var(--text-1)] text-[var(--background)] ${failed ? "opacity-60" : ""}`
              : "rounded-bl-md border border-[var(--border)] bg-white/[0.04] text-[var(--text-1)]"
          }`}
        >
          {body}
        </p>
        {at && (
          <span className={`mt-1 px-1 font-mono text-2xs ${failed ? "text-red-300" : ""}`} style={failed ? undefined : { color: "var(--text-4)" }}>
            {at}
          </span>
        )}
      </div>
    </div>
  );
}
