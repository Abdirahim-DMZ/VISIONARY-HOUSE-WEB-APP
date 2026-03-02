/**
 * GET /api/chat-settings
 * Returns chat quick action buttons from Strapi (Chat setting single type).
 * Used by the chat page to render dynamic quick action buttons.
 */
import { NextResponse } from "next/server";
import { strapiUrl, getStrapiHeaders, isStrapiConfigured } from "@/lib/strapi/client";

export type QuickActionItem = {
  icon: string;
  displayTitle: string;
  internalTitle: string;
};

export type ChatSettingsResponse = {
  quickActions: QuickActionItem[];
};

export async function GET() {
  if (!isStrapiConfigured()) {
    return NextResponse.json({ quickActions: [] } satisfies ChatSettingsResponse);
  }
  try {
    const url = strapiUrl("/api/chat-setting?populate=quickActions");
    const res = await fetch(url, {
      headers: getStrapiHeaders(),
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error("[chat-settings] Strapi error", res.status, await res.text());
      return NextResponse.json({ quickActions: [] } satisfies ChatSettingsResponse);
    }
    const json = (await res.json()) as {
      data?: Record<string, unknown> | null;
    };
    const data = json?.data;
    const rawActions = Array.isArray(data?.quickActions) ? data.quickActions : [];
    const quickActions: QuickActionItem[] = rawActions
      .filter(
        (a: unknown): a is Record<string, unknown> =>
          a != null && typeof a === "object" && typeof (a as Record<string, unknown>).internalTitle === "string"
      )
      .map((a) => ({
        icon: String(a.icon ?? "HelpCircle").trim(),
        displayTitle: String(a.displayTitle ?? "").trim(),
        internalTitle: String(a.internalTitle ?? "").trim(),
      }))
      .filter((a) => a.displayTitle && a.internalTitle);
    return NextResponse.json({ quickActions } satisfies ChatSettingsResponse);
  } catch (e) {
    console.error("[chat-settings]", e);
    return NextResponse.json({ quickActions: [] } satisfies ChatSettingsResponse);
  }
}
