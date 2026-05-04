import { NextRequest, NextResponse } from "next/server";
import { strapiUrl, getStrapiHeaders } from "@/lib/strapi/client";
import { REPORT_ADMIN_ACCESS_COOKIE } from "@/lib/report-auth";
import type { StrapiBooking, StrapiCollectionResponse, StrapiRoomSpace } from "@/lib/strapi/types";

const BOOKINGS_QUERY = "populate=*&pagination[pageSize]=1000&sort=date:desc";
const ROOM_SPACES_QUERY = "populate=*&pagination[pageSize]=200&sort=sortOrder:asc";

async function validateAdminAccessToken(token: string): Promise<boolean> {
  const res = await fetch(strapiUrl("/admin/users/me"), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return res.ok;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(REPORT_ADMIN_ACCESS_COOKIE)?.value?.trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ok = await validateAdminAccessToken(token);
  if (!ok) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    res.cookies.delete(REPORT_ADMIN_ACCESS_COOKIE);
    return res;
  }

  const apiToken = (process.env.STRAPI_API_TOKEN || "").trim();
  if (!apiToken) {
    return NextResponse.json(
      { error: "Server is missing STRAPI_API_TOKEN; report data cannot be loaded." },
      { status: 503 },
    );
  }

  const [bookingsRes, roomSpacesRes] = await Promise.all([
    fetch(strapiUrl(`/api/bookings?${BOOKINGS_QUERY}`), {
      headers: getStrapiHeaders(),
      cache: "no-store",
    }),
    fetch(strapiUrl(`/api/room-spaces?${ROOM_SPACES_QUERY}`), {
      headers: getStrapiHeaders(),
      cache: "no-store",
    }),
  ]);

  if (!bookingsRes.ok) {
    const text = await bookingsRes.text();
    return NextResponse.json(
      { error: "Failed to load bookings from Strapi", detail: text.slice(0, 300) },
      { status: 502 },
    );
  }

  const payload = (await bookingsRes.json()) as StrapiCollectionResponse<StrapiBooking>;
  let roomSpaces: StrapiRoomSpace[] = [];
  if (roomSpacesRes.ok) {
    const roomsPayload = (await roomSpacesRes.json()) as StrapiCollectionResponse<StrapiRoomSpace>;
    roomSpaces = roomsPayload?.data ?? [];
  }

  return NextResponse.json({ data: payload?.data ?? [], roomSpaces });
}
