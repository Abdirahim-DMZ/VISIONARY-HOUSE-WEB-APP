"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getEventChatSocket } from "@/lib/event-chat/socket";
import { startChat, getMessages, type EventChat, type EventChatMessage } from "@/lib/event-chat/api";
import { getChatQuickActionIcon } from "@/lib/chat-quick-actions";
import { Loader2, Send, MessageCircle } from "lucide-react";
import type { MessagePayload } from "@/lib/event-chat/socket";

type QuickActionItem = { displayTitle: string; internalTitle: string; icon: string };

const FALLBACK_QUICK_ACTIONS: QuickActionItem[] = [
  { icon: "Droplets", displayTitle: "Need water", internalTitle: "We need water please." },
  { icon: "UserCircle", displayTitle: "Need assistance", internalTitle: "We need assistance." },
  { icon: "Phone", displayTitle: "Call manager", internalTitle: "Could someone from management come to our table?" },
  { icon: "Receipt", displayTitle: "Bill request", internalTitle: "We would like to request the bill." },
];

export default function ChatSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [chat, setChat] = useState<EventChat | null>(null);
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receptionTyping, setReceptionTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickActionItem[]>(FALLBACK_QUICK_ACTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const roomIdRef = useRef<string | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    fetch("/api/chat-settings")
      .then((res) => res.json())
      .then((data: { quickActions?: QuickActionItem[] }) => {
        if (Array.isArray(data.quickActions) && data.quickActions.length > 0) {
          setQuickActions(data.quickActions);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await startChat(slug);
        if (cancelled) return;
        setChat(data);
        const chatId = (data as EventChat).documentId;
        roomIdRef.current = `chat_${chatId}`;

        const { data: list } = await getMessages(chatId);
        if (cancelled) return;
        setMessages(
          (list || []).map((m: EventChatMessage) => ({
            sender: m.sender,
            message: m.message,
            createdAt: m.createdAt,
          }))
        );

        const socket = getEventChatSocket();
        socket.emit("join_room", roomIdRef.current);

        socket.on("message", (payload: MessagePayload) => {
          if (payload.sender === "reception") setReceptionTyping(false);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.sender === payload.sender && last.message === payload.message) return prev;
            return [...prev, payload];
          });
        });
        socket.on("chat_cleared", () => setMessages([]));
        socket.on("reception_typing", () => {
          setReceptionTyping(true);
          setTimeout(() => setReceptionTyping(false), 3000);
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to start chat");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const emitTyping = useCallback(() => {
    const roomId = roomIdRef.current;
    if (!roomId) return;
    getEventChatSocket().emit("table_typing", roomId);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(emitTyping, 200);
    },
    [emitTyping]
  );

  const send = useCallback((text: string) => {
    const roomId = roomIdRef.current;
    if (!roomId || !text.trim()) return;
    const msg = text.trim();
    const payload: MessagePayload = { sender: "table", message: msg, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, payload]);
    setInput("");
    const socket = getEventChatSocket();
    socket.emit("send_message", { roomId, sender: "table", message: msg });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const tableName = chat?.table && typeof chat.table === "object" && "name" in chat.table ? chat.table.name : slug || "Table";

  if (loading) {
    return (
      <Layout bare>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Connecting to reception…</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout bare>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <p className="text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">Please check the QR code or try again later.</p>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout bare>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Connected to Reception — {tableName}</h1>
            </div>
            <p className="text-base text-muted-foreground">Send a message or use a quick button below.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((q, idx) => {
                const Icon = getChatQuickActionIcon(q.icon);
                return (
                  <Button
                    key={`${q.displayTitle}-${idx}`}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={() => send(q.internalTitle)}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {q.displayTitle}
                  </Button>
                );
              })}
            </div>
            <div
              ref={chatContainerRef}
              className="rounded-lg border bg-muted/30 min-h-[280px] max-h-[420px] overflow-y-auto p-4 space-y-2"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.sender === "table" ? "justify-end" : "justify-start"}`}
                >
                  <span
                    className={`rounded-lg px-3 py-2 text-base max-w-[85%] ${
                      m.sender === "table"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.message}
                  </span>
                </div>
              ))}
              {receptionTyping && (
                <div className="flex justify-start">
                  <span className="rounded-lg px-3 py-2 text-base bg-muted text-muted-foreground italic">
                    Reception is typing…
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message…"
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
