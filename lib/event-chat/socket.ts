"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337").replace(/\/$/, "");

let socket: Socket | null = null;

export function getEventChatSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, { path: "/socket.io", transports: ["websocket", "polling"] });
  }
  return socket;
}

export function getSocketUrl(): string {
  return SOCKET_URL;
}

export type MessagePayload = { sender: "table" | "reception"; message: string; createdAt?: string; chatId?: string };
