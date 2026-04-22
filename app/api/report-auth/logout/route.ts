import { NextResponse } from "next/server";
import { REPORT_ADMIN_ACCESS_COOKIE } from "@/lib/report-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(REPORT_ADMIN_ACCESS_COOKIE);
  return res;
}
