import { NextRequest, NextResponse } from "next/server";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export type CreateOrderBody = {
  amount: number; // in paise (INR) or smallest currency unit
  currency?: string;
  receipt?: string;
  bookingId?: string | number;
  referenceNumber?: string;
};

/**
 * POST /api/razorpay/create-order
 * Creates a Razorpay order and returns order_id and key_id for the checkout.
 * Amount must be in paise (e.g. 50000 = ₹500).
 */
export async function POST(request: NextRequest) {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay keys not configured. See docs/RAZORPAY_SETUP.md" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as CreateOrderBody;
    const { amount, currency = "INR", receipt, referenceNumber } = body;

    if (amount == null || amount < 1) {
      return NextResponse.json({ error: "Invalid amount (must be in paise)" }, { status: 400 });
    }

    // Use Razorpay REST API (no SDK required for create order)
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(RAZORPAY_KEY_ID + ":" + RAZORPAY_KEY_SECRET).toString("base64"),
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency,
        receipt: receipt || referenceNumber || `ref-${Date.now()}`,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Razorpay create order error:", res.status, err);
      return NextResponse.json(
        { error: err?.error?.description || "Failed to create Razorpay order" },
        { status: 502 }
      );
    }

    const order = await res.json();
    return NextResponse.json({
      orderId: order.id,
      keyId: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (e) {
    console.error("Razorpay create-order error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
