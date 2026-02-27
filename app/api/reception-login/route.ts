/**
 * POST /api/reception-login
 * Validates reception credentials against Strapi configs.reception.
 */
import { NextRequest, NextResponse } from "next/server";
import { strapiUrl, getStrapiHeaders } from "@/lib/strapi/client";

type ReceptionEntry = { name?: string; email?: string; password?: string; attributes?: { email?: string; password?: string } };

const DEBUG = process.env.RECEPTION_LOGIN_DEBUG === "true";

function log(...args: unknown[]) {
  console.log("[reception-login]", ...args);
}

function logDebug(...args: unknown[]) {
  if (DEBUG) console.log("[reception-login]", ...args);
}

function extractReception(data: unknown): ReceptionEntry[] | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  let rec = d.reception;
  if (Array.isArray(rec)) return rec as ReceptionEntry[];
  const attrs = d.attributes as Record<string, unknown> | undefined;
  if (attrs && Array.isArray(attrs.reception)) return attrs.reception as ReceptionEntry[];
  return undefined;
}

function getEntryEmail(entry: ReceptionEntry): string {
  const e = entry.email ?? (entry.attributes as Record<string, unknown>)?.email;
  return (e ?? "").toString().trim().toLowerCase();
}

function getEntryPassword(entry: ReceptionEntry): string {
  const p = entry.password ?? (entry.attributes as Record<string, unknown>)?.password;
  return (p ?? "").toString();
}

function getEntryName(entry: ReceptionEntry): string {
  const n = entry.name ?? (entry.attributes as Record<string, unknown>)?.name;
  return (n ?? "").toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const password = body?.password ?? "";
    log("attempt email=%s passwordLen=%d", email || "(empty)", password?.length ?? 0);

    if (!email || !password) {
      log("reject: missing email or password");
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const base = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");
    const receptionSecret = (process.env.RECEPTION_API_SECRET || "").trim();
    const token = (process.env.STRAPI_API_TOKEN || "").trim();
    if (!base) {
      log("error: missing NEXT_PUBLIC_STRAPI_URL");
      return NextResponse.json({ error: "Server not configured for reception login" }, { status: 500 });
    }
    if (!receptionSecret && !token) {
      log("error: set RECEPTION_API_SECRET (or STRAPI_API_TOKEN) in .env.local");
      return NextResponse.json({ error: "Server not configured for reception login" }, { status: 500 });
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(receptionSecret ? { "X-Reception-Secret": receptionSecret } : token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const urls = [
      strapiUrl("/api/configs?populate[reception]=true"),
      strapiUrl("/api/site-configs?populate[reception]=true"),
    ];
    let json: { data?: unknown; error?: unknown } | null = null;
    let lastStatus = 0;

    for (const configsUrl of urls) {
      log("fetching", configsUrl, receptionSecret ? "(X-Reception-Secret)" : "(Bearer token)");
      const res = await fetch(configsUrl, {
        headers,
        cache: "no-store",
      });
      lastStatus = res.status;
      if (res.ok) {
        json = (await res.json()) as { data?: unknown };
        log("configs ok status=%d hasData=%s", res.status, !!json?.data);
        break;
      }
      const text = await res.text();
      log("configs fail url=%s status=%d body=%s", configsUrl, res.status, text.slice(0, 200));
    }

    if (!json?.data) {
      log("reject: no configs data (lastStatus=%d)", lastStatus);
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const reception = extractReception(json.data);
    log("reception count=%d emails=%s", Array.isArray(reception) ? reception.length : 0,
      Array.isArray(reception) ? reception.map((e) => getEntryEmail(e)).join(",") : "none");
    logDebug("reception raw", JSON.stringify(reception?.slice(0, 1)));

    if (!Array.isArray(reception) || reception.length === 0) {
      log("reject: no reception array or empty");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const bcrypt = await import("bcryptjs");
    for (const entry of reception) {
      const entryEmail = getEntryEmail(entry);
      if (entryEmail !== email) continue;

      const stored = getEntryPassword(entry);
      if (!stored) {
        log("skip: no password for", entryEmail);
        continue;
      }

      const isBcrypt = typeof stored === "string" && stored.startsWith("$2");
      const isEncrypted = typeof stored === "string" && stored.startsWith("__REC_AES:");
      log("comparing email=%s isBcrypt=%s isEncrypted=%s storedLen=%d", entryEmail, isBcrypt, isEncrypted, stored.length);

      let match = false;
      if (isEncrypted) {
        log("reject: AES encrypted password - Strapi decrypt middleware should run; check Bearer token");
        continue;
      }
      if (isBcrypt) {
        match = await bcrypt.compare(password, stored);
      } else {
        match = password === stored;
        if (!match) logDebug("plain mismatch input=%s stored=%s", JSON.stringify(password), JSON.stringify(stored).slice(0, 20));
      }

      if (match) {
        log("success name=%s", getEntryName(entry));
        return NextResponse.json({ ok: true, name: getEntryName(entry) });
      }
      log("password mismatch for", entryEmail);
    }

    log("reject: no matching entry or password");
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  } catch (e) {
    console.error("[reception-login] error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
