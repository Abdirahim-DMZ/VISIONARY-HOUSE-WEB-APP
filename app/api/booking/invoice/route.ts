import { NextRequest, NextResponse } from "next/server";
import { strapiUrl, getStrapiHeaders } from "@/lib/strapi/client";
import type { InvoiceBookingData } from "@/lib/invoice-pdf";

// PDFKit requires Node.js runtime (Buffer, streams). Edge would fail.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/booking/invoice?reference=...&email=...
 * Fetches the booking from Strapi using the same REST API as "Find My Booking",
 * then generates the invoice PDF in Next.js.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");
  const email = searchParams.get("email");

  if (!reference?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Missing reference or email" },
      { status: 400 }
    );
  }

  if (!(process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || "").trim()) {
    return NextResponse.json(
      { error: "Strapi not configured" },
      { status: 502 }
    );
  }

  const ref = reference.trim();
  const em = email.trim();

  try {
    // Same REST URL that works for "Find My Booking" (bookings list with filters)
    const fetchUrl = strapiUrl(
      `/api/bookings?filters[referenceNumber][$eq]=${encodeURIComponent(ref)}&filters[customerEmail][$eq]=${encodeURIComponent(em)}&populate=*`
    );

    const res = await fetch(fetchUrl, {
      method: "GET",
      headers: getStrapiHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[api/booking/invoice] Strapi fetch booking failed:", res.status, text);
      return NextResponse.json(
        { error: "Could not load booking. Please try again." },
        { status: 502 }
      );
    }

    const json = await res.json();
    // Strapi REST: { data: [ item ] } (collection) or { data: item }
    const data = json?.data;
    const list = Array.isArray(data) ? data : data != null ? [data] : [];
    const rawBooking = list[0] as Record<string, unknown> | undefined;

    if (!rawBooking) {
      return NextResponse.json(
        { error: "Booking not found or not eligible for invoice" },
        { status: 404 }
      );
    }

    // Normalize: Strapi 5 REST can return flat or { id, documentId, attributes: { ... } }
    const booking = (rawBooking.attributes ?? rawBooking) as Record<string, unknown>;

    const statusRaw = (booking.statusOfBooking ?? rawBooking.statusOfBooking ?? "") as string;
    const status = String(statusRaw).trim().toLowerCase();
    if (status !== "confirm" && status !== "partial payment") {
      return NextResponse.json(
        { error: "Booking not found or not eligible for invoice" },
        { status: 404 }
      );
    }

    let invoiceData: InvoiceBookingData;
    try {
      const { buildInvoiceDataFromBooking, generateInvoicePdf } = await import("@/lib/invoice-pdf");
      invoiceData = buildInvoiceDataFromBooking(booking);
      const pdfBuffer = await generateInvoicePdf(invoiceData);

      const filename = `invoice-${invoiceData.referenceNumber}.pdf`;
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(pdfBuffer.length),
        },
      });
    } catch (inner) {
      const innerErr = inner instanceof Error ? inner : new Error(String(inner));
      console.error("[api/booking/invoice] build/generate failed:", innerErr.message, innerErr.stack);
      throw inner;
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[api/booking/invoice]", err.message, err.stack);
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        error: "Failed to generate invoice",
        ...(isDev && { detail: err.message, stack: err.stack }),
      },
      { status: 500 }
    );
  }
}
