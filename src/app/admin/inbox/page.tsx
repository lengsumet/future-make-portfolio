"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaArrowUp, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { PageHeader, Segmented, StatusPill } from "@/components/admin/AdminKit";

/**
 * The owner's side of the visitor chat: conversations on the left, the open
 * thread on the right, replies sent from the composer. Both panes poll — the
 * thread every 5 s while visible, the list every 15 s — because the site runs
 * on serverless functions with no socket to push over.
 */

type Filter = "open" | "closed" | "all";
type Row = {
  id: string;
  name: string | null;
  email: string | null;
  page: string | null;
  status: string;
  unreadByAdmin: number;
  lastMessageAt: string;
  last: { sender: string; body: string } | null;
};
type Message = { id: string; sender: "visitor" | "owner"; body: string; createdAt: string };
type Thread = { id: string; name: string | null; email: string | null; page: string | null; status: string; createdAt: string };

const label = (r: { name: string | null; email: string | null; id: string }) => r.name || r.email || `Visitor ${r.id.slice(-5)}`;
const ago = (iso: string) => {
  const s = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};
const stamp = (iso: string) => new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Inbox() {
  const router = useRouter();
  const params = useSearchParams();
  const selected = params.get("c");
  const [filter, setFilter] = useState<Filter>("open");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cursor = useRef<string | null>(null);

  const loadList = useCallback(async () => {
    const res = await fetch(`/api/admin/chat?status=${filter}`, { cache: "no-store", headers: { "x-no-progress": "1" } });
    if (res.ok) setRows((await res.json()).data);
  }, [filter]);

  const loadThread = useCallback(
    async (fresh: boolean) => {
      if (!selected) return;
      const after = !fresh && cursor.current ? `?after=${encodeURIComponent(cursor.current)}` : "";
      const res = await fetch(`/api/admin/chat/${selected}${after}`, { cache: "no-store", headers: { "x-no-progress": "1" } });
      if (!res.ok) {
        setThread(null);
        return;
      }
      const data = (await res.json()) as { conversation: Thread; messages: Message[] };
      setThread(data.conversation);
      setMessages((prev) => {
        const base = fresh ? [] : prev;
        const seen = new Set(base.map((m) => m.id));
        return [...base, ...data.messages.filter((m) => !seen.has(m.id))];
      });
      if (data.messages.length) cursor.current = data.messages[data.messages.length - 1].createdAt;
    },
    [selected],
  );

  useEffect(() => {
    void loadList();
    const id = window.setInterval(() => document.visibilityState === "visible" && void loadList(), 15000);
    return () => window.clearInterval(id);
  }, [loadList]);

  useEffect(() => {
    cursor.current = null;
    setMessages([]);
    setThread(null);
    setError(null);
    if (!selected) return;
    void loadThread(true).then(loadList);
    const id = window.setInterval(() => document.visibilityState === "visible" && void loadThread(false), 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const open = (id: string | null) => router.replace(id ? `/admin/inbox?c=${id}` : "/admin/inbox", { scroll: false });

  const reply = async () => {
    const body = draft.trim();
    if (!body || !selected || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/chat/${selected}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error();
      const { message } = (await res.json()) as { message: Message };
      setMessages((prev) => [...prev, message]);
      cursor.current = message.createdAt;
      setDraft("");
      void loadList();
    } catch {
      setError("Reply not sent. Try again.");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status: "open" | "closed") => {
    if (!selected) return;
    const res = await fetch(`/api/admin/chat/${selected}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setThread((t) => (t ? { ...t, status } : t));
      void loadList();
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="05 — Inbox"
        title="Inbox"
        description="Chats from visitors to the site. They see your replies in the chat window, and by email if they left one."
        actions={
          <Segmented<Filter>
            label="Filter conversations"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
              { value: "all", label: "All" },
            ]}
          />
        }
      />

      <div className="grid h-[min(720px,calc(100vh-15rem))] min-h-[480px] overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] md:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <nav aria-label="Conversations" className={`min-h-0 overflow-y-auto border-[var(--border)] md:border-r ${selected ? "hidden md:block" : ""}`}>
          {rows === null ? (
            <p className="p-6 text-sm" style={{ color: "var(--text-3)" }}>
              Loading…
            </p>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                No {filter === "all" ? "" : filter} conversations.
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-4)" }}>
                New chats from the site will appear here.
              </p>
            </div>
          ) : (
            <ul>
              {rows.map((r) => {
                const active = r.id === selected;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => open(r.id)}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full gap-3 border-b border-[var(--border)] px-5 py-4 text-left transition-colors ${
                        active ? "bg-white/[0.05]" : "hover:bg-white/[0.025]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-mid)] bg-[var(--surface-2)] text-xs font-semibold uppercase text-[var(--accent-3)]">
                        {label(r).slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`truncate text-sm ${r.unreadByAdmin ? "font-semibold" : ""}`} style={{ color: "var(--text-1)" }}>
                            {label(r)}
                          </span>
                          <span className="shrink-0 font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                            {ago(r.lastMessageAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className="truncate text-xs" style={{ color: r.unreadByAdmin ? "var(--text-2)" : "var(--text-3)" }}>
                            {r.last ? `${r.last.sender === "owner" ? "You: " : ""}${r.last.body}` : "—"}
                          </span>
                          {r.unreadByAdmin > 0 && (
                            <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[var(--accent-3)] px-1 text-2xs font-bold text-[var(--background)]">
                              {r.unreadByAdmin}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* Thread */}
        <section aria-label="Conversation" className={`flex min-h-0 flex-col ${selected ? "" : "hidden md:flex"}`}>
          {!selected || !thread ? (
            <div className="m-auto p-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-2)" }}>
                {selected ? "Loading conversation…" : "Select a conversation"}
              </p>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <button
                  type="button"
                  onClick={() => open(null)}
                  aria-label="Back to conversations"
                  className="flex h-8 w-8 items-center justify-center rounded-full! text-[var(--text-3)] hover:bg-white/[0.06] md:hidden"
                >
                  <FaArrowLeft size={12} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                    {label(thread)}
                  </p>
                  <p className="truncate font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                    {thread.email ?? "no email left"} · started {stamp(thread.createdAt)}
                    {thread.page ? ` on ${thread.page}` : ""}
                  </p>
                </div>
                <StatusPill status={thread.status} tone={thread.status === "open" ? "positive" : "neutral"} />
                {thread.email && (
                  <a
                    href={`mailto:${thread.email}?subject=${encodeURIComponent("Re: your message on sumet's portfolio")}`}
                    className="inline-flex items-center gap-1.5 rounded-full! border border-[var(--border-mid)] px-3 py-1.5 text-xs text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
                  >
                    <FaEnvelope size={10} aria-hidden="true" /> Email
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => void setStatus(thread.status === "open" ? "closed" : "open")}
                  className="rounded-full! border border-[var(--border-mid)] px-3 py-1.5 text-xs text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
                >
                  {thread.status === "open" ? "Close" : "Reopen"}
                </button>
              </header>

              <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-6" aria-live="polite">
                {messages.map((m) => {
                  const mine = m.sender === "owner";
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`flex max-w-[75%] flex-col ${mine ? "items-end" : "items-start"}`}>
                        <p
                          className={`whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2.5 text-sm leading-relaxed ${
                            mine
                              ? "rounded-br-md bg-[var(--accent-bg)] text-[var(--text-1)] ring-1 ring-[var(--accent-border)]"
                              : "rounded-bl-md border border-[var(--border)] bg-white/[0.04] text-[var(--text-1)]"
                          }`}
                        >
                          {m.body}
                        </p>
                        <span className="mt-1 px-1 font-mono text-2xs" style={{ color: "var(--text-4)" }}>
                          {mine ? "You · " : ""}
                          {stamp(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void reply();
                }}
                className="border-t border-[var(--border)] p-3"
              >
                {error && (
                  <p role="alert" className="mb-2 px-1 text-xs text-red-300">
                    {error}
                  </p>
                )}
                <div className="flex items-end gap-2 rounded-[18px] border border-[var(--border-mid)] bg-[var(--surface-2)] p-1.5 focus-within:border-[var(--accent)]">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        void reply();
                      }
                    }}
                    rows={1}
                    maxLength={2000}
                    placeholder="Write a reply…"
                    aria-label="Reply"
                    className="max-h-40 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-[var(--text-1)] outline-none placeholder:text-[var(--text-4)]"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    aria-label="Send reply"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full! bg-[var(--text-1)] text-[var(--background)] transition-opacity disabled:opacity-30"
                  >
                    <FaArrowUp size={12} />
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense>
      <Inbox />
    </Suspense>
  );
}
