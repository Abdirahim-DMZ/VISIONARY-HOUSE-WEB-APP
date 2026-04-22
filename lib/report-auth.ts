/** HttpOnly cookie storing Strapi admin access token (same token returned by POST /admin/login). */

export const REPORT_ADMIN_ACCESS_COOKIE = "vh_report_admin_access";

/** Session length for the web report tool (re-login after expiry). */
export const REPORT_ACCESS_MAX_AGE_SEC = 60 * 60 * 12;

export function getReportAccessCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}
