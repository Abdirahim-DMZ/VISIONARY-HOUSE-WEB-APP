/**
 * Reception login auth.
 * Validates against Strapi configs.reception entries.
 */

const RECEPTION_AUTH_KEY = "reception_auth";

export type ReceptionAuth = { email: string; name: string };

export async function receptionLogin(email: string, password: string): Promise<ReceptionAuth> {
  const res = await fetch("/api/reception-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Invalid email or password");
  }
  return { email, name: data.name || "" };
}

export function getReceptionAuth(): ReceptionAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RECEPTION_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReceptionAuth;
    if (parsed?.email) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function setReceptionAuth(auth: ReceptionAuth): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RECEPTION_AUTH_KEY, JSON.stringify(auth));
}

export function clearReceptionAuth(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RECEPTION_AUTH_KEY);
}
