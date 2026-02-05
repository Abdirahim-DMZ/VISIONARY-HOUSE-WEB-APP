import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { strapiUrl, getStrapiHeaders } from "@/lib/strapi/client";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export type VerifyPaymentBody = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId?: string | number;
  referenceNumber?: string;
};

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

/**
 * POST /api/razorpay/verify-payment
 * Verifies Razorpay payment signature and updates the booking in Strapi to confirmed.
 */
export async function POST(request: NextRequest) {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay secret not configured. See docs/RAZORPAY_SETUP.md" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as VerifyPaymentBody;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, referenceNumber } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature" },
        { status: 400 }
      );
    }

    const valid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      RAZORPAY_KEY_SECRET
    );
    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const strapiBase = process.env.NEXT_PUBLIC_STRAPI_URL;
    const token = process.env.STRAPI_API_TOKEN;
    if (!strapiBase || !token) {
      return NextResponse.json(
        { error: "Strapi not configured" },
        { status: 503 }
      );
    }

    // Find booking by referenceNumber (preferred) or bookingId
    let docId: string | number | null = bookingId ?? null;
    if (!docId && referenceNumber) {
      const listRes = await fetch(
        strapiUrl(
          `/api/bookings?filters[referenceNumber][$eq]=${encodeURIComponent(referenceNumber)}&fields[0]=documentId&fields[1]=id`
        ),
        { headers: getStrapiHeaders() }
      );
      if (listRes.ok) {
        const list = await listRes.json();
        const first = list?.data?.[0];
        docId = first?.documentId ?? first?.id ?? null;
      }
    }

    if (docId == null) {
      return NextResponse.json(
        { error: "Booking not found. Provide bookingId or referenceNumber." },
        { status: 404 }
      );
    }

    // Strapi v5 uses documentId for update; v4 may use id. Try documentId first.
    const updateRes = await fetch(strapiUrl(`/api/bookings/${docId}`), {
      method: "PUT",
      headers: getStrapiHeaders(),
      body: JSON.stringify({
        data: {
          status: "confirmed",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date().toISOString(),
        },
      }),
    });

    if (!updateRes.ok) {
      const text = await updateRes.text();
      console.error("Strapi update booking error:", updateRes.status, text);
      return NextResponse.json(
        { error: "Failed to confirm booking" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed",
    });
  } catch (e) {
    console.error("Verify payment error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
