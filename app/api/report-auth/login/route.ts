import { NextRequest, NextResponse } from "next/server";
import { strapiUrl } from "@/lib/strapi/client";
import {
  REPORT_ADMIN_ACCESS_COOKIE,
  getReportAccessCookieOptions,
  REPORT_ACCESS_MAX_AGE_SEC,
} from "@/lib/report-auth";

type AdminLoginJson = {
  data?: { token?: string; accessToken?: string };
};

export async function POST(request: NextRequest) {
  try {
    const base = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim();
    if (!base) {
      return NextResponse.json({ error: "Strapi URL is not configured" }, { status: 500 });
    }

    const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
    const email = (body?.email ?? "").toString().trim();
    const password = (body?.password ?? "").toString();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const res = await fetch(strapiUrl("/admin/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => ({}))) as AdminLoginJson;
    if (!res.ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = json?.data?.token ?? json?.data?.accessToken;
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Unexpected login response from Strapi" }, { status: 502 });
    }

    const out = NextResponse.json({ ok: true });
    out.cookies.set(REPORT_ADMIN_ACCESS_COOKIE, token, getReportAccessCookieOptions(REPORT_ACCESS_MAX_AGE_SEC));
    return out;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
