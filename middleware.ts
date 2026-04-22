import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REPORT_ADMIN_ACCESS_COOKIE } from "@/lib/report-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/report")) {
    return NextResponse.next();
  }
  if (pathname === "/report/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(REPORT_ADMIN_ACCESS_COOKIE)?.value?.trim();
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/report/login";
    url.searchParams.set("redirect", pathname + (request.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/report", "/report/:path*"],
};
