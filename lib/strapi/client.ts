/**
 * Strapi REST API client.
 * Base URL from env; used for all Strapi fetches.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

export const strapiUrl = (path: string) => {
  const base = STRAPI_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

export function getStrapiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (STRAPI_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${STRAPI_TOKEN}`;
  }
  return headers;
}

export async function strapiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = strapiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: { ...getStrapiHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strapi ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_URL);
}
