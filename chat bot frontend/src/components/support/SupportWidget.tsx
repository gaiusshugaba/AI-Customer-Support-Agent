import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  Headset,
  Loader2,
  MessageSquarePlus,
  Minus,
  Paperclip,
  RotateCcw,
  Send,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { CHAT_SLOW_NOTICE_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import {
  conversationMessagesQuery,
  ensureConversation,
  myConversationsQuery,
  sendChatMessage,
  sortChronologically,
  uploadAttachment,
  validateAttachment,
  type ChatAttachment,
  type ChatMessage,
  type ChatOutcome,
} from "@/services/customer-chat";

const CONVERSATION_KEY = (userId: string) => `flowstack.conversation.${userId}`;

type Banner =
  | { kind: "needs_information"; text: string }
  | { kind: "handoff"; text: string }
  | null;

const HANDOFF_TEXT =
  "Your request has been sent to the support team. A specialist will reply here as soon as possible.";
const NEEDS_INFO_TEXT =
  "Your issue needs a little more information before we can continue.";
const SCREENSHOT_HINT =
  "Could you attach a screenshot of the error? Please hide any passwords, card numbers or authentication codes.";

const SUGGESTIONS = [
  "How does billing work?",
  "What are my plan limits?",
  "I'm having a technical issue",
  "I need help with my account",
];

/* ----------------------------------------------------------------- helpers */

function timeLabel(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function dayKey(ts: string) {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? "" : d.toDateString();
}

function dayLabel(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

/* ------------------------------------------------------------ root widget */

export function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unread, setUnread] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const openRef = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    openRef.current = open;
    if (open) setEverOpened(true);
  }, [open]);


  /* Lock background scroll while the panel covers the mobile viewport. */
  useEffect(() => {
    if (!open || !isMobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isMobile]);

  const openPanel = useCallback(() => {
    setOpen(true);
    setUnread(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <TooltipProvider delayDuration={200}>
      {everOpened && (
        <div
          aria-hidden={!open}
          className={cn(
            "fixed z-[9999] flex-col overflow-hidden border border-border bg-card shadow-2xl",
            open ? "flex animate-support-in" : "hidden",
            isMobile
              ? "inset-x-3 bottom-3 h-[calc(100dvh-24px)] max-h-[calc(100dvh-24px)] rounded-2xl"
              : "bottom-[88px] right-6 w-[400px] max-w-[calc(100vw-32px)] rounded-2xl",
          )}
          style={
            isMobile
              ? undefined
              : { height: "min(640px, calc(100dvh - 112px))", maxHeight: "calc(100dvh - 112px)" }
          }
        >
          <SupportPanel
            onClose={() => setOpen(false)}
            onMinimize={() => setOpen(false)}
            onAssistantMessage={() => {
              if (!openRef.current) setUnread(true);
            }}
          />
        </div>
      )}


      <div className="fixed bottom-6 right-6 z-[9999]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              aria-label={open ? "Close support chat" : "Chat with support"}
              onClick={() => (open ? setOpen(false) : openPanel())}
              className="relative h-14 w-14 rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
            >
              {open ? <X className="h-6 w-6" /> : <Headset className="h-6 w-6" />}
              {!open && unread && (
                <span
                  aria-label="New message from support"
                  className="absolute right-1 top-1 h-3 w-3 rounded-full bg-destructive ring-2 ring-background"
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {open ? "Close support chat" : "Chat with support"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>,
    document.body,
  );
}

/* ------------------------------------------------------------ panel frame */

function PanelFrame({
  title,
  subtitle,
  onClose,
  onMinimize,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  onMinimize?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      role="dialog"
      aria-label="Customer support chat"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-primary px-3 py-2.5 text-primary-foreground">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
          <Headset className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-[11px] text-primary-foreground/75">{subtitle}</p>
        </div>
        {actions}
        {onMinimize && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Minimize support chat"
            onClick={onMinimize}
            className="h-8 w-8 text-primary-foreground transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close support chat"
          onClick={onClose}
          className="h-8 w-8 text-primary-foreground transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ panel */

function SupportPanel({
  onClose,
  onMinimize,
  onAssistantMessage,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onAssistantMessage?: () => void;
}) {

  const { ready, userId, email, customer, profileLoading, profileError, tenantId } =
    useCustomerSession();
  const queryClient = useQueryClient();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner>(null);
  const [dragging, setDragging] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [hasNew, setHasNew] = useState(false);
  const retryRef = useRef<{ text: string; attachments: ChatAttachment[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Restore (or create) the current conversation pointer for this user. */
  useEffect(() => {
    if (!userId) {
      setConversationId(null);
      return;
    }
    const stored = window.localStorage.getItem(CONVERSATION_KEY(userId));
    const id = stored ?? crypto.randomUUID();
    if (!stored) window.localStorage.setItem(CONVERSATION_KEY(userId), id);
    setConversationId(id);
  }, [userId]);

  const history = useQuery(myConversationsQuery(userId));
  const stored = useQuery(conversationMessagesQuery(conversationId, Boolean(userId) && !sending));

  useEffect(() => {
    if (sending) return;
    if (stored.data) setMessages(stored.data);
  }, [stored.data, sending]);

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const scrollToBottom = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
    setHasNew(false);
  }, []);

  /* Smart scroll: follow new messages only when already near the bottom. */
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    if (atBottom) {
      node.scrollTop = node.scrollHeight;
      setHasNew(false);
    } else {
      setHasNew(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, sending, banner]);

  const onScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    const near = node.scrollHeight - node.scrollTop - node.clientHeight < 64;
    setAtBottom(near);
    if (near) setHasNew(false);
  };

  const resetConversationState = useCallback(() => {
    setMessages([]);
    setBanner(null);
    setError(null);
    setDraft("");
    setPendingFile(null);
    setSending(false);
    setSlow(false);
    setHasNew(false);
    setAtBottom(true);
    retryRef.current = null;
  }, []);

  const startNewConversation = useCallback(() => {
    if (!userId) return;
    const id = crypto.randomUUID();
    window.localStorage.setItem(CONVERSATION_KEY(userId), id);
    setConversationId(id);
    setShowHistory(false);
    resetConversationState();
  }, [userId, resetConversationState]);

  const openConversation = useCallback(
    (id: string) => {
      if (!userId) return;
      window.localStorage.setItem(CONVERSATION_KEY(userId), id);
      setConversationId(id);
      setShowHistory(false);
      resetConversationState();
    },
    [userId, resetConversationState],
  );

  const pickFile = (file: File | null) => {
    if (!file) return;
    const problem = validateAttachment(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setPendingFile(file);
  };

  const applyOutcome = (outcome: ChatOutcome) => {
    if (outcome.kind === "needs_information") {
      setBanner({
        kind: "needs_information",
        text: outcome.prompt
          ? `${NEEDS_INFO_TEXT} ${outcome.prompt}`
          : `${NEEDS_INFO_TEXT} ${SCREENSHOT_HINT}`,
      });
    } else if (outcome.kind === "handoff") {
      setBanner({ kind: "handoff", text: HANDOFF_TEXT });
    } else {
      setBanner(null);
    }
  };

  const deliver = useCallback(
    async (text: string, file: File | null, attachmentsIn: ChatAttachment[]) => {
      if (!userId || !conversationId) return;
      setSending(true);
      setSlow(false);
      setError(null);
      setBanner(null);
      const slowTimer = setTimeout(() => setSlow(true), CHAT_SLOW_NOTICE_MS);

      const localId = crypto.randomUUID();
      let attachments = attachmentsIn;

      try {
        await ensureConversation({
          conversationId,
          customerId: userId,
          tenantId,
          title: text || "Screenshot",
        });

        if (file) {
          attachments = [
            await uploadAttachment({ file, tenantId, customerId: userId, conversationId }),
          ];
        }
        retryRef.current = { text, attachments };

        const sentAt = new Date().toISOString();
        setMessages((prev) => [
          ...prev,
          {
            id: localId,
            role: "customer",
            text: text || null,
            timestamp: sentAt,
            attachments,
            pending: true,
          },
        ]);
        setDraft("");
        setPendingFile(null);

        const result = await sendChatMessage({
          tenantId,
          customerId: userId,
          conversationId,
          text,
          attachments,
        });

        // The reply is always stamped after the message it answers, so a fast
        // backend can never make it sort above the customer's own message.
        const replyAt = new Date(
          Math.max(Date.now(), new Date(sentAt).getTime() + 1),
        ).toISOString();
        setMessages((prev) => [
          ...prev.map((m) => (m.id === localId ? { ...m, pending: false } : m)),
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: result.text,
            timestamp: replyAt,
            attachments: [],
          },
        ]);
        applyOutcome(result.outcome);
        onAssistantMessage?.();
        retryRef.current = null;
        void queryClient.invalidateQueries({ queryKey: ["my-conversations", userId] });

      } catch (err) {
        setMessages((prev) =>
          prev.map((m) => (m.id === localId ? { ...m, pending: false, failed: true } : m)),
        );
        setError(
          err instanceof Error ? err.message : "We couldn't send that message. Please try again.",
        );
      } finally {
        clearTimeout(slowTimer);
        setSlow(false);
        setSending(false);
      }
    },
    [userId, conversationId, tenantId, queryClient, onAssistantMessage],
  );

  const submit = (override?: string) => {
    if (sending) return;
    const text = (override ?? draft).trim();
    if (!text && !pendingFile) return;
    void deliver(text, pendingFile, []);
  };

  const retry = () => {
    const last = retryRef.current;
    if (!last || sending) return;
    setMessages((prev) => prev.filter((m) => !m.failed));
    void deliver(last.text, null, last.attachments);
  };

  /* Group consecutive messages by sender, and mark date changes. */
  const groups = useMemo(() => {
    const out: { key: string; role: ChatMessage["role"]; day: string; items: ChatMessage[] }[] = [];
    for (const m of sortChronologically(messages)) {
      const day = dayKey(m.timestamp);
      const last = out[out.length - 1];
      if (last && last.role === m.role && last.day === day) last.items.push(m);
      else out.push({ key: m.id, role: m.role, day, items: [m] });
    }
    return out;
  }, [messages]);

  /* ---------------------------------------------------------------- render */

  if (!ready || (userId && profileLoading)) {
    return (
      <PanelFrame title="FlowStack Support" subtitle="Connecting…" onClose={onClose}>
        <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your support session…
        </div>
      </PanelFrame>
    );
  }

  if (!userId) {
    return (
      <PanelFrame title="FlowStack Support" subtitle="Sign in to start a chat" onClose={onClose}>
        <AuthPanel />
      </PanelFrame>
    );
  }

  const displayName = customer?.name ?? email ?? "Signed in";

  if (showHistory) {
    return (
      <PanelFrame
        title="Your conversations"
        subtitle={displayName}
        onClose={onClose}
        actions={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to chat"
            onClick={() => setShowHistory(false)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        }
      >
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {history.isLoading && (
            <p className="p-3 text-sm text-muted-foreground">Loading your conversations…</p>
          )}
          {!history.isLoading && (history.data ?? []).length === 0 && (
            <p className="p-3 text-sm text-muted-foreground">
              You haven't started a conversation yet.
            </p>
          )}
          {(history.data ?? []).map((c) => (
            <button
              key={c.conversation_id}
              onClick={() => openConversation(c.conversation_id)}
              className={cn(
                "w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                c.conversation_id === conversationId && "border-primary/50 bg-accent/60",
              )}
            >
              <p className="truncate text-sm font-medium">{c.title ?? "Support conversation"}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {c.last_message ?? "No messages yet"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {c.message_count} message{c.message_count === 1 ? "" : "s"} ·{" "}
                {formatRelative(c.last_activity)}
              </p>
            </button>
          ))}
        </div>
        <div className="shrink-0 border-t border-border p-3">
          <Button className="w-full" onClick={startNewConversation}>
            <MessageSquarePlus className="mr-2 h-4 w-4" /> New conversation
          </Button>
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame
      title="FlowStack Support"
      subtitle="Support assistant"
      onClose={onClose}
      onMinimize={onMinimize}
      actions={
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Your conversations"
            onClick={() => setShowHistory(true)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <UserRound className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="New conversation"
            onClick={startNewConversation}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </>
      }
    >
      {profileError && (
        <p className="shrink-0 border-b border-border bg-destructive/10 px-4 py-2 text-xs text-destructive">
          We couldn't load your account details. Support can still answer general questions.
        </p>
      )}

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className={cn(
            "h-full space-y-3 overflow-y-auto overflow-x-hidden p-3",
            dragging && "bg-accent/40",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0] ?? null);
          }}
        >
          {stored.isLoading && messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Restoring your conversation…</p>
          )}

          {!stored.isLoading && messages.length === 0 && (
            <div className="px-1 pt-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Headset className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-semibold">FlowStack Support</p>
              <p className="mt-1 text-sm text-muted-foreground">Hi! What can we help you with?</p>
              <div className="mt-4 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    disabled={sending}
                    className="rounded-xl border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {groups.map((group, index) => (
            <div key={group.key} className="space-y-1.5">
              {(index === 0 || groups[index - 1]!.day !== group.day) && group.day && (
                <div className="flex items-center gap-2 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-[11px] text-muted-foreground">
                    {dayLabel(group.items[0]!.timestamp)}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}
              <MessageGroup group={group} onRetry={retry} sending={sending} />
            </div>
          ))}

          {sending && (
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-2.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-support-dot rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              {slow && <p className="text-[11px] text-muted-foreground">Still working on that…</p>}
            </div>
          )}

          {banner && (
            <div
              className={cn(
                "flex gap-2 rounded-lg border p-3 text-xs",
                banner.kind === "handoff"
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-muted text-foreground",
              )}
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>{banner.text}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p>{error}</p>
                {retryRef.current && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7"
                    aria-label="Retry message"
                    onClick={retry}
                    disabled={sending}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retry
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {hasNew && !atBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowDown className="mr-1 inline h-3.5 w-3.5" /> New message
          </button>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-3">
        {pendingFile && previewUrl && (
          <div className="mb-2 flex items-center gap-3 rounded-xl border border-border p-2 transition-opacity">
            <img
              src={previewUrl}
              alt={`Attachment preview: ${pendingFile.name}`}
              className="max-h-[160px] max-w-[220px] rounded-lg object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{pendingFile.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              aria-label="Remove attachment"
              onClick={() => setPendingFile(null)}
              disabled={sending}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => {
              pickFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Attach screenshot"
                className="h-9 w-9 shrink-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach screenshot (PNG, JPG, WEBP)</TooltipContent>
          </Tooltip>

          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type your message…"
            aria-label="Message"
            rows={1}
            className="max-h-28 min-h-9 resize-none rounded-2xl py-2 transition-shadow"
            disabled={sending}
          />
          <Button
            size="icon"
            aria-label="Send message"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={() => submit()}
            disabled={sending || (!draft.trim() && !pendingFile)}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Please don't share passwords or card numbers in this chat.
        </p>
      </div>
    </PanelFrame>
  );
}

/* --------------------------------------------------------------- messages */

function MessageGroup({
  group,
  onRetry,
  sending,
}: {
  group: { role: ChatMessage["role"]; items: ChatMessage[] };
  onRetry: () => void;
  sending: boolean;
}) {
  const mine = group.role === "customer";
  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      <p className="px-1 text-[11px] font-medium text-muted-foreground">
        {mine ? "You" : "FlowStack Support"}
      </p>
      {group.items.map((m, i) => (
        <MessageBubble
          key={m.id}
          message={m}
          mine={mine}
          last={i === group.items.length - 1}
          onRetry={onRetry}
          sending={sending}
        />
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  last,
  onRetry,
  sending,
}: {
  message: ChatMessage;
  mine: boolean;
  last: boolean;
  onRetry: () => void;
  sending: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const copy = async () => {
    if (!message.text) return;
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className={cn("group flex max-w-[88%] flex-col", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "animate-support-in space-y-2 rounded-2xl px-3 py-2 text-sm",
          mine
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground",
          message.failed && "opacity-60 ring-1 ring-destructive",
        )}
      >
        {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
        {message.attachments.map((a) =>
          a.url ? (
            <img
              key={a.id}
              src={a.url}
              alt={a.file_name}
              className="max-h-[160px] max-w-[220px] rounded-lg border border-border/40 object-contain"
            />
          ) : (
            <p key={a.id} className="text-xs opacity-80">
              {a.file_name}
            </p>
          ),
        )}
      </div>

      <div className="mt-0.5 flex items-center gap-1.5 px-1">
        <span className="text-[10px] text-muted-foreground">
          {message.pending
            ? "Sending…"
            : message.failed
              ? "Failed to send"
              : mine && last
                ? `Sent · ${timeLabel(message.timestamp)}`
                : timeLabel(message.timestamp)}
        </span>

        {message.failed && (
          <button
            type="button"
            onClick={onRetry}
            disabled={sending}
            aria-label="Retry message"
            className="text-[10px] font-medium text-destructive underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        )}

        {!mine && message.text && (
          <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={copy}
              aria-label="Copy response"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
            <button
              type="button"
              onClick={() => setVote(vote === "up" ? null : "up")}
              aria-label="Helpful response"
              aria-pressed={vote === "up"}
              className={cn(
                "rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                vote === "up" && "text-primary",
              )}
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setVote(vote === "down" ? null : "down")}
              aria-label="Unhelpful response"
              aria-pressed={vote === "down"}
              className={cn(
                "rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                vote === "down" && "text-destructive",
              )}
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
            {copied && <span className="text-[10px] text-muted-foreground">Copied</span>}
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- auth */

function AuthPanel() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw new Error("That email or password doesn't look right.");
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw new Error(signUpError.message);
        if (!data.session) setMessage("Check your inbox to confirm your email, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <p className="text-sm text-muted-foreground">
        Sign in so we can see your account and previous conversations.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="support-email">Email</Label>
        <Input
          id="support-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="support-password">Password</Label>
        <div className="relative">
          <Input
            ref={passwordRef}
            id="support-password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            className="pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => {
              setShowPassword((v) => !v);
              passwordRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setMessage(null);
        }}
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </Button>
    </form>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const { userId } = useCustomerSession();
  if (!userId) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={async () => {
        window.localStorage.removeItem(CONVERSATION_KEY(userId));
        await supabase.auth.signOut();
      }}
    >
      Sign out
    </Button>
  );
}
