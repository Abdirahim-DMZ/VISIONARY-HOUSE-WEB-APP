/**
 * POST /api/event-chat/action/start
 * Proxies to Strapi event-chat-socket plugin or implements start logic.
 */
import { NextRequest, NextResponse } from "next/server";

const STRAPI = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { slug?: string };
    const slug = (body?.slug ?? "").toString().trim();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const res = await fetch(`${STRAPI}/api/event-chat-routes/action/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || `Start failed: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("[event-chat start]", e);
    return NextResponse.json({ error: "Failed to start chat" }, { status: 500 });
  }
}
