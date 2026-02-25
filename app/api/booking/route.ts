import { NextRequest, NextResponse } from "next/server";
import { strapiUrl } from "@/lib/strapi/client";
import { generateBookingReference } from "@/lib/utils/booking-utils";

export type BookingResponse = {
  id: number;
  documentId: string;
  referenceNumber: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  roomSpace?: string;
  status: string;
  attendees?: number;
  customerName?: string;
};

export type CreateBookingBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  guestType?: string;
  /** Event type name/label (text field, not a relation) */
  eventType: string;
  /** Strapi service documentId or id */
  serviceId?: number;
  /** Alternatively pass service slug (e.g. event-space) to resolve serviceId from Strapi */
  serviceSlug?: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  attendees?: number;
  roomSpace?: string;
  /** Layout: numeric id or Strapi documentId (string) for relation */
  layout?: string | number;
  /** Add-ons: numeric ids and/or Strapi documentIds for relation */
  addOnIds?: (number | string)[];
  message?: string;
  totalPrice: number;
  currency?: string;
};

/**
 * POST /api/booking
 * Creates a booking in Strapi. Status is not sent; Strapi uses schema default (statusOfBooking: Pending).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookingBody;
    const {
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      guestType,
      eventType,
      serviceId: bodyServiceId,
      serviceSlug,
      date,
      endDate,
      startTime,
      endTime,
      attendees,
      roomSpace,
      layout,
      addOnIds,
      message,
      totalPrice,
      currency = "USD",
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !date || !startTime || !endTime || totalPrice == null) {
      return NextResponse.json(
        { error: "Missing required fields: customerName, customerEmail, customerPhone, date, startTime, endTime, totalPrice" },
        { status: 400 }
      );
    }
    if (layout == null || layout === "" || (typeof layout === "string" && !layout.trim())) {
      return NextResponse.json(
        { error: "Service Layout is required." },
        { status: 400 }
      );
    }

    const referenceNumber = generateBookingReference();
    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");
    const token = (process.env.STRAPI_API_TOKEN || "").trim();
    if (!strapiBase || !token) {
      return NextResponse.json(
        { error: "Strapi not configured (NEXT_PUBLIC_STRAPI_URL, STRAPI_API_TOKEN)" },
        { status: 503 }
      );
    }

    const strapiHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    let serviceId = bodyServiceId;
    if (serviceId == null && serviceSlug) {
      const listRes = await fetch(
        strapiUrl(`/api/services?filters[slug][$eq]=${encodeURIComponent(serviceSlug)}&fields[0]=documentId&fields[1]=id`),
        { headers: strapiHeaders }
      );
      if (listRes.ok) {
        const list = await listRes.json();
        const first = list?.data?.[0];
        serviceId = first?.documentId ?? first?.id ?? null;
      }
    }

    // Strapi v5 requires documentId for relations (not numeric id). Resolve layout and addOns to documentIds.
    let layoutDocumentId: string | null = null;
    if (layout != null && layout !== undefined && layout !== "") {
      const layoutVal = typeof layout === "string" ? layout.trim() : String(layout);
      const isLikelyDocumentId = /^[a-z0-9]{20,}$/i.test(layoutVal) && !/^\d+$/.test(layoutVal);
      if (isLikelyDocumentId) {
        layoutDocumentId = layoutVal;
      } else {
        const idNum = typeof layout === "number" ? layout : parseInt(layoutVal, 10);
        if (!Number.isNaN(idNum)) {
          const layoutRes = await fetch(
            strapiUrl(`/api/service-layouts?filters[id][$eq]=${idNum}&fields[0]=documentId&fields[1]=id`),
            { headers: strapiHeaders }
          );
          if (layoutRes.ok) {
            const layoutList = await layoutRes.json();
            const layoutDoc = layoutList?.data?.[0];
            layoutDocumentId = layoutDoc?.documentId ?? null;
          }
        }
      }
    }

    let addOnDocumentIds: string[] = [];
    if (addOnIds?.length) {
      const documentIdCandidates = addOnIds.filter(
        (x): x is string => typeof x === "string" && /^[a-z0-9]{20,}$/i.test(x) && !/^\d+$/.test(x)
      );
      const numericIds: number[] = [];
      for (const x of addOnIds) {
        if (typeof x === "number" && !Number.isNaN(x)) numericIds.push(x);
        else if (typeof x === "string" && /^\d+$/.test(x)) numericIds.push(parseInt(x, 10));
      }
      if (numericIds.length > 0) {
        const inParams = numericIds.map((id, i) => `filters[id][$in][${i}]=${id}`).join("&");
        const addOnRes = await fetch(
          strapiUrl(`/api/add-ons?${inParams}&fields[0]=documentId&fields[1]=id`),
          { headers: strapiHeaders }
        );
        if (addOnRes.ok) {
          const addOnList = await addOnRes.json();
          const items = addOnList?.data ?? [];
          addOnDocumentIds = items.map((item: { documentId?: string }) => item?.documentId).filter(Boolean);
        }
      }
      addOnDocumentIds = [...addOnDocumentIds, ...documentIdCandidates];
    }

    // Strapi v5 create: POST /api/bookings with { data: { ... } }
    // For relations use connect: [documentId] (array of documentId strings)
    // Do not send status - Strapi uses schema default or rejects the key
    const payload: Record<string, unknown> = {
      referenceNumber,
      customerName,
      customerEmail,
      customerPhone,
      companyName: companyName || null,
      guestType: guestType || null,
      eventType: eventType || null, // eventType is a text field, not a relation
      date,
      endDate: endDate || null,
      startTime,
      endTime,
      attendees: attendees ?? null,
      roomSpace: roomSpace || null,
      message: message || null,
      totalPrice: Number(totalPrice),
      currency,
    };

    // Service relation (many-to-one) – Strapi v5 accepts id or documentId for connect
    if (serviceId != null && serviceId !== undefined) {
      payload.service = { connect: [serviceId] };
    }

    // Layout relation (manyToMany in Strapi, field name is "layouts") – Strapi v5 requires documentId in connect
    if (layoutDocumentId) {
      payload.layouts = { connect: [layoutDocumentId] };
    }

    // AddOns relation (many-to-many) – Strapi v5 requires documentIds in connect
    if (addOnDocumentIds.length > 0) {
      payload.addOns = { connect: addOnDocumentIds };
    }

    const res = await fetch(strapiUrl("/api/bookings"), {
      method: "POST",
      headers: strapiHeaders,
      body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Strapi create booking error:", res.status, text);
      const is401 = res.status === 401;
      const userMessage = is401
        ? "Strapi rejected the API token. In Strapi Admin go to Settings → API Tokens, create a Full access token (or Custom with Bookings/Services access), copy it into .env.local as STRAPI_API_TOKEN, then restart the Next.js dev server."
        : "Failed to create booking";
      return NextResponse.json(
        { error: userMessage, details: text },
        { status: 502 }
      );
    }

    const created = await res.json();
    const bookingId = created?.data?.id ?? created?.data?.documentId ?? created?.data?.document?.id;

    // Pending email is sent by Strapi when the booking is created (Document Service middleware)
    return NextResponse.json({
      success: true,
      referenceNumber,
      bookingId,
    });
  } catch (e) {
    console.error("Booking create error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/booking?date=YYYY-MM-DD
 * Fetches bookings for a specific date for availability checking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Missing required parameter: date" },
        { status: 400 }
      );
    }

    const strapiBase = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");
    const token = (process.env.STRAPI_API_TOKEN || "").trim();
    if (!strapiBase || !token) {
      return NextResponse.json(
        { error: "Strapi not configured" },
        { status: 503 }
      );
    }

    const strapiHeaders: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Fetch all bookings for the date; include statusOfBooking for availability (only Confirm/Partial Payment/Pay Later block slots)
    const url = strapiUrl(
      `/api/bookings?filters[date][$eq]=${encodeURIComponent(date)}&fields[0]=referenceNumber&fields[1]=date&fields[2]=endDate&fields[3]=startTime&fields[4]=endTime&fields[5]=roomSpace&fields[6]=attendees&fields[7]=statusOfBooking`
    );

    const res = await fetch(url, {
      headers: strapiHeaders,
      next: { revalidate: 0 }, // Don't cache - need real-time data
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Strapi fetch bookings error:", res.status, text);
      const is401 = res.status === 401;
      const userMessage = is401
        ? "Strapi rejected the API token. In Strapi Admin go to Settings → API Tokens, create a Full access token, copy it into .env.local as STRAPI_API_TOKEN, then restart the Next.js dev server."
        : "Failed to fetch bookings";
      return NextResponse.json(
        { error: userMessage, details: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const bookings = (data?.data || []).map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      referenceNumber: item.referenceNumber,
      date: item.date,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      roomSpace: item.roomSpace,
      status: item.statusOfBooking ?? item.status ?? undefined,
      attendees: item.attendees,
    }));

    return NextResponse.json({ bookings });
  } catch (e) {
    console.error("Booking fetch error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
