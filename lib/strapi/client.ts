/**
 * Strapi REST API client.
 * Base URL and token read from env at runtime so API routes always use current credentials.
 */

function getStrapiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim().replace(/\/$/, "");
}

export const strapiUrl = (path: string) => {
  const base = getStrapiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

/** Read token at call time so server-side requests always use current env (avoids 401 from stale/missing token). Token is trimmed to avoid copy-paste whitespace. */
export function getStrapiHeaders(): HeadersInit {
  const token = (process.env.STRAPI_API_TOKEN || "").trim();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
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
  return Boolean(getStrapiBaseUrl());
}
