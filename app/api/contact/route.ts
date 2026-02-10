import { NextRequest, NextResponse } from "next/server";
import { strapiUrl, getStrapiHeaders } from "@/lib/strapi/client";

export type ContactRequestBody = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

/**
 * POST /api/contact
 * Saves contact form submission to Strapi (contact-submissions collection).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactRequestBody;
    const { name, email, phone, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, message" },
        { status: 400 }
      );
    }

    const strapiBase = process.env.NEXT_PUBLIC_STRAPI_URL;
    const token = process.env.STRAPI_API_TOKEN;
    if (!strapiBase || !token) {
      return NextResponse.json(
        { error: "Strapi not configured (NEXT_PUBLIC_STRAPI_URL, STRAPI_API_TOKEN)" },
        { status: 503 }
      );
    }

    const res = await fetch(strapiUrl("/api/contact-submissions"), {
      method: "POST",
      headers: getStrapiHeaders(),
      body: JSON.stringify({
        data: {
          fullName: name.trim(),
          email: email.trim(),
          phone: phone?.trim() || null,
          subject: subject.trim(),
          message: message.trim(),
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Strapi contact submission error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to save your message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent.",
    });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
