import { NextRequest, NextResponse } from "next/server";
import { strapiUrl, getStrapiHeaders } from "@/lib/strapi/client";
import { generateBookingReference } from "@/lib/utils/booking-utils";

export type CreateBookingBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
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
  layoutId?: number;
  addOnIds?: number[];
  message?: string;
  totalPrice: number;
  currency?: string;
};

/**
 * POST /api/booking
 * Creates a booking in Strapi with status pending_payment and returns reference + bookingId.
 * Call this before opening Razorpay checkout.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookingBody;
    const {
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      eventType,
      serviceId: bodyServiceId,
      serviceSlug,
      date,
      endDate,
      startTime,
      endTime,
      attendees,
      layoutId,
      addOnIds,
      message,
      totalPrice,
      currency = "INR",
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !date || !startTime || !endTime || totalPrice == null) {
      return NextResponse.json(
        { error: "Missing required fields: customerName, customerEmail, customerPhone, date, startTime, endTime, totalPrice" },
        { status: 400 }
      );
    }

    const referenceNumber = generateBookingReference();
    const strapiBase = process.env.NEXT_PUBLIC_STRAPI_URL;
    const token = process.env.STRAPI_API_TOKEN;
    if (!strapiBase || !token) {
      return NextResponse.json(
        { error: "Strapi not configured (NEXT_PUBLIC_STRAPI_URL, STRAPI_API_TOKEN)" },
        { status: 503 }
      );
    }

    let serviceId = bodyServiceId;
    if (serviceId == null && serviceSlug) {
      const listRes = await fetch(
        strapiUrl(`/api/services?filters[slug][$eq]=${encodeURIComponent(serviceSlug)}&fields[0]=documentId&fields[1]=id`),
        { headers: getStrapiHeaders() }
      );
      if (listRes.ok) {
        const list = await listRes.json();
        const first = list?.data?.[0];
        serviceId = first?.documentId ?? first?.id ?? null;
      }
    }

    // Strapi v4/v5 create: POST /api/bookings with { data: { ... } }
    const payload: Record<string, unknown> = {
      referenceNumber,
      customerName,
      customerEmail,
      customerPhone,
      companyName: companyName || null,
      eventType: eventType || null,
      date,
      endDate: endDate || null,
      startTime,
      endTime,
      attendees: attendees ?? null,
      message: message || null,
      status: "pending_payment",
      totalPrice: Number(totalPrice),
      currency,
    };

    if (serviceId != null && serviceId !== undefined) {
      payload.service = serviceId;
    }
    if (layoutId != null) {
      payload.layout = layoutId;
    }
    if (addOnIds?.length) {
      payload.addOns = addOnIds;
    }

    const res = await fetch(strapiUrl("/api/bookings"), {
      method: "POST",
      headers: getStrapiHeaders(),
      body: JSON.stringify({ data: payload }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Strapi create booking error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to create booking", details: text },
        { status: 502 }
      );
    }

    const created = await res.json();
    const bookingId = created?.data?.id ?? created?.data?.documentId ?? created?.data?.document?.id;
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
