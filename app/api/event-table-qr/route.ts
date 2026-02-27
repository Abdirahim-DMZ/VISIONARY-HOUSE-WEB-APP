import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SIZE = 400;

/**
 * GET /api/event-table-qr?slug=table-1
 * Returns a PNG QR code that encodes the chat page URL.
 * When scanned, opens: {origin}/chat/{slug}
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  const size = Math.min(1024, Math.max(128, parseInt(searchParams.get("size") || String(DEFAULT_SIZE), 10) || DEFAULT_SIZE));

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const baseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || "").trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    request.nextUrl.origin;
  const chatUrl = `${baseUrl.replace(/\/$/, "")}/chat/${encodeURIComponent(slug)}`;

  try {
    const png = await QRCode.toBuffer(chatUrl, {
      type: "png",
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("[event-table-qr]", e);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
