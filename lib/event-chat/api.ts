/**
 * Event chat API helpers.
 * Chat is temporary only – no DB persistence. Uses Strapi (plugin event-chat-socket) for
 * start, rooms, messages, and Socket.io – all in a single backend.
 */

const STRAPI = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");

export type EventTable = { documentId: string; name: string; qrSlug: string; isActive?: boolean };
export type EventChat = {
  documentId: string;
  table?: EventTable | { documentId?: string; name?: string };
  status: string;
};
export type EventChatMessage = {
  sender: "table" | "reception";
  message: string;
  createdAt?: string;
};

export async function startChat(slug: string): Promise<{ data: EventChat }> {
  const res = await fetch(`${STRAPI}/api/event-chat-socket/action/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Start chat failed: ${res.status}`);
  }
  return res.json();
}

export async function getActiveChats(): Promise<{ data: EventChat[] }> {
  const res = await fetch(`${STRAPI}/api/event-chat-socket/rooms`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Active chats failed: ${res.status}`);
  return res.json();
}

export async function getMessages(chatDocumentId: string): Promise<{ data: EventChatMessage[] }> {
  const res = await fetch(`${STRAPI}/api/event-chat-socket/rooms/${encodeURIComponent(chatDocumentId)}/messages`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Messages failed: ${res.status}`);
  return res.json();
}

export async function clearChat(chatDocumentId: string): Promise<{ ok: boolean }> {
  const res = await fetch(`${STRAPI}/api/event-chat-socket/rooms/${encodeURIComponent(chatDocumentId)}/messages`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Clear chat failed: ${res.status}`);
  return res.json();
}
