import { NextRequest, NextResponse } from "next/server";

type ContactPageApiResponse = {
  data?: {
    id?: number;
    attributes?: {
      address?: string | null;
      contactPhoneNo?: string | null;
      contactEmail?: string | null;
    };
    address?: string | null;
    contactPhoneNo?: string | null;
    contactEmail?: string | null;
  } | null;
};

function getStrapiBase() {
  return (process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const base = getStrapiBase();
  if (!base) {
    return NextResponse.json({ error: "Strapi base URL is not configured." }, { status: 500 });
  }

  // Prevent accidental self-calls (Next app calling its own /api/contact-page recursively).
  if (base.includes(request.nextUrl.host)) {
    return NextResponse.json(
      { error: "Invalid Strapi base URL. Set STRAPI_URL (e.g. http://localhost:1337)." },
      { status: 500 },
    );
  }

  const url = `${base}/api/contact-page?populate[heroBackgroundImage][populate]=true`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(process.env.STRAPI_API_TOKEN?.trim()
          ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN.trim()}` }
          : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Failed to fetch contact page", detail: text.slice(0, 300) }, { status: 502 });
    }

    const json = (await res.json()) as ContactPageApiResponse;
    const raw = json?.data;
    const attributes = raw?.attributes;
    const address = (attributes?.address ?? raw?.address ?? "").toString().trim();
    const contactPhoneNo = (attributes?.contactPhoneNo ?? raw?.contactPhoneNo ?? "").toString().trim();
    const contactEmail = (attributes?.contactEmail ?? raw?.contactEmail ?? "").toString().trim();

    return NextResponse.json({
      data: { address, contactPhoneNo, contactEmail },
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch contact page data." }, { status: 500 });
  }
}

