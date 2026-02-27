"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/layout";
import { getEventChatSocket } from "@/lib/event-chat/socket";
import {
  getActiveChats,
  getMessages,
  clearChat,
  type EventChat,
  type EventChatMessage,
} from "@/lib/event-chat/api";
import { receptionLogin, getReceptionAuth, setReceptionAuth } from "@/lib/reception-auth";
import {
  Loader2,
  Send,
  MessageCircle,
  Bell,
  Trash2,
  LogIn,
  Eye,
  EyeOff,
  Search,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";
import type { MessagePayload } from "@/lib/event-chat/socket";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  return name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ReceptionPage() {
  const [auth, setAuth] = useState<{ email: string; name: string } | null | "pending">("pending");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [chats, setChats] = useState<EventChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<EventChat | null>(null);
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableTyping, setTableTyping] = useState(false);
  const [newChatNotification, setNewChatNotification] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  const selectedChatRef = useRef<EventChat | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const existing = getReceptionAuth();
    setAuth(existing ?? null);
  }, []);

  const handleLoginSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError("");
      if (!loginEmail.trim() || !loginPassword.trim()) {
        setLoginError("Email and password are required");
        return;
      }
      setLoggingIn(true);
      try {
        const authData = await receptionLogin(loginEmail.trim(), loginPassword);
        setReceptionAuth(authData);
        setAuth(authData);
        setLoginEmail("");
        setLoginPassword("");
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Invalid email or password");
      } finally {
        setLoggingIn(false);
      }
    },
    [loginEmail, loginPassword]
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getActiveChats();
        const seen = new Set<string>();
        const unique = (data || []).filter((c) => {
          const name =
            (c.table && typeof c.table === "object" && "name" in c.table
              ? (c.table as { name?: string }).name
              : c.documentId) || c.documentId;
          if (seen.has(name)) return false;
          seen.add(name);
          return true;
        });
        setChats(unique);

        const socket = getEventChatSocket();
        for (const c of data || []) {
          const roomId = `chat_${c.documentId}`;
          if (!joinedRoomsRef.current.has(roomId)) {
            socket.emit("join_room", roomId);
            joinedRoomsRef.current.add(roomId);
          }
        }

        socket.on("new_chat_started", (payload: { chatId: string; tableName?: string }) => {
          setNewChatNotification(payload.tableName || "New table");
          const roomId = `chat_${payload.chatId}`;
          if (!joinedRoomsRef.current.has(roomId)) {
            socket.emit("join_room", roomId);
            joinedRoomsRef.current.add(roomId);
          }
          getActiveChats().then(({ data }) => {
            const seen = new Set<string>();
            const unique = (data || []).filter((c) => {
              const name =
                (c.table && typeof c.table === "object" && "name" in c.table
                  ? (c.table as { name?: string }).name
                  : c.documentId) || c.documentId;
              if (seen.has(name)) return false;
              seen.add(name);
              return true;
            });
            setChats(unique);
          });
          setTimeout(() => setNewChatNotification(null), 5000);
        });

        socket.on("message", (payload: MessagePayload) => {
          const sel = selectedChatRef.current;
          if (payload.sender === "table") {
            if (tableTypingTimerRef.current) {
              clearTimeout(tableTypingTimerRef.current);
              tableTypingTimerRef.current = null;
            }
            setTableTyping(false);
          }
          if (payload.sender === "table" && payload.chatId) {
            const isSelected = sel && sel.documentId === payload.chatId;
            if (!isSelected) {
              setUnreadCounts((prev) => ({
                ...prev,
                [payload.chatId!]: (prev[payload.chatId!] ?? 0) + 1,
              }));
            }
          }
          setMessages((prev) => {
            if (sel && payload.chatId && payload.chatId !== sel.documentId) return prev;
            const last = prev[prev.length - 1];
            if (last && last.sender === payload.sender && last.message === payload.message) return prev;
            return [...prev, payload];
          });
        });

        socket.on("table_typing", () => {
          setTableTyping(true);
          if (tableTypingTimerRef.current) clearTimeout(tableTypingTimerRef.current);
          tableTypingTimerRef.current = setTimeout(() => {
            setTableTyping(false);
            tableTypingTimerRef.current = null;
          }, 3000);
        });
      } catch (e) {
        console.error("Reception load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  selectedChatRef.current = selectedChat;

  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }
    setUnreadCounts((prev) => ({ ...prev, [selectedChat.documentId]: 0 }));
    getMessages(selectedChat.documentId).then(({ data }) => {
      setMessages(
        (data || []).map((m: EventChatMessage) => ({
          sender: m.sender,
          message: m.message,
          createdAt: m.createdAt,
        }))
      );
    });
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedChat) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [selectedChat]);

  const emitTyping = useCallback(() => {
    if (!selectedChat) return;
    getEventChatSocket().emit("reception_typing", `chat_${selectedChat.documentId}`);
  }, [selectedChat]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(emitTyping, 200);
    },
    [emitTyping]
  );

  const send = useCallback(() => {
    if (!selectedChat || !input.trim()) return;
    const roomId = `chat_${selectedChat.documentId}`;
    const msg = input.trim();
    const payload: MessagePayload = {
      sender: "reception",
      message: msg,
      createdAt: new Date().toISOString(),
      chatId: selectedChat.documentId,
    };
    setMessages((prev) => [...prev, payload]);
    setInput("");
    getEventChatSocket().emit("send_message", { roomId, sender: "reception", message: msg });
  }, [selectedChat, input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
  };

  const handleClearChat = useCallback(() => {
    if (!selectedChat) return;
    toast("Clear all messages in this chat?", {
      classNames: {
        toast: "!bg-card !border-border !shadow-elevated !rounded-xl !p-5",
        title: "!text-foreground !font-semibold !text-base !mb-3",
        actionButton: "!bg-destructive !text-white hover:!opacity-90 !rounded-lg !px-4 !py-2 !font-medium",
        cancelButton:
          "!bg-muted/70 hover:!bg-muted !text-muted-foreground !border !border-border !rounded-lg !px-4 !py-2 !font-medium",
      },
      action: {
        label: "Clear",
        onClick: async () => {
          try {
            await clearChat(selectedChat.documentId);
            setMessages([]);
            toast.success("Chat cleared");
          } catch {
            toast.error("Failed to clear chat");
          }
        },
      },
      cancel: { label: "Cancel" },
    });
  }, [selectedChat]);

  const tableName = (c: EventChat) => {
    const name =
      c.table && typeof c.table === "object" && "name" in c.table
        ? (c.table as { name?: string }).name
        : undefined;
    return (name && String(name).trim()) || c.documentId || "Table";
  };

  const filteredChats = chats.filter((c) =>
    tableName(c).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (auth === "pending" || loading) {
    return (
      <Layout bare>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "hsl(var(--primary))" }}
          >
            <MessageCircle className="h-7 w-7" style={{ color: "hsl(var(--primary-foreground))" }} />
          </div>
          <div className="flex items-center gap-2" style={{ color: "hsl(var(--muted-foreground))" }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{auth === "pending" ? "Verifying…" : "Loading reception…"}</span>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Login ──────────────────────────────────────────────────────────────────
  if (auth === null) {
    return (
      <Layout bare>
        <div
          className="min-h-screen flex items-center justify-center px-4 py-12"
          style={{ background: "hsl(var(--background))" }}
        >
          {/* background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-30"
              style={{ background: "hsl(var(--accent))" }}
            />
            <div
              className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full blur-3xl opacity-10"
              style={{ background: "hsl(var(--primary))" }}
            />
          </div>

          <div className="relative w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center mb-7">
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "hsl(var(--primary))",
                  boxShadow: "0 12px 32px -6px hsl(var(--primary) / 0.45)",
                }}
              >
                <MessageCircle className="h-8 w-8" style={{ color: "hsl(var(--primary-foreground))" }} />
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 20px 60px -12px hsl(var(--primary) / 0.15)",
              }}
            >
              {/* Gold top strip */}
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--accent)), hsl(38 70% 65%), hsl(var(--accent)))" }}
              />

              <div className="px-7 py-8">
                <div className="text-center mb-7">
                  <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    Welcome back
                  </h1>
                  <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Reception dashboard · Visionary House
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="rx-email"
                      className="block text-sm font-medium"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      Email
                    </label>
                    <input
                      id="rx-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="receptionist@example.com"
                      autoComplete="email"
                      disabled={loggingIn}
                      className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "hsl(var(--muted))",
                        border: "1.5px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "hsl(var(--accent))";
                        e.target.style.boxShadow = "0 0 0 3px hsl(var(--accent) / 0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "hsl(var(--border))";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="rx-password"
                      className="block text-sm font-medium"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="rx-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        disabled={loggingIn}
                        className="w-full h-11 px-4 pr-11 rounded-xl text-sm outline-none transition-all"
                        style={{
                          background: "hsl(var(--muted))",
                          border: "1.5px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "hsl(var(--accent))";
                          e.target.style.boxShadow = "0 0 0 3px hsl(var(--accent) / 0.15)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "hsl(var(--border))";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div
                      className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm"
                      style={{
                        background: "hsl(var(--destructive) / 0.08)",
                        border: "1px solid hsl(var(--destructive) / 0.25)",
                        color: "hsl(var(--destructive))",
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "hsl(var(--destructive))" }} />
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                    style={{
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                      boxShadow: "0 4px 16px -4px hsl(var(--primary) / 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                    }}
                  >
                    {loggingIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    {loggingIn ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </div>
            </div>

            <p className="text-center text-xs mt-5" style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>
              Visionary House · Reception Portal
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Chat app ────────────────────────────────────────────────────────────────
  const agentName = typeof auth === "object" && auth !== null ? auth.name || auth.email : "";
  const agentEmail = typeof auth === "object" && auth !== null ? auth.email : "";

  return (
    <Layout bare>
      {/* Full-screen container */}
      <div
        className="h-[100dvh] w-full flex flex-col overflow-hidden"
        style={{ background: "hsl(var(--background))" }}
      >
        {/* ── New chat notification toast ─────────────────────────────────── */}
        {newChatNotification && (
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl animate-fade-in-up max-w-xs w-[calc(100%-2rem)]"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 8px 30px -4px hsl(var(--primary) / 0.5)",
              border: "1px solid hsl(var(--primary-foreground) / 0.1)",
            }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "hsl(var(--accent))" }}
            >
              <Bell className="h-3.5 w-3.5" style={{ color: "hsl(var(--accent-foreground))" }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight">New table connected</p>
              <p className="text-[11px] truncate" style={{ color: "hsl(var(--primary-foreground) / 0.65)" }}>
                {newChatNotification} has joined
              </p>
            </div>
          </div>
        )}

        {/* ── Layout: sidebar + chat ──────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 h-full">

          {/* ════════════════════════ SIDEBAR ══════════════════════════════ */}
          {/*
            Mobile: show ONLY when no chat is selected (selectedChat === null)
            Desktop (md+): always visible as a fixed-width panel
          */}
          <aside
            className={cn(
              "flex flex-col shrink-0",
              "w-full md:w-[300px] lg:w-[320px]",
              /* mobile visibility toggle */
              selectedChat ? "hidden md:flex" : "flex"
            )}
            style={{
              background: "hsl(var(--card))",
              borderRight: "1px solid hsl(var(--border))",
            }}
          >
            {/* Sidebar header */}
            <div
              className="px-4 pt-5 pb-4 shrink-0"
              style={{ borderBottom: "1px solid hsl(var(--border) / 0.7)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "hsl(var(--primary))" }}
                  >
                    <MessageCircle
                      className="h-4.5 w-4.5"
                      style={{ color: "hsl(var(--accent))", height: "1.1rem", width: "1.1rem" }}
                    />
                  </div>
                  <div>
                    <h1
                      className="text-sm font-bold leading-tight"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      Reception
                    </h1>
                    <p className="text-[11px] leading-tight" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Live table chat
                    </p>
                  </div>
                </div>

                {totalUnread > 0 && (
                  <span
                    className="flex h-6 min-w-6 items-center justify-center rounded-full text-[11px] font-bold px-1.5"
                    style={{
                      background: "hsl(var(--accent))",
                      color: "hsl(var(--accent-foreground))",
                      boxShadow: "0 2px 8px hsl(var(--accent) / 0.4)",
                    }}
                  >
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                  style={{ color: "hsl(var(--muted-foreground) / 0.55)" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tables…"
                  className="w-full h-9 rounded-lg text-sm outline-none transition-all"
                  style={{
                    paddingLeft: "2rem",
                    paddingRight: "0.75rem",
                    background: "hsl(var(--muted))",
                    border: "1.5px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "hsl(var(--accent))";
                    e.target.style.boxShadow = "0 0 0 3px hsl(var(--accent) / 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "hsl(var(--border))";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Section label */}
            <div className="px-4 pt-3 pb-1.5 shrink-0">
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}
              >
                Active Tables · {filteredChats.length}
              </p>
            </div>

            {/* Chat list */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-2 pb-4 space-y-0.5">
                {filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div
                      className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: "hsl(var(--muted))" }}
                    >
                      <MessageCircle
                        className="h-6 w-6"
                        style={{ color: "hsl(var(--muted-foreground) / 0.35)" }}
                      />
                    </div>
                    <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground) / 0.55)" }}>
                      {searchQuery ? "No tables found" : "No active chats"}
                    </p>
                    <p
                      className="text-xs mt-1 leading-relaxed"
                      style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}
                    >
                      {searchQuery
                        ? "Try a different search"
                        : "Tables appear when they scan a QR code"}
                    </p>
                  </div>
                ) : (
                  filteredChats.map((c) => {
                    const name = tableName(c);
                    const isSelected = selectedChat?.documentId === c.documentId;
                    const unread = unreadCounts[c.documentId] ?? 0;

                    return (
                      <button
                        key={c.documentId}
                        type="button"
                        onClick={() => setSelectedChat(c)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group active:scale-[0.98]"
                        style={{
                          background: isSelected
                            ? "hsl(var(--accent) / 0.12)"
                            : "transparent",
                          border: isSelected
                            ? "1.5px solid hsl(var(--accent) / 0.35)"
                            : "1.5px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--muted))";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback
                              className="text-sm font-bold"
                              style={{
                                background: isSelected
                                  ? "hsl(var(--accent))"
                                  : "hsl(var(--secondary))",
                                color: isSelected
                                  ? "hsl(var(--accent-foreground))"
                                  : "hsl(var(--primary))",
                              }}
                            >
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Online dot */}
                          <span
                            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2"
                            style={{
                              background: "#34d399",
                              borderColor: "hsl(var(--card))",
                            }}
                          />
                          {unread > 0 && (
                            <span
                              className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1"
                              style={{
                                background: "hsl(var(--accent))",
                                color: "hsl(var(--accent-foreground))",
                                boxShadow: "0 1px 4px hsl(var(--accent) / 0.5)",
                              }}
                            >
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-[14px] truncate leading-tight",
                              unread > 0 || isSelected ? "font-semibold" : "font-medium"
                            )}
                            style={{
                              color: isSelected
                                ? "hsl(var(--foreground))"
                                : "hsl(var(--foreground) / 0.85)",
                            }}
                          >
                            {name}
                          </p>
                          <p
                            className="text-[12px] mt-0.5 truncate"
                            style={{
                              color: unread > 0
                                ? "hsl(var(--accent))"
                                : "hsl(var(--muted-foreground) / 0.6)",
                              fontWeight: unread > 0 ? 600 : 400,
                            }}
                          >
                            {unread > 0
                              ? `${unread} new message${unread > 1 ? "s" : ""}`
                              : "Active table chat"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Agent footer */}
            {agentName && (
              <div
                className="px-4 py-3 shrink-0 flex items-center gap-2.5"
                style={{
                  borderTop: "1px solid hsl(var(--border) / 0.6)",
                  background: "hsl(var(--muted) / 0.5)",
                }}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{
                      background: "hsl(var(--primary))",
                      color: "hsl(var(--accent))",
                    }}
                  >
                    {getInitials(agentName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight" style={{ color: "hsl(var(--foreground))" }}>
                    {agentName}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {agentEmail}
                  </p>
                </div>
                <span
                  className="flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0"
                  style={{
                    background: "hsl(142 72% 29% / 0.12)",
                    color: "hsl(142 72% 29%)",
                    border: "1px solid hsl(142 72% 29% / 0.25)",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#22c55e" }} />
                  Online
                </span>
              </div>
            )}
          </aside>

          {/* ════════════════════════ CHAT AREA ════════════════════════════ */}
          {/*
            Mobile: show ONLY when a chat is selected
            Desktop (md+): always visible as the main panel
          */}
          <main
            className={cn(
              "flex flex-col min-w-0 flex-1",
              selectedChat ? "flex" : "hidden md:flex"
            )}
            style={{ background: "hsl(var(--background))" }}
          >
            {selectedChat ? (
              <>
                {/* Chat header */}
                <header
                  className="flex items-center gap-3 px-4 py-3 shrink-0"
                  style={{
                    background: "hsl(var(--card))",
                    borderBottom: "1px solid hsl(var(--border) / 0.7)",
                    boxShadow: "0 1px 4px hsl(var(--primary) / 0.06)",
                  }}
                >
                  {/* Back button — mobile only */}
                  <button
                    type="button"
                    className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors active:scale-95"
                    style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                    onClick={() => setSelectedChat(null)}
                    aria-label="Back to chat list"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className="text-sm font-bold"
                        style={{
                          background: "hsl(var(--accent))",
                          color: "hsl(var(--accent-foreground))",
                        }}
                      >
                        {getInitials(tableName(selectedChat))}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2"
                      style={{ background: "#34d399", borderColor: "hsl(var(--card))" }}
                    />
                  </div>

                  {/* Name + status */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-[15px] leading-tight truncate"
                      style={{ color: "hsl(var(--foreground))" }}
                    >
                      {tableName(selectedChat)}
                    </p>
                    <div className="h-4 flex items-center">
                      {tableTyping ? (
                        <span
                          className="text-xs font-medium italic animate-pulse"
                          style={{ color: "hsl(var(--accent))" }}
                        >
                          typing…
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#34d399" }} />
                          Active now
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Clear button */}
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all duration-150 shrink-0"
                    style={{
                      color: "hsl(var(--muted-foreground))",
                      border: "1px solid hsl(var(--border))",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.color = "hsl(var(--destructive))";
                      el.style.borderColor = "hsl(var(--destructive) / 0.4)";
                      el.style.background = "hsl(var(--destructive) / 0.06)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.color = "hsl(var(--muted-foreground))";
                      el.style.borderColor = "hsl(var(--border))";
                      el.style.background = "transparent";
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </header>

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto px-4 py-5 custom-scrollbar"
                  style={{
                    background: "hsl(var(--muted) / 0.35)",
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.6) 1px, transparent 0)",
                    backgroundSize: "22px 22px",
                  }}
                >
                  <div className="max-w-xl mx-auto space-y-2.5">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div
                          className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
                          style={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            boxShadow: "0 4px 16px hsl(var(--primary) / 0.06)",
                          }}
                        >
                          <MessageCircle className="h-6 w-6" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }} />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground) / 0.55)" }}>
                          No messages yet
                        </p>
                        <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}>
                          Start the conversation below
                        </p>
                      </div>
                    )}

                    {messages.map((m, i) => {
                      const isReception = m.sender === "reception";
                      const prevMsg = i > 0 ? messages[i - 1] : null;
                      const showLabel = !prevMsg || prevMsg.sender !== m.sender;
                      const isLast = i === messages.length - 1 || messages[i + 1]?.sender !== m.sender;

                      return (
                        <div
                          key={i}
                          className={cn("flex", isReception ? "justify-end" : "justify-start")}
                        >
                          <div className={cn("flex flex-col max-w-[78%] sm:max-w-[65%]", isReception ? "items-end" : "items-start")}>
                            {showLabel && (
                              <span
                                className="text-[10px] font-semibold uppercase tracking-wider mb-1 px-1"
                                style={{ color: "hsl(var(--muted-foreground) / 0.45)" }}
                              >
                                {isReception ? "You" : tableName(selectedChat)}
                              </span>
                            )}
                            <div
                              className={cn(
                                "px-4 py-2.5 text-[14px] leading-[1.55]",
                                isReception
                                  ? cn("rounded-2xl rounded-br-sm", !isLast && "rounded-br-2xl rounded-tr-sm")
                                  : cn("rounded-2xl rounded-bl-sm", !isLast && "rounded-bl-2xl rounded-tl-sm")
                              )}
                              style={
                                isReception
                                  ? {
                                      background: "hsl(var(--primary))",
                                      color: "hsl(var(--primary-foreground))",
                                      boxShadow: "0 1px 3px hsl(var(--primary) / 0.25)",
                                    }
                                  : {
                                      background: "hsl(var(--card))",
                                      color: "hsl(var(--foreground))",
                                      border: "1px solid hsl(var(--border) / 0.8)",
                                      boxShadow: "0 1px 3px hsl(var(--primary) / 0.07)",
                                    }
                              }
                            >
                              <p className="whitespace-pre-wrap break-words">{m.message}</p>
                              <div
                                className={cn(
                                  "flex items-center gap-1 mt-1.5",
                                  isReception ? "justify-end" : "justify-start"
                                )}
                              >
                                <span
                                  className="text-[10px]"
                                  style={{
                                    color: isReception
                                      ? "hsl(var(--primary-foreground) / 0.45)"
                                      : "hsl(var(--muted-foreground) / 0.55)",
                                  }}
                                >
                                  {formatTime(m.createdAt)}
                                </span>
                                {isReception && (
                                  <CheckCheck
                                    className="h-3 w-3"
                                    style={{ color: "hsl(var(--accent))" }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing indicator */}
                    {tableTyping && (
                      <div className="flex justify-start">
                        <div
                          className="px-4 py-3 rounded-2xl rounded-bl-sm"
                          style={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border) / 0.8)",
                            boxShadow: "0 1px 3px hsl(var(--primary) / 0.07)",
                          }}
                        >
                          <span className="inline-flex items-center gap-1">
                            {["-0.32s", "-0.16s", "0s"].map((delay, idx) => (
                              <span
                                key={idx}
                                className="h-2 w-2 rounded-full animate-bounce"
                                style={{
                                  background: "hsl(var(--muted-foreground) / 0.45)",
                                  animationDelay: delay,
                                }}
                              />
                            ))}
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input bar */}
                <div
                  className="px-4 py-3 shrink-0"
                  style={{
                    background: "hsl(var(--card))",
                    borderTop: "1px solid hsl(var(--border) / 0.7)",
                  }}
                >
                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2.5 max-w-xl mx-auto"
                  >
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        placeholder={`Message ${tableName(selectedChat)}…`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                          }
                        }}
                        className="w-full h-11 px-4 rounded-xl text-[14px] outline-none transition-all"
                        style={{
                          background: "hsl(var(--muted))",
                          border: "1.5px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "hsl(var(--accent))";
                          e.target.style.boxShadow = "0 0 0 3px hsl(var(--accent) / 0.15)";
                          e.target.style.background = "hsl(var(--card))";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "hsl(var(--border))";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = "hsl(var(--muted))";
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150 active:scale-95"
                      style={
                        input.trim()
                          ? {
                              background: "hsl(var(--accent))",
                              color: "hsl(var(--accent-foreground))",
                              boxShadow: "0 4px 14px hsl(var(--accent) / 0.4)",
                            }
                          : {
                              background: "hsl(var(--muted))",
                              color: "hsl(var(--muted-foreground) / 0.4)",
                              cursor: "not-allowed",
                            }
                      }
                    >
                      <Send style={{ height: "1.05rem", width: "1.05rem" }} />
                    </button>
                  </form>

                  {/* Hint — hidden on smallest screens */}
                  <p
                    className="text-center text-[10px] mt-1.5 hidden sm:block"
                    style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}
                  >
                    Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              /* Empty state — desktop only (mobile always shows sidebar when no chat) */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-5">
                  <div
                    className="h-24 w-24 rounded-3xl flex items-center justify-center"
                    style={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 8px 30px hsl(var(--primary) / 0.1)",
                    }}
                  >
                    <MessageCircle className="h-10 w-10" style={{ color: "hsl(var(--muted-foreground) / 0.3)" }} />
                  </div>
                  {chats.length > 0 && (
                    <span
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "hsl(var(--accent))",
                        color: "hsl(var(--accent-foreground))",
                        boxShadow: "0 2px 8px hsl(var(--accent) / 0.4)",
                      }}
                    >
                      {chats.length}
                    </span>
                  )}
                </div>

                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ color: "hsl(var(--foreground) / 0.75)" }}
                >
                  Select a conversation
                </h2>
                <p
                  className="text-sm max-w-xs leading-relaxed"
                  style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}
                >
                  Choose a table from the sidebar to view messages and reply
                </p>

                {/* Quick-pick shortcuts */}
                {chats.length > 0 && (
                  <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                    {chats.slice(0, 3).map((c) => {
                      const name = tableName(c);
                      const unread = unreadCounts[c.documentId] ?? 0;
                      return (
                        <button
                          key={c.documentId}
                          type="button"
                          onClick={() => setSelectedChat(c)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98]"
                          style={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            color: "hsl(var(--foreground) / 0.7)",
                            boxShadow: "0 1px 4px hsl(var(--primary) / 0.05)",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.borderColor = "hsl(var(--accent) / 0.5)";
                            el.style.background = "hsl(var(--accent) / 0.06)";
                            el.style.color = "hsl(var(--foreground))";
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.borderColor = "hsl(var(--border))";
                            el.style.background = "hsl(var(--card))";
                            el.style.color = "hsl(var(--foreground) / 0.7)";
                          }}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback
                              className="text-xs font-bold"
                              style={{
                                background: "hsl(var(--secondary))",
                                color: "hsl(var(--primary))",
                              }}
                            >
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-left truncate">{name}</span>
                          {unread > 0 && (
                            <span
                              className="flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold px-1 shrink-0"
                              style={{
                                background: "hsl(var(--accent))",
                                color: "hsl(var(--accent-foreground))",
                              }}
                            >
                              {unread}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    {chats.length > 3 && (
                      <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground) / 0.45)" }}>
                        +{chats.length - 3} more in the sidebar
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
