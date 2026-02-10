import { NextResponse } from "next/server";
import { strapiUrl, getStrapiHeaders } from "@/lib/strapi/client";

/**
 * GET /api/strapi-check
 * Verifies Strapi URL and API token. Use this to debug 401 errors.
 * Returns { ok: true } if Strapi accepts the token, else { ok: false, error: "..." }.
 */
export async function GET() {
  const base = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");
  const token = (process.env.STRAPI_API_TOKEN || "").trim();

  if (!base) {
    return NextResponse.json(
      { ok: false, error: "NEXT_PUBLIC_STRAPI_URL is not set in .env.local" },
      { status: 200 }
    );
  }
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "STRAPI_API_TOKEN is not set in .env.local" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(strapiUrl("/api/bookings?pagination[pageSize]=1"), {
      headers: getStrapiHeaders(),
      cache: "no-store",
    });

    if (res.ok) {
      return NextResponse.json({ ok: true, message: "Strapi connection OK" });
    }
    if (res.status === 401) {
      return NextResponse.json({
        ok: false,
        error:
          "Strapi returned 401 Unauthorized. Create a new API token in Strapi: Admin → Settings → API Tokens → Create (Full access). Copy the token into visionary-house/.env.local as STRAPI_API_TOKEN=..., then restart the Next.js dev server.",
      });
    }
    const text = await res.text();
    return NextResponse.json({
      ok: false,
      error: `Strapi returned ${res.status}: ${text.slice(0, 200)}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({
      ok: false,
      error: `Request failed: ${msg}. Is Strapi running at ${base}?`,
    });
  }
}
