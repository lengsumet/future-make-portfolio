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

const TOKEN_KEY = "sb-chat-token";
const QUICK = ["I need a custom system", "A question about a product", "Hiring / job opportunity"];

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

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatWidget() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contact, setContact] = useState<{ name: string | null; email: string | null }>({ name: null, email: null });
  const [unread, setUnread] = useState(0);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailPrompt, setEmailPrompt] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastActivity = useRef(Date.now());
  const cursor = useRef<string | null>(null);

  useEffect(() => setToken(readToken()), []);

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
        if (!res.ok) throw new Error(data.error ?? "Could not send");
        writeToken(data.token);
        setContact({ name: name || null, email: email || null });
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
        if (!res.ok) throw new Error(data.error ?? "Could not send");
        setMessages((prev) => prev.map((m) => (m.id === temp.id ? data.message : m)));
        cursor.current = data.message.createdAt;
      }
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === temp.id ? { ...m, pending: false, failed: true } : m)));
      setError(err instanceof Error && err.message !== "Invalid request" ? err.message : "Couldn't send. Check your connection and try again.");
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
      setError("That email doesn't look right.");
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
            aria-label="Chat with Sumet"
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
                  Usually replies within a few hours
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-3)] transition-colors hover:bg-white/[0.06] hover:text-[var(--text-1)]"
              >
                <FaTimes size={12} />
              </button>
            </header>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
              <Bubble sender="owner" body={"Hi! 👋 I'm Sumet. Ask me anything — a custom system, one of the products, pricing, or a role you're hiring for. สอบถามเป็นภาษาไทยได้เลยครับ"} />

              {!started && (
                <div className="flex flex-wrap gap-2 pl-1 pt-1">
                  {QUICK.map((q) => (
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

              {messages.map((m) => (
                <Bubble key={m.id} sender={m.sender} body={m.body} at={m.pending ? "Sending…" : m.failed ? "Not sent" : time(m.createdAt)} failed={m.failed} />
              ))}

              {started && !ownerReplied && (
                <p className="px-2 text-center font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                  Sent. I&apos;ll reply here{contact.email ? ` and to ${contact.email}` : ""}.
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
                    Leave your email so I can reply if you close this page
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
                      Save
                    </button>
                  </div>
                </form>
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
                    aria-label="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name (optional)"
                    maxLength={80}
                    className="min-w-0 rounded-full border border-[var(--border-mid)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-1)] outline-none focus:border-[var(--accent)]"
                  />
                  <input
                    aria-label="Your email (optional)"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional)"
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
                  placeholder={started ? "Write a message…" : "Write your first message…"}
                  aria-label="Message"
                  className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-4)]"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--text-1)] text-[var(--background)] transition-opacity disabled:opacity-30"
                >
                  <FaArrowUp size={12} />
                </button>
              </div>
              <p className="mt-2 px-1 font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                Enter to send · Shift+Enter for a new line
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : unread > 0 ? `Open chat, ${unread} new message${unread > 1 ? "s" : ""}` : "Chat with Sumet"}
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
